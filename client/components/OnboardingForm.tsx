"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { saveUserPreferences } from "@/lib/localStorage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	fullName: z.string().min(2, "Tên không hợp lệ"),
	gender: z.enum(["male", "female", "other"]),
	age: z
		.number()
		.min(7, "Người dùng phải từ 7 tuổi trở lên")
		.max(60, "Người dùng phải dưới 60 tuổi"),
});

type FormData = z.infer<typeof formSchema>;

export default function OnboardingForm() {
	// const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			gender: "male",
			age: undefined,
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		try {
			// Save user preferences with default proficiency level (Intermediate)
			saveUserPreferences({
				...data,
				proficiencyLevel: 3, // Default to Intermediate level
				hasCompletedOnboarding: true,
			});
			router.push("/dashboard");
		} catch {
			// setError(
			//   err instanceof Error
			//     ? err.message
			//     : "API key validation failed. Please check your key and try again."
			// );
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen relative flex overflow-hidden bg-linear-to-br from-teal-400 via-emerald-400 to-cyan-500">
			{/* Decorative blobs */}
			<div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-300 blur-3xl opacity-30 animate-float"></div>
			<div
				className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-300 blur-3xl opacity-30 animate-float"
				style={{ animationDelay: "1s" }}
			></div>

			{/* Main Container */}
			<div className="w-full lg:w-2/3 relative flex flex-col justify-center px-6 py-12 lg:px-20">
				{/* Form Content */}
				<div className="space-y-8">
					<div>
						<h1 className="text-5xl font-bold text-white drop-shadow-lg mb-3">
							Chào mừng bạn!
						</h1>
						<p className="text-xl text-white/90 font-medium">
							Hãy cho chúng tôi biết một số thông tin cơ bản về bạn
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* Name Input */}
						<div className="space-y-3">
							<Label
								htmlFor="fullName"
								className="text-white font-semibold text-lg"
							>
								Tên hoặc nickname:
							</Label>
							<Input
								{...register("fullName")}
								autoComplete="off"
								placeholder="Nhập tên của bạn"
								disabled={isLoading}
								className="bg-white/90 dark:bg-slate-800 border-2 border-white/30 rounded-xl px-6 py-4 text-lg"
							/>
							{errors.fullName && (
								<p className="text-sm text-red-200">
									{errors.fullName.message}
								</p>
							)}
						</div>

						{/* Gender Select */}
						<div className="space-y-3">
							<Label className="text-white font-semibold text-lg">
								Giới tính:
							</Label>
							<Select
								onValueChange={(value) =>
									setValue("gender", value as "male" | "female" | "other")
								}
								defaultValue="male"
								disabled={isLoading}
							>
								<SelectTrigger className="bg-white/90 border-2 border-white/30 rounded-xl h-12 text-lg">
									<SelectValue placeholder="Nam" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="male">Nam</SelectItem>
									<SelectItem value="female">Nữ</SelectItem>
									<SelectItem value="other">Khác</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Age Input */}
						<div className="space-y-3">
							<Label className="text-white font-semibold text-lg">Tuổi:</Label>
							<Input
								{...register("age", { valueAsNumber: true })}
								autoComplete="off"
								type="number"
								placeholder="16"
								min={7}
								max={60}
								disabled={isLoading}
								className="bg-white/90 dark:bg-slate-800 border-2 border-white/30 rounded-xl px-6 py-4 text-lg"
							/>
							{errors.age && (
								<p className="text-sm text-red-200">{errors.age.message}</p>
							)}
						</div>
					</form>
				</div>
			</div>

			{/* Right Sidebar - Illustration/Info */}
			<div className="hidden lg:flex w-1/3 bg-white/10 backdrop-blur-lg border-l border-white/20 flex-col justify-center items-center p-12 text-center">
				<div className="text-6xl mb-6">📚</div>
				<h2 className="text-3xl font-bold text-white mb-4">English101</h2>
				<p className="text-white/90 text-lg leading-relaxed mb-8">
					Nền tảng học tiếng Anh hiệu quả sử dụng AI, giúp bạn nâng cao kỹ năng
					giao tiếp trong một môi trường vui vẻ và tương tác.
				</p>
				<div className="space-y-4 w-full">
					<div className="bg-white/10 rounded-xl p-4 border border-white/20">
						<p className="text-white font-semibold">✨ Học từ vựng</p>
						<p className="text-white/80 text-sm mt-1">Với từ điển thông minh</p>
					</div>
					<div className="bg-white/10 rounded-xl p-4 border border-white/20">
						<p className="text-white font-semibold">💬 Giao tiếp với AI</p>
						<p className="text-white/80 text-sm mt-1">Trò chuyện tự nhiên</p>
					</div>
				</div>
			</div>

			{/* Floating button */}
			<button
				onClick={handleSubmit(onSubmit)}
				disabled={isLoading}
				className="fixed bottom-8 right-8 px-8 py-4 rounded-full bg-white text-teal-600 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? "Đang xử lý..." : "Bắt đầu →"}
			</button>
		</div>
	);
}
