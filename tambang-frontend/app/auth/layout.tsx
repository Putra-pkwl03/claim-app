export const metadata = {
  title: "Login - Geo Claim System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center">
      {children}
    </div>
  );
}
