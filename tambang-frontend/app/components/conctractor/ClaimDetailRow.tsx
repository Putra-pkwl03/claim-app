"use client";

import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

type ClaimDetailRowProps = {
  claim: any;
};

const ClaimDetailRow = ({ claim }: ClaimDetailRowProps) => {
  return (
    <tr>
      <td colSpan={9} className="bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-5">
        <div className="space-y-6">

          {/* HEADER INFO */}
          <div className="flex flex-wrap gap-3 text-[12px]">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-medium text-[12px]">
              Site: {claim.site?.name}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-blue-800 font-medium text-[12px]">
              PIT: {claim.pit?.name} (No: {claim.pit?.no_pit})
            </span>
          </div>

          {/* BLOCK LIST */}
          <div className="grid grid-cols-1 gap-4 -mt-2">
            {claim.blocks.map((block: any) => (
              <div
                key={block.id}
                className="rounded-md border border-gray-100 bg-white  hover:shadow-md transition"
              >
                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl">
                  <div className="font-semibold text-gray-800">
                    {block.block_name}
                  </div>

                  {block.file_url && (
                    <a
                      href={block.file_url}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[12px] text-red-600 hover:text-red-700"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      PDF
                    </a>
                  )}
                </div>

                {/* BLOCK CONTENT */}
                <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div>
                    <div className="text-gray-700">Tanggal</div>
                    <div className="font-medium text-[12px] mt-2">{block.date || "-"}</div>
                  </div>
                  <div>
                    <div className="text-gray-700">BCM</div>
                    <div className="font-medium text-[12px] mt-2">{block.bcm}</div>
                  </div>
                  <div>
                    <div className="text-gray-700">Amount</div>
                    <div className="font-medium text-[12px] mt-2">{block.amount}</div>
                  </div>
                  <div>
                    <div className="text-gray-700">Materials</div>
                    <div className="font-medium text-[12px] mt-2">
                      {block.materials?.length
                        ? block.materials.map((m: any) => m.material_name).join(", ")
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* NOTE */}
                {block.note && (
                  <div className="px-5 py-3 border-t border-yellow-50 text-sm bg-yellow-50 text-yellow-800 rounded-b-xl">
                    <strong>Description:</strong> {block.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ClaimDetailRow;
