"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register } from "@/lib/authService";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (isLogin) {
				// Login
				await login(formData.email, formData.password);
				router.push("/dashboard");
			} else {
				// Register
				if (formData.password !== formData.confirmPassword) {
					setError("Passwords do not match");
					setLoading(false);
					return;
				}

				if (formData.password.length < 6) {
					setError("Password must be at least 6 characters");
					setLoading(false);
					return;
				}

				await register(formData.name, formData.email, formData.password);
				router.push("/dashboard");
			}
		} catch (err: any) {
			setError(err.message || "An error occurred");
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50/95 via-emerald-50/98 to-cyan-100/95 dark:from-slate-950/95 dark:via-teal-900/40 dark:to-slate-950/95 p-4">
			{/* Decorative blobs */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-160 h-160 bg-linear-to-br from-teal-400/20 to-emerald-400/20 blur-[160px] animate-pulse-slow"></div>
				<div className="absolute bottom-1/4 right-1/4 w-160 h-160 bg-linear-to-br from-emerald-400/20 to-cyan-400/20 blur-[160px] animate-pulse-slow delay-1000"></div>
			</div>

			<div className="relative w-full max-w-md">
				{/* Card */}
				<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-teal-200/30 dark:border-teal-700/30">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-teal-500 to-emerald-500 mb-4">
							{isLogin ? (
								<LogIn className="w-8 h-8 text-white" />
							) : (
								<UserPlus className="w-8 h-8 text-white" />
							)}
						</div>
						<h1 className="text-3xl font-bold bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
							{isLogin ? "Đăng nhập" : "Đăng ký"}
						</h1>
						<p className="text-slate-600 dark:text-slate-400 mt-2">
							{isLogin
								? "Chào mừng bạn quay lại!"
								: "Tạo tài khoản để lưu tiến trình học tập"}
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{!isLogin && (
							<div>
								<Label htmlFor="name">Họ và tên</Label>
								<Input
									id="name"
									name="name"
									type="text"
									required
									value={formData.name}
									onChange={handleChange}
									placeholder="Nguyễn Văn A"
									className="mt-1"
								/>
							</div>
						)}

						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								placeholder="email@example.com"
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="password">Mật khẩu</Label>
							<div className="relative mt-1">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									required
									value={formData.password}
									onChange={handleChange}
									placeholder="••••••••"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						{!isLogin && (
							<div>
								<Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showPassword ? "text" : "password"}
									required
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="••••••••"
									className="mt-1"
								/>
							</div>
						)}

						{error && (
							<div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
								{error}
							</div>
						)}

						<Button
							type="submit"
							disabled={loading}
							className="w-full cursor-pointer bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
						>
							{loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
						</Button>
					</form>

					{/* Toggle */}
					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsLogin(!isLogin);
								setError("");
								setFormData({
									name: "",
									email: "",
									password: "",
									confirmPassword: "",
								});
							}}
							className="text-teal-600 dark:text-teal-400 cursor-pointer hover:underline"
						>
							{isLogin
								? "Chưa có tài khoản? Đăng ký ngay"
								: "Đã có tài khoản? Đăng nhập"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
