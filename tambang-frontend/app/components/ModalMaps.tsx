// "use client";

// import { FC, useState, useRef, useEffect } from "react";
// import dynamic from "next/dynamic";
// import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/solid";
// import L from "leaflet";

// const ClaimMapView = dynamic(() => import("../components/maps/ClaimMapView"), { ssr: false });

// type ModalMapsProps = {
//   lat: number;
//   lng: number;
//   onClose: () => void;
// };

// export const ModalMaps: FC<ModalMapsProps> = ({ lat, lng, onClose }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const mapInstanceRef = useRef<L.Map | null>(null);

//   // Panggil invalidateSize saat modal diperbesar/kecil
//   useEffect(() => {
//     if (mapInstanceRef.current) {
//       setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300); // delay sesuai transition
//     }
//   }, [isExpanded]);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
//       <div
//         className={`bg-white rounded-xl shadow-2xl flex flex-col transform transition-all duration-300
//           ${isExpanded ? "w-[95%] max-w-[95%] h-[90vh]" : "w-[90%] max-w-2xl h-[500px]"}
//         `}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <h2 className="font-semibold text-xl text-gray-700">Lokasi Klaim</h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
//               title={isExpanded ? "Kecilkan Map" : "Perbesar Map"}
//             >
//               {isExpanded ? (
//                 <ArrowsPointingInIcon className="w-5 h-5" />
//               ) : (
//                 <ArrowsPointingOutIcon className="w-5 h-5" />
//               )}
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Map */}
//         <div className="flex-1 rounded-b-xl overflow-hidden transition-all duration-300">
//           <ClaimMapView
//             initialPosition={{ lat, lng }}
//             onMapCreated={(map) => (mapInstanceRef.current = map)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };
