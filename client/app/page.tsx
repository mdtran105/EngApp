"use client";

import { isLoggedIn } from "@/lib/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if user is logged in
		if (isLoggedIn()) {
			router.push("/dashboard");
		} else {
			// Redirect to login/register page
			router.push("/auth");
		}
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			<div className="text-center">
				<div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 dark:border-teal-800 dark:border-t-teal-400"></div>
				<p className="mt-4 text-teal-700 dark:text-teal-300 font-medium">
					Đang chuyển hướng...
				</p>
			</div>
		</div>
	);
}
