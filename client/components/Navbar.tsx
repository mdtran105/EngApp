"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import { useTheme } from "@/contexts/ThemeContext";
import {
	getCurrentUser,
	isLoggedIn,
	logout,
	type User,
} from "@/lib/authService";
import { LogIn, LogOut, Menu, Moon, Sun, UserCircle, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserProfileDialog from "./UserProfileDialog";

export default function Navbar() {
	const router = useRouter();
	const { isDark, toggleTheme } = useTheme();
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const [showProfileDialog, setShowProfileDialog] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loggedIn, setLoggedIn] = useState(false);

	useEffect(() => {
		setLoggedIn(isLoggedIn());
		if (isLoggedIn()) {
			getCurrentUser().then(setUser);
		}
	}, []);

	const handleLogout = () => {
		logout();
		setUser(null);
		setLoggedIn(false);
		router.push("/");
	};

	return (
		<>
			<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-200/30 dark:bg-slate-900/80 dark:border-teal-800/30 transition-all duration-300 shadow-sm">
				<div className="container mx-auto px-3 py-2.5">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<button
							onClick={() => router.push("/dashboard")}
							className="text-lg md:text-xl font-semibold cursor-pointer bg-linear-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 hover:opacity-80 transition-opacity"
						>
							<Image
								src="/logo.png"
								alt="logo"
								width={32}
								height={32}
								className="inline-block"
							/>{" "}
							English101
						</button>

						<div className="flex items-center gap-2">
							{/* Horizontal Menu - Slide from right */}
							<div
								className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
									showMobileMenu
										? "max-w-[300px] opacity-100"
										: "max-w-0 opacity-0"
								}`}
							>
								<button
									onClick={() => {
										setShowProfileDialog(true);
										setShowMobileMenu(false);
									}}
									className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group whitespace-nowrap"
									title="Thông tin cá nhân"
								>
									<UserCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
								</button>

								<button
									onClick={toggleTheme}
									className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group whitespace-nowrap"
									aria-label="Toggle theme"
									title={isDark ? "Bật chế độ sáng" : "Bật chế độ tối"}
								>
									{isDark ? (
										<Sun className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:rotate-180 transition-transform duration-500" />
									) : (
										<Moon className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:-rotate-12 transition-transform duration-300" />
									)}
								</button>

								{loggedIn ? (
									<button
										onClick={() => {
											setShowLogoutDialog(true);
											setShowMobileMenu(false);
										}}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200 whitespace-nowrap"
									>
										<LogOut className="h-4 w-4" />
										<span className="text-xs font-medium">Đăng xuất</span>
									</button>
								) : (
									<button
										onClick={() => {
											router.push("/auth");
											setShowMobileMenu(false);
										}}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 whitespace-nowrap"
									>
										<LogIn className="h-4 w-4" />
										<span className="text-xs font-medium">Đăng nhập</span>
									</button>
								)}
							</div>

							{/* Hamburger Menu Button */}
							<button
								onClick={() => setShowMobileMenu(!showMobileMenu)}
								className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
								aria-label="Menu"
							>
								{showMobileMenu ? (
									<X className="h-5 w-5 text-teal-600 dark:text-teal-400" />
								) : (
									<Menu className="h-5 w-5 text-teal-600 dark:text-teal-400" />
								)}
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Dialogs */}
			<UserProfileDialog
				isOpen={showProfileDialog}
				onClose={() => setShowProfileDialog(false)}
			/>

			<ConfirmDialog
				isOpen={showLogoutDialog}
				onClose={() => setShowLogoutDialog(false)}
				onConfirm={handleLogout}
				title="Đăng xuất"
				message="Bạn có chắc chắn muốn đăng xuất? Tất cả dữ liệu học tập của bạn sẽ bị xóa."
				confirmText="Xác nhận"
			/>
		</>
	);
}
