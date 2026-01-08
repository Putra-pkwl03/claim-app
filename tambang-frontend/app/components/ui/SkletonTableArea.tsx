export default function TableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white p-4 space-y-6">

      {/* ===== SITES AREA ===== */}
      <div>
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />

        <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded-md shadow border">
          <thead className="bg-blue-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-4 py-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 3 }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: 6 }).map((_, c) => (
                  <td key={c} className="px-4 py-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PITS AREA ===== */}
      <div>
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />

        <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded-md shadow border">
          <thead className="bg-green-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-4 py-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 2 }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: 6 }).map((_, c) => (
                  <td key={c} className="px-4 py-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== BLOCKS AREA ===== */}
      <div>
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-2" />

        <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded-md shadow border">
          <thead className="bg-yellow-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: 3 }).map((_, i) => (
                <th key={i} className="px-4 py-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 2 }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: 3 }).map((_, c) => (
                  <td key={c} className="px-4 py-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
