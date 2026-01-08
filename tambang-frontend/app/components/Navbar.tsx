"use client";
import clsx from "clsx";
import { usePageTitle } from "../../context/PageTitleContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation"; // untuk cek route
import ProfileModal from "../components/users/ProfileModal";
import Toast from "../components/ui/Toast";
import ClaimSettingsModal from "../components/settings/ClaimSettingsModal";

export default function Navbar({ isCollapsed }: { isCollapsed: boolean }) {
  const { title } = usePageTitle();
  const { user, logout } = useAuth();
  const pathname = usePathname(); // ambil path saat ini

  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const initials =
    user?.name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  // klik di luar dropdown untuk menutup
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // cek apakah halaman dashboard
  const isDashboard = pathname === "/";

  return (
    <>
      {/* Navbar */}
      <div
        className={clsx(
          // bg transparent jika dashboard, bg-gray-100 jika bukan
          isDashboard ? "bg-transparent border-b-0 shadow-none" : "bg-gray-100 border-b border-gray-200 shadow",
          "h-14 flex items-center justify-between px-4 lg:px-8 fixed top-0 z-20 transition-all duration-300",
          isCollapsed ? "left-14 w-[calc(100%-3.5rem)]" : "left-54 w-[calc(100%-13.5rem)]"
        )}
      >
        <h1 className={clsx("text-xl font-bold", isDashboard ? "text-gray-200" : "text-gray-600")}>{title}</h1>


        <div className="flex items-center gap-4 relative">

          {/* Email Icon */}
          <a href={`mailto:${user?.email}`} className="relative hover:text-blue-600">
            📧
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1">
              3
            </span>
          </a>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Notification Icon */}
          <button className="relative hover:text-blue-600">
            🔔
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full text-xs px-1">
              5
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* User Dropdown Trigger */}
          <div
            ref={triggerRef}
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center cursor-pointer gap-2"
          >
           <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gray-700">
            <img
              src={
                user?.photo
                  ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${user.photo}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4B6280&color=fff`
              }
              alt={user?.name || "User"}
              className="w-full h-full object-cover"
            />
          </div>
           <span
  className={clsx(
    "flex items-center gap-1",
    isDashboard ? "text-gray-200 hover:text-blue-200" : "text-gray-600 hover:text-blue-900"
  )}
>
  {user?.name || "User"} ▼
</span>

          </div>
          {/* Dropdown Menu */}
            {open && (
              <div
                ref={dropdownRef}
                className="absolute right-0 top-[100%] mt-2 bg-white shadow border rounded-md overflow-hidden"
              >
                <button
                  onClick={() => {
                    setShowModal(true);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  My Account
                </button>

                {/* Claim Settings — hanya admin */}
                {(user?.role?.includes("admin") || user?.roles?.some((r: { name: string; }) => r.name === "admin")) && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowClaimModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Claim Settings
                  </button>
                )}

                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
        </div>
      </div>

      <ClaimSettingsModal
        open={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSave={(value: any) => {
        setShowClaimModal(false);

        setToast(null);

        setTimeout(() => {
          setToast({ message: "Ambang batas disimpan!", type: "success" });
        }, 200);

        // console.log("Ambang batas claim:", value);
      }}

      />

      {/* Modal + Toast */}
      <ProfileModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(msg) => {
          setToast(null); 
          setTimeout(() => setToast({ message: msg, type: "success" }), 10);
        }}
        onError={(msg) => {
          setToast(null);
          setTimeout(() => setToast({ message: msg, type: "error" }), 10);
        }}
      />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
