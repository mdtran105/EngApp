import { getUserPreferences } from "@/lib/localStorage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useCheckOnboard = () => {
  const router = useRouter();
  const preferences = getUserPreferences();
  useEffect(() => {
    if (!preferences.hasCompletedOnboarding) {
      router.push("/");
      return;
    }
  }, [router, preferences.hasCompletedOnboarding]);
};
