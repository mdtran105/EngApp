"use client";

import Navbar from "@/components/Navbar";
import { useCheckOnboard } from "@/hooks/useCheckOnboard";
import { getCurrentUser } from "@/lib/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { features } from "./constant";

interface UserStats {
	wordsLearned: number;
	conversations: number;
	streak: number;
}

export default function Dashboard() {
	const router = useRouter();
	useCheckOnboard();
	const [userName, setUserName] = useState("User");
	const [stats, setStats] = useState<UserStats>({
		wordsLearned: 0,
		conversations: 0,
		streak: 0,
	});
	const [loadingStats, setLoadingStats] = useState(true);

	useEffect(() => {
		const loadUserData = async () => {
			const user = await getCurrentUser();
			if (user) {
				setUserName(user.name);

				// Fetch user stats
				try {
					const { getUserId } = await import("@/lib/authService");
					const userId = await getUserId();
					const { API_DOMAIN } = await import("@/lib/config");

					const response = await fetch(
						`${API_DOMAIN}/api/chat/stats/${userId}`
					);
					if (response.ok) {
						const statsData = await response.json();
						setStats(statsData);
					}
				} catch (error) {
					console.error("Failed to load stats:", error);
				} finally {
					setLoadingStats(false);
				}
			}
		};

		loadUserData();
	}, []);
	return (
		<div className="min-h-screen relative flex overflow-hidden bg-linear-to-br from-teal-50/95 via-emerald-50/98 to-cyan-100/95 dark:from-slate-950/95 dark:via-teal-900/40 dark:to-slate-950/95 transition-all duration-1000">
			{/* Decorative blobs */}
			<div className="absolute top-0 left-1/4 w-160 h-160 bg-linear-to-br from-teal-400/20 to-emerald-400/20 blur-[160px] animate-pulse-slow pointer-events-none"></div>
			<div className="absolute bottom-0 right-1/4 w-160 h-160 bg-linear-to-br from-emerald-400/20 to-cyan-400/20 blur-[160px] animate-pulse-slow delay-1000 pointer-events-none"></div>

			{/* Sidebar */}
			<div className="w-full md:w-72 max-h-screen bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-teal-200/30 dark:border-teal-700/30 shadow-2xl flex flex-col overflow-hidden pt-12">
				{/* Sidebar Header */}
				<div className="p-6 border-b border-teal-200/20 dark:border-teal-700/20">
					<h2 className="text-2xl font-bold bg-linear-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
						English Mastery
					</h2>
					<p className="text-sm text-teal-600 dark:text-teal-400 mt-2">
						Học tiếng Anh hiệu quả
					</p>
				</div>

				{/* Sidebar Menu */}
				<nav className="flex-1 overflow-y-auto p-4 space-y-3">
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<button
								key={feature.href}
								onClick={() => router.push(feature.href)}
								className="w-full text-left px-5 py-4 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-teal-50/80 dark:hover:bg-teal-900/40 border-2 border-teal-200/30 dark:border-teal-700/30 hover:border-teal-300/60 dark:hover:border-teal-600/60 transition-all duration-300 group cursor-pointer"
							>
								<div className="flex items-center space-x-3">
									<div
										className={`p-2 rounded-lg bg-linear-to-br ${feature.gradient}`}
									>
										<Icon className="h-5 w-5 text-white" />
									</div>
									<div>
										<h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
											{feature.title}
										</h4>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{feature.englishTitle}
										</p>
									</div>
								</div>
							</button>
						);
					})}
				</nav>

				{/* Sidebar Footer - User Info */}
				<div className="p-4 border-t border-teal-200/20 dark:border-teal-700/20 bg-linear-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-900/20 dark:to-emerald-900/20">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold">
							A
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
								{userName}
							</p>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Intermediate
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 relative flex flex-col">
				<Navbar />

				{/* Content */}
				<div className="flex-1 overflow-auto pt-12 pb-6">
					<div className="container mx-auto px-6 py-8 max-w-6xl">
						{/* Welcome Section */}
						<div className="mb-8 animate-fadeIn">
							<h1 className="text-4xl font-bold bg-linear-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
								Xin chào! 👋
							</h1>
							<p className="text-lg text-slate-600 dark:text-slate-400">
								Chọn một trong các tính năng dưới đây để bắt đầu học tiếng Anh
							</p>
						</div>

						{/* Feature Cards Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{features.map((feature) => {
								const Icon = feature.icon;
								return (
									<button
										key={feature.href}
										onClick={() => router.push(feature.href)}
										className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-teal-200/40 dark:border-teal-700/30 hover:border-teal-300/60 dark:hover:border-teal-600/50 before:absolute before:inset-0 before:bg-linear-to-br before:from-teal-50/30 before:to-transparent before:opacity-0 hover:before:opacity-100 text-left animate-fadeIn cursor-pointer"
										style={{
											animationDelay: `${features.indexOf(feature) * 100}ms`,
										}}
									>
										<div className="relative z-10">
											<div
												className={`mb-6 inline-flex items-center justify-center rounded-2xl p-4 bg-linear-to-br ${feature.gradient} shadow-lg`}
											>
												<Icon className="h-8 w-8 text-white" />
											</div>
											<h3 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
												{feature.title}
											</h3>
											<p className="mb-3 text-sm font-medium bg-linear-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent dark:from-slate-400 dark:to-slate-300">
												{feature.englishTitle}
											</p>
											<p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
												{feature.description}
											</p>
										</div>

										{/* Hover Effects */}
										<div
											className={`absolute inset-0 z-0 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:group-hover:opacity-20 pointer-events-none ${feature.gradient}`}
										/>
										<div
											className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r opacity-0 transition-all duration-300 group-hover:opacity-100 ${feature.gradient}`}
										/>
									</button>
								);
							})}
						</div>

						{/* Quick Stats */}
						<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-teal-200/40 dark:border-teal-700/30 shadow-lg">
								<div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
									{loadingStats ? (
										<div className="h-9 w-16 bg-teal-200 dark:bg-teal-800 animate-pulse rounded"></div>
									) : (
										stats.wordsLearned
									)}
								</div>
								<p className="text-slate-600 dark:text-slate-400">Từ đã học</p>
							</div>
							<div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-emerald-200/40 dark:border-emerald-700/30 shadow-lg">
								<div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
									{loadingStats ? (
										<div className="h-9 w-16 bg-emerald-200 dark:bg-emerald-800 animate-pulse rounded"></div>
									) : (
										stats.conversations
									)}
								</div>
								<p className="text-slate-600 dark:text-slate-400">
									Cuộc trò chuyện
								</p>
							</div>
							<div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-cyan-200/40 dark:border-cyan-700/30 shadow-lg">
								<div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
									{loadingStats ? (
										<div className="h-9 w-16 bg-cyan-200 dark:bg-cyan-800 animate-pulse rounded"></div>
									) : (
										stats.streak
									)}
								</div>
								<p className="text-slate-600 dark:text-slate-400">
									Ngày liên tục
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
