"use client";

import { useRouter } from "next/navigation";
import { AuthFlow, UserSession } from "@/components/auth/AuthFlow";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (user: UserSession) => {
    // Store user session in localStorage or state if needed
    if (typeof window !== "undefined") {
      localStorage.setItem("dnd_user_session", JSON.stringify(user));
    }
    router.push("/dashboard");
  };

  return <AuthFlow onLoginSuccess={handleLoginSuccess} initialScreen="login" />;
}
