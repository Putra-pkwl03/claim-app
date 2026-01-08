"use client";

import DashboardOverlay from "./components/dashboard/DashboardOverlay";

export default function DashboardContent() {
  return (
    <div className="w-full min-h-screen bg-white overflow-hidden">
      <div className="relative w-full h-[100vh]">
        <DashboardOverlay />
      </div>
    </div>
  );
}
