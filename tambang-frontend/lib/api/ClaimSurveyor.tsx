import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

/* ================= SURVEYOR ================= */

  /**
   * 1️⃣ LIST SURVEYOR CLAIM (claim yang dibuat surveyor)
   * GET /surveyor/claims
   */
  export async function getSurveyorClaims() {
    try {
      const res = await API.get("/surveyor/claims");
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Gagal mengambil surveyor claim"
      );
    }
  }

  /**
   * 2️⃣ SUBMIT SURVEYOR CLAIM (MULTI BLOCK + FILE)
   * POST /surveyor/claims
   */
  export async function createSurveyorClaim(formData: FormData, p0: { headers: { "Content-Type": string; }; }) {
    try {
      const res = await API.post("/surveyor/claims", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Gagal submit surveyor claim"
      );
    }
  }


  /**
   * 6️⃣ UPDATE / EDIT SURVEYOR CLAIM
   * PUT /surveyor/claims/{id}
   * (pakai _method supaya aman untuk multipart/form-data)
   */
  export async function updateSurveyorClaim(
    id: number | string,
    formData: FormData
  ) {
    try {
      const res = await API.post(
        `/surveyor/claims/${id}?_method=PUT`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Gagal update surveyor claim"
      );
    }
  }


  /**
   * 7️⃣ DETAIL SURVEYOR CLAIM
   * GET /surveyor/claims/{id}
   */
  export async function getSurveyorClaimDetail(id: number | string) {
    try {
      const res = await API.get(`/surveyor/claims/${id}`);
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Gagal mengambil detail surveyor claim"
      );
    }
  }



/* ================= CONTRACTOR CLAIM (READ ONLY FOR SURVEYOR) ================= */

  /**
   * 3️⃣ LIST CLAIM CONTRACTOR (UNTUK SURVEYOR)
   * GET /surveyor/contractor-claims
   */
  export async function getContractorClaimsForSurveyor() {
    try {
      const res = await API.get("/surveyor/contractor-claims");
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message ||
          "Gagal mengambil claim contractor untuk surveyor"
      );
    }
  }

  /**
   * 4️⃣ DETAIL CLAIM CONTRACTOR
   * GET /surveyor/contractor-claims/{id}
   */
  export async function getContractorClaimDetailForSurveyor(
    id: number | string
  ) {
    try {
      const res = await API.get(`/surveyor/contractor-claims/${id}`);
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Gagal mengambil detail claim contractor"
      );
    }
  }


  /**
   * 5️⃣ DELETE SURVEYOR CLAIM
   * DELETE /surveyor/claims/{id}
   */
  export async function deleteSurveyorClaim(id: number | string) {
    try {
      const res = await API.delete(`/surveyor/claims/${id}`);
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Gagal menghapus surveyor claim"
      );
    }
  }


export default API;
