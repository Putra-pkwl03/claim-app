"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();           // reset user di context
    router.push("/auth/login"); // redirect ke login
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}            
        isCollapsed={isSidebarCollapsed}  
        setIsCollapsed={setIsSidebarCollapsed} 
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout} 
      />

      {/* Konten utama */}
      <div className="flex-1 flex flex-col w-full">
        <Navbar isCollapsed={isSidebarCollapsed} />
        <main className={clsx(
          "transition-all duration-300 min-h-4xl w-full",
          isSidebarCollapsed ? "pl-14" : "pl-54"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
