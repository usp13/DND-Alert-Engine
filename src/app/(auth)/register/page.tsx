"use client";

import { useRouter } from "next/navigation";
import { AuthFlow, UserSession } from "@/components/auth/AuthFlow";

export default function RegisterPage() {
  const router = useRouter();

  const handleLoginSuccess = (user: UserSession) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dnd_user_session", JSON.stringify(user));
    }
    router.push("/dashboard");
  };

  return <AuthFlow onLoginSuccess={handleLoginSuccess} initialScreen="register" />;
}
