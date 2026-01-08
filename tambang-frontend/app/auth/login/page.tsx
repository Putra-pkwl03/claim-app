// LoginPage.tsx
"use client";
import LoginForm from "../../components/login/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center px-4 sm:px-6"
      style={{ backgroundImage: "url('/img/bglogin.png')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      <div className="relative z-10 w-full max-w-[480px]">
        <LoginForm />
      </div>
    </div>
  );
}
