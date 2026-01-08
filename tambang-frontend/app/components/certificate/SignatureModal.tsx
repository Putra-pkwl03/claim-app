"use client";

import React, { useRef, useState } from "react";
import { submitSignature, getMySignature } from "@/lib/api/Signature";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  claim: any;
  role: "surveyor" | "managerial" | "finance" | "contractor";
  onClose: () => void;
  onToast: (data: { message: string; type: "success" | "error" }) => void;
}

export default function SignatureModal({
  claim,
  role,
  onClose,
  onToast,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [file, setFile] = useState<File | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  /* ===== Canvas logic ===== */
  const startDraw = (e: any) => {
    if (mode !== "draw") return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || mode !== "draw") return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const resetDraw = () => {
    setSignatureBase64(null);
    clearCanvas();
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // console.log("Submitting for surveyorClaimId:", claim.surveyorClaimId); // <- log di sini dulu
      if (!claim.surveyorClaimId) {
        onToast({ message: "Surveyor Claim ID belum tersedia", type: "error" });
        setLoading(false);
        return;
      }

      if (mode === "upload") {
        if (!file) return;
        await submitSignature(claim.surveyorClaimId, {
          role,
          signature_file: file,
        });
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const base64 = canvas.toDataURL("image/png");
        await submitSignature(claim.surveyorClaimId, {
          role,
          signature_base64: base64,
        });
      }

      onToast({
        message: "Tanda tangan berhasil disimpan",
        type: "success",
      });

      onClose();
    } catch (error) {
      onToast({
        message: "Gagal menyimpan tanda tangan",
        type: "error",
      });
      console.error("Error submitting signature:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSignature = async () => {
      try {
        const data = await getMySignature(claim.surveyorClaimId, role);
        // console.log("DATA SIGNATURE FROM API:", data); // <- log di sini

        if (!data) return;

        if (data.signature_base64) {
          // console.log("Found base64 signature"); // debug
          setMode("draw");
          setExistingSignature({
            type: "base64",
            value: data.signature_base64,
          });
          setSignatureBase64(data.signature_base64);
          preloadCanvas(data.signature_base64);
        }

        if (data.signature_url) {
          // console.log("Found file signature:", data.signature_url); // debug
          setMode("upload");
          setExistingSignature({
            type: "file",
            value: data.signature_url,
          });
          setPreviewUrl(data.signature_url);
        }
      } catch (err) {
        console.error("Gagal load signature:", err);
      }
    };

    loadSignature();
  }, [claim.surveyorClaimId, role]);

  const preloadCanvas = (base64: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = base64;
  };

  const [existingSignature, setExistingSignature] = useState<{
    type: "base64" | "file";
    value: string;
  } | null>(null);

  const isSubmitDisabled = loading || (mode === "upload" && !file);

  // Tambahkan useEffect baru untuk mode "draw"
  useEffect(() => {
    if (mode === "draw" && existingSignature?.type === "base64") {
      setSignatureBase64(existingSignature.value); // set base64
      preloadCanvas(existingSignature.value); // preload ke canvas
    }
  }, [mode, existingSignature]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">
              Claim Signature
            </h3>
            <p className="text-xs text-gray-500">
              No Klaim:{" "}
              {claim?.surveyor_claim_id?.claim_number ?? claim?.claim_number}{" "}
              For Certificate EOM
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 -mt-10 -mr-4 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ===== Content ===== */}
        <div className="px-6 py-5 space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            {/* Live Image (Draw) */}
            <button
              onClick={() => {
                setMode("draw");
                setFile(null); // reset file user kalau ada
                setPreviewUrl(null); // reset preview
                // jangan langsung setSignatureBase64 atau preloadCanvas di sini
              }}
              className={`flex-1 py-2 text-sm rounded-md border transition cursor-pointer
    ${
      mode === "draw"
        ? "bg-blue-100 text-blue-800 border-blue-600"
        : "bg-white text-gray-700 hover:bg-blue-100 hover:border-blue-600 hover:text-blue-800"
    }`}
            >
              Live Image
            </button>

            {/* Upload File */}
            <button
              onClick={() => {
                setMode("upload");
                setFile(null); // reset file user kalau ada
                setPreviewUrl(null); // reset preview
                // jangan reset signatureBase64, biarkan tetap ada
              }}
              className={`flex-1 py-2 text-sm rounded-md border transition cursor-pointer
    ${
      mode === "upload"
        ? "bg-blue-100 text-blue-800 border-blue-600"
        : "bg-white text-gray-700 hover:bg-blue-100 hover:border-blue-600 hover:text-blue-800"
    }`}
            >
              Upload File
            </button>
          </div>

          {/* Canvas */}
          {mode === "draw" && (
            <>
              <p className="text-sm text-gray-600">
                Please sign in the area below.
              </p>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={170}
                  className="w-full h-[170px] bg-white rounded-lg cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={clearCanvas}
                  className="text-xs text-gray-500 hover:text-red-700 cursor-pointer"
                >
                  Clean signature
                </button>
              </div>
            </>
          )}

          {/* Upload */}
          {mode === "upload" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Upload file tanda tangan
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) handleFile(droppedFile);
                }}
                className={`relative flex flex-col items-center justify-center
        rounded-2xl border-2 border-dashed p-6 transition-all w-full h-[232px]
        ${
          isDragging
            ? "border-indigo-600 bg-indigo-100 scale-[1.01]"
            : file
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
              >
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {/* ===== EMPTY STATE ===== */}
                {!file && !isDragging && (
                  <>
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16.5A4.5 4.5 0 018.5 12H9"
                      />
                    </svg>

                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-indigo-600">
                        Klik untuk upload
                      </span>{" "}
                      atau drag & drop file di sini
                    </p>

                    <p className="text-xs text-gray-400">
                      PNG, JPG, JPEG, PDF • Maks 10MB
                    </p>
                  </>
                )}

                {/* ===== DRAGGING STATE ===== */}
                {isDragging && !file && (
                  <>
                    <p className="text-sm font-medium text-indigo-700">
                      Lepaskan file untuk upload
                    </p>
                  </>
                )}

                {/* ===== FILE PREVIEW ===== */}
                {mode === "upload" &&
                  (file || previewUrl || existingSignature) && (
                    <div className="w-full flex flex-col items-center gap-3">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview TTD"
                          className="max-h-[120px] rounded-md border shadow-sm object-contain"
                        />
                      ) : existingSignature ? (
                        existingSignature.type === "file" ? (
                          <img
                            src={existingSignature.value}
                            alt="Existing signature"
                            className="max-h-[120px] rounded-md border shadow-sm object-contain"
                          />
                        ) : null
                      ) : null}

                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-800">
                          {file?.name ||
                            (existingSignature &&
                            existingSignature.type === "file"
                              ? "Existing signature"
                              : "")}
                        </p>
                        {file && (
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                          // jangan hapus existingSignature di sini
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Ganti file
                      </button>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* ===== Footer ===== */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cencel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className=" cursor-pointer px-4 py-2 text-sm rounded-md bg-blue-400 text-white hover:bg-blue-500 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : previewUrl || signatureBase64
              ? "Update Signature"
              : "Save Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}
