import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateCertificatePDF = async (claim: any) => {
  const container = document.createElement("div");
  container.style.width = "750px";
  container.style.padding = "8px 8px 120px 8px";

  container.style.margin = "0 auto";
  container.style.background = "white";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.color = "#555";
  container.style.border = "3px solid #555";
  container.style.boxSizing = "border-box";

  const signatures = claim.signatures || {};

  const renderSignature = (sig: any, roleLabel: string) => {
    if (!sig) {
      return `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:2px;
      ">
        <div style="height:10px;"></div>
        <div style="font-size:14px; font-weight:bold;">______</div>
        <div style="font-size:14px;">${roleLabel}</div>
      </div>
    `;
    }

    return `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
     
    ">
      <img
        src="${sig.signature}"
        style="max-height:160px; max-width:280px; object-fit:contain;"
      />
      <div style="font-size:14px; font-weight:bold;">
        ${sig.user_name}
      </div>
      <div style="font-size:14px; font-weight:bold; ">
        ${roleLabel}
      </div>
    </div>
  `;
  };

  container.innerHTML = `
<!-- Judul utama -->
<div style="text-align:center; font-weight:bold; font-size:18px; margin:0 0 0 0; color:#000;">
  CERTIFICATE OF WORK PROGRESS
</div>

<!-- FOR OVER BURDEN dipisah -->
<div style="text-align:center; font-weight:bold; font-size:18px; margin:0 0 0 2px; color:#000;">
  FOR
</div>
<div style="text-align:center; font-weight:bold; font-size:18px; margin:0 0 10px; color:#000;">
  OVER BURDEN
</div>

  <div style="width: calc(100% + 40px); height:2.5px; background-color:#555; margin:0 -20px 10px;"></div>


    <table style="width:100%; font-size:14px; margin-bottom:15px;">
      <tr><td style="width:150px;">NOMOR</td><td>: ${
        claim.claim_number
      }</td></tr>
      <tr><td>CLIENT</td><td>: ${claim.client}</td></tr>
      <tr><td>CONTRACTOR</td><td>: ${claim.contractor}</td></tr>
      <tr><td>PROJECT</td><td>: ${claim.project}</td></tr>
      <tr><td>CLAIM PERIOD</td><td>: ${claim.period_month}/${
    claim.period_year
  }</td></tr>
    </table>
  <div style="width: calc(100% + 40px); height:2.5px; background-color:#555; margin:0 -20px 10px;"></div>


    ${Object.values(claim.pits)
      .map(
        (pit: any, idx) => `
      <div style="font-weight:bold; margin-top:10px; color:#555;">
        WASTE REMOVAL
      </div>
      <div style="font-weight:bold; margin-left:20px; margin-top:5px; color:#555;">
        ${idx + 1}. ${pit.pit_name} (${pit.pit_no})
      </div>

      <table cellspacing="0" cellpadding="5" style="margin-bottom:5px; margin-top:8px; margin-left:38px; font-size:13px; border-collapse: collapse; width:calc(100% - 38px);">
  <tbody>
    ${pit.blocks
      .map(
        (b: any) => `
      <tr>
        <td style="text-align:left; width:60%;">${b.block_name}</td>
        <td style="text-align:center; width:5%;">=</td>
        <td style="text-align:right; width:35%;">${Number(
          b.bcm_contractor
        ).toLocaleString()} Bcm</td>
      </tr>
    `
      )
      .join("")}
  </tbody>
</table>

<table cellspacing="0" cellpadding="5" style="margin-bottom:5px; margin-top:6px; margin-left:38px; font-size:13px; border-collapse: collapse; width:calc(100% - 38px);">
  <tbody>
    <tr style="font-weight:bold; border-top:1px solid #555;">
      <td style="text-align:left; width:60%;">Total Volume</td>
      <td style="text-align:right; width:35%;">${Number(
        pit.total_bcm_per_pit
      ).toLocaleString()} Bcm</td>
    </tr>
  </tbody>
</table>



  <table cellspacing="0" cellpadding="5" style="margin-top:5px; margin-left:38px; width:calc(100% - 38px); border-collapse: collapse;">
    <tbody>
      <tr style="font-weight:bold; border-top:3px double #555; padding-top:3px;">
        <td style="text-align:left; width:60%;">Total Over Burden ${
          pit.pit_name
        }</td>
        <td style="text-align:center; width:5%;">=</td>
        <td style="text-align:right; width:35%;">${Number(
          pit.total_bcm_per_pit
        ).toLocaleString()} Bcm</td>
      </tr>
    </tbody>
  </table>
`
      )
      .join("")}

<table cellspacing="0" cellpadding="5" style="margin-top:10px; margin-left:38px; width:calc(100% - 38px); border-collapse: collapse;">
  <tbody>
    <tr style="font-weight:bold; border-top:3px double #555; padding-top:3px;">
      <td style="text-align:left; width:60%;">Grand Total Over Burden</td>
      <td style="text-align:center; width:5%;">=</td>
      <td style="text-align:right; width:35%;">${Number(
        claim.grand_total_bcm
      ).toLocaleString()} Bcm</td>
    </tr>
  </tbody>
</table>

  <div style="width: calc(100% + 40px); height:2.5px; background-color:#555; margin:20px -8px;"></div>
<table
  style="
    width:100%;
    margin-top:10px;
    font-size:14px;
    text-align:center;
    color:#555;
    table-layout:fixed;
    font-weight:bold;
  "
>

  <tr>
    <td>Prepared by</td>
    <td>Checked by</td>
    <td>Approved by</td>
  </tr>
<tr>
  <td style="vertical-align:top; height:100px; font-weight:bold;">
    ${renderSignature(signatures.surveyor, "Surveyor Section")}
  </td>
  <td style="vertical-align:top; height:100px;">
    ${renderSignature(signatures.managerial, "Engineering Dept.")}
  </td>
  <td style="vertical-align:top; height:100px;">
    ${renderSignature(signatures.finance, "PT. Perkasa Inakakerta")}
  </td>
</tr>


</table>


  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);

  const marginLeftRight = 16;
  const marginTop = 20;
  const pdfWidth = pdf.internal.pageSize.getWidth() - marginLeftRight * 2;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  const pageHeight = pdf.internal.pageSize.getHeight() - marginTop;
  let heightLeft = pdfHeight;
  let position = marginTop;

  pdf.addImage(imgData, "PNG", marginLeftRight, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = heightLeft - pdfHeight + marginTop;
    pdf.addImage(
      imgData,
      "PNG",
      marginLeftRight,
      position,
      pdfWidth,
      pdfHeight
    );
    heightLeft -= pageHeight;
  }

  document.body.removeChild(container);

  return pdf;
};
