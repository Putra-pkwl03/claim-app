"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "../../../../context/PageTitleContext";
import { getContractorClaims } from "@/lib/api/certificate";
import Toast from "@/app/components/ui/Toast";
import CertificateTable from "@/app/components/certificate/CertificateTable";

export default function CertificatePage() {
  const { setTitle } = usePageTitle();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setTitle("Certificate EOM");

    const fetchData = async () => {
      try {
        const data = await getContractorClaims();
        // console.log("fect data dri api", (data))
        setClaims(data);
      } catch (err: any) {
        console.error(err);
        setToast({ message: err.message || "Failed to fetch contractor claims", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setTitle]);

  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} />}
<div className="mt-12">

      {/* Table component */}
      <CertificateTable claims={claims} loading={loading} />
</div>
    </div>
  );
}
