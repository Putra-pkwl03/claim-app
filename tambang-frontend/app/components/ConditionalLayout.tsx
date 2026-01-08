"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import SidebarWrapper from "./SidebarWrapper";
import { useAuth } from "../../context/AuthContext"; 
import { PageTitleProvider } from "@/context/PageTitleContext";


export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage) router.replace("/auth/login");
      if (user && isAuthPage) router.replace("/");
    }
  }, [user, loading, isAuthPage, router]);

  if (loading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center">
     <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin duration-[1300ms] mb-4"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

 return isAuthPage ? (
  <>{children}</>
) : (
  <PageTitleProvider>
    <SidebarWrapper>{children}</SidebarWrapper>
  </PageTitleProvider>
);

}
