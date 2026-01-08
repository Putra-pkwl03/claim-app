"use client";

import React, { useEffect, useState } from "react";
import ManagerialClaimTable from "../../components/finance/FinanceClaimTable";
import { usePageTitle } from "@/context/PageTitleContext";
import { getAllClaimsForFinance } from "@/lib/api/finance";
import SkeletonClaimTable from "../../components/ui/SkeletonClaimTable";
import Toast from "@/app/components/ui/Toast";

/* =======================
   Interfaces
======================= */

interface Material {
  material_name: string;
}

interface SurveyorClaim {
  id: number;
  claim_number: string;
}

interface Block {
  block_id: number;
  block_name: string;

  contractor: {
    bcm: string;
    amount: string;
    date: string;
    note: string;
    materials: Material[];
    file: string | null;
  };

  surveyor: {
    bcm: string;
    amount: string;
    date: string;
    note: string;
    materials: Material[];
    file: string | null;
  } | null;

  selisih_bcm: number;
  selisih_persen: number;
  within_threshold: boolean;
  threshold_limit: number;
  is_surveyed: boolean;
}


interface Site {
  id: number;
  no: string;
  name: string;
}

interface Pit {
  id: number;
  no: string;
  name: string;
}

interface Claim {
  id: number;
  claim_number: string;
  surveyor_claim: SurveyorClaim | null; 

  site: Site;
  pit: Pit;

  period_month: number;
  period_year: number;
  job_type: string;
  status: string;

  contractor_name: string;
  total_bcm_contractor: string;
  total_amount_contractor: string;

  surveyor_name: string;
  total_bcm_surveyor: string;
  total_amount_surveyor: string;

  status_surveyor_claim: string;
  status_contractor_claim: string;

  blocks: Block[];
}


/* =======================
   Page
======================= */

export default function ManagerialClaimPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Claim Control");

    const fetchClaims = async () => {
      try {
        const res = await getAllClaimsForFinance();
        // console.log("API response (finance):", res);

        const formattedClaims: Claim[] = res.data.map((claim: any) => ({
          id: claim.id,
          claim_number: claim.claim_number,
          surveyor_claim: claim.surveyor_claim_id ?? null,

          site: {
            id: claim.site.id,
            no: claim.site.no,
            name: claim.site.name,
          },

          pit: {
            id: claim.pit.id,
            no: claim.pit.no,
            name: claim.pit.name,
          },

          period_month: claim.period_month,
          period_year: claim.period_year,
          job_type: claim.job_type,
          status: claim.status,

          contractor_name: claim.contractor_name,
          total_bcm_contractor: claim.total_bcm_contractor,
          total_amount_contractor: claim.total_amount_contractor,
          status_contractor_claim: claim.status_contractor_claim,

          surveyor_name: claim.surveyor_name,
          total_bcm_surveyor: claim.total_bcm_surveyor,
          total_amount_surveyor: claim.total_amount_surveyor,
          status_surveyor_claim: claim.status_surveyor_claim,
          blocks: claim.blocks.map((block: any) => ({
            block_id: block.block_id,
            block_name: block.block_name,

            contractor: {
              bcm: block.contractor.bcm,
              amount: block.contractor.amount,
              date: block.contractor.date,
              note: block.contractor.note,
              materials: block.contractor.materials,
              file: block.contractor.file,
            },

            surveyor: block.surveyor
              ? {
                  bcm: block.surveyor.bcm,
                  amount: block.surveyor.amount,
                  date: block.surveyor.date,
                  note: block.surveyor.note,
                  materials: block.surveyor.materials,
                  file: block.surveyor.file,
                }
              : null,

            is_surveyed: block.is_surveyed,
              selisih_bcm: block.selisih_bcm,
              selisih_persen: block.selisih_persen,
              within_threshold: block.within_threshold,
              threshold_limit: block.threshold_limit,
          })),
        }));

        // console.log("Formatted claims:", formattedClaims);
        setClaims(formattedClaims);
      } catch (error) {
        console.error("Error fetch managerial claims:", error);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [setTitle]);


const [toast, setToast] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);


  return (
<div className="p-6 bg-gray-100 min-h-screen"> 
  <div className="mb-6 mt-12 flex items-center space-x-2 w-full justify-between"> 
    {toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    duration={3000}
  />
)}

    </div> 
    {loading ? (
        <SkeletonClaimTable rows={5} /> 
      ) : (
       <ManagerialClaimTable
          claims={claims}
          setClaims={setClaims}
          onToast={setToast}
        />
      )}
    </div> 
    ); 
  }
