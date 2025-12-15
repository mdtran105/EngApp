import { GlobalTTSProvider } from "@/contexts/GlobalTTSContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "English101 - Bắt đầu học tiếng Anh cùng AI",
	description:
		"Chatbot AI hỗ trợ học tiếng Anh qua hội thoại, luyện nói và cải thiện kỹ năng giao tiếp.",
	icons: {
		icon: "favicon.ico",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="favicon.ico" />
			</head>
			<body className={`${inter.className} antialiased`}>
				<GlobalTTSProvider>
					<ThemeProvider>
						<div className="min-h-screen bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-150">
							{children}
						</div>
					</ThemeProvider>
				</GlobalTTSProvider>
			</body>
		</html>
	);
}
