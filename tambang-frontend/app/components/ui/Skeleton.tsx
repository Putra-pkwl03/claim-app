// /components/ui/Skeleton.tsx
export default function SkeletonRow() {
  return (
    <div className="animate-pulse w-full flex items-center border-b border-gray-200 py-3 px-2">
      <div className="w-10 h-4 bg-gray-200 rounded-md"></div>
      <div className="ml-6 w-32 h-4 bg-gray-200 rounded-md"></div>
      <div className="ml-6 w-48 h-4 bg-gray-200 rounded-md"></div>
      <div className="ml-6 w-24 h-4 bg-gray-200 rounded-md"></div>
      <div className="ml-auto w-16 h-4 bg-gray-200 rounded-md"></div>
    </div>
  );
}


