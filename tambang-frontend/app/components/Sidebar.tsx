"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, UserIcon, ClockIcon, ClipboardDocumentCheckIcon, 
  MapIcon, Cog6ToothIcon, DocumentTextIcon, Bars3Icon, XMarkIcon, ArrowRightIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { me } from "@/lib/api/auth";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  onLogout: () => void; 
}

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", href: "/", roles: ["admin", "contractor", "surveyor","owner", "managerial", "finance"] },
  { icon: UserIcon, label: "Manage Users", href: "/manage-users", roles: ["admin"] },
  { icon: MapIcon, label: "Site Setup", href: "/site-setup", roles: ["admin"] },
  // { icon: Cog6ToothIcon, label: "Claim Settings", href: "/claim-settings", roles: ["admin"] },
  // { icon: DocumentTextIcon, label: "Reports", href: "/reports", roles: ["admin"] },
  // Menu contractor
  { icon: ClipboardDocumentCheckIcon, label: "Claim", href: "/contractor/claim", roles: ["contractor"] },
  { icon: CheckBadgeIcon, label: "Certificate", href: "/contractor/claim/certificate", roles: ["contractor"] },
  // Menu surveyor
  { icon: ClipboardDocumentCheckIcon, label: "Claim", href: "/surveyor/claim", roles: ["surveyor"] },
  { icon: ClockIcon, label: "Riwayat Claim", href: "/claim/history", roles: ["surveyor"] },
  // Menu managerial
  { icon: ClipboardDocumentCheckIcon, label: "Claim Control", href: "/managerial/claim-control", roles: ["managerial"] },
  // Menu finance
  { icon: ClipboardDocumentCheckIcon, label: "Claim Control", href: "/finance/claim-control", roles: ["finance"] },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed, onLogout }: SidebarProps) {
  const [user, setUser] = useState<{ name: string; role: string }>({ name: "", role: "" });
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await me();
        setUser({
          name: data.user?.name || "Unknown",
          role: data.role?.[0] || "Unknown"
        });
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      {/* Overlay Mobile */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-30 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={clsx(
          "h-screen flex flex-col transition-all duration-300 fixed top-0 left-0 z-40 pt-16",
          "bg-blue-500/20 text-gray-200 shadow-2xl backdrop-blur-md border-r border-blue-900",
          isCollapsed ? "w-14" : "w-54"
        )}
      >
        {/* Header Logo */}
       <div
          className={clsx(
            "flex items-center justify-between px-3 py-1 rounded-lg mx-2 -mt-14",
            "bg-white/10 border border-white/15 backdrop-blur-xl shadow-sm",
            isCollapsed ? "w-10" : "w-48"
          )}
        >
          {!isCollapsed && (
            <span className="text-lg font-bold">
              <span className="text-white/90">S C</span>{" "}
              <span className="text-blue-400">CLAIMS</span>
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-white/20 transition  -ml-[13px] cursor-pointer"
          >
            {isCollapsed ? <Bars3Icon className="w-6 h-6 text-gray-200 " /> : <XMarkIcon className="w-6 h-6 text-gray-200" />}
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 mt-6 flex flex-col gap-2 px-3">
          {menuItems
            .filter(item => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 p-2 rounded-md transition-all duration-200",
                  isCollapsed ? "justify-center" : "justify-start",
                  isActive ? "bg-white/20 text-white font-semibold" : "text-gray-200 hover:bg-white/10 hover:text-white"
                )}
                onClick={onClose}
              >
                <Icon className={clsx("w-6 h-6 shrink-0", isActive ? "text-white" : "text-gray-200")} />
                {!isCollapsed && <span className="text-base font-medium">{item.label}</span>}
              </Link>
              );
            })}
        </nav>

       {/* Footer User + Logout */}
        <div
          className={clsx(
            "flex flex-col px-4 py-3 mt-auto rounded-lg mx-2 mb-2 gap-2",
            "bg-white/5 border border-white/10 backdrop-blur-sm",
            isCollapsed ? "items-center" : "items-start"
          )}
        >

          {/* Nama & Role */}
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-100">{user.name || "Loading..."}</span>
              <span className="text-sm text-gray-100">Role: {user.role || "..."}</span>
            </div>
          )}

          {/* Tombol Logout di bawah */}
          <button
            onClick={onLogout}
            className={clsx(
              "mt-auto flex items-center gap-2 px-3 py-2 text-red-300 border border-red-400/20 cursor-pointer",
              "hover:bg-red-500/20 hover:border-red-400/40 transition-all rounded-md",
              isCollapsed ? "justify-center w-10 border-none" : "justify-start w-full"
            )}
          >
            <ArrowRightIcon className="w-5 h-5" />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>
    </>
  );
}
