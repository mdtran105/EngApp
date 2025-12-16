import { isLoggedIn } from "@/lib/authService";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useCheckOnboard = () => {
	const router = useRouter();

	useEffect(() => {
		// Redirect to auth if not logged in
		if (!isLoggedIn()) {
			router.push("/auth");
			return;
		}
	}, [router]);
};
