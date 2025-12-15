import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useGlobalTTS } from "@/contexts/GlobalTTSContext";
import { useEffect, useRef } from "react";
import { Message } from "../types";

interface MessageItemProps {
	message: Message;
	autoPlay?: boolean;
}

export default function MessageItem({
	message,
	autoPlay = false,
}: MessageItemProps) {
	const { speak, stop, isPlaying, isLoading, currentPlayingId } =
		useGlobalTTS();
	const hasPlayedRef = useRef(false);

	// Reset played flag when message changes
	useEffect(() => {
		hasPlayedRef.current = false;
	}, [message.id]);

	// Auto-play TTS for AI messages when autoPlay is true
	useEffect(() => {
		if (
			autoPlay &&
			message.sender === "ai" &&
			message.content &&
			!hasPlayedRef.current
		) {
			// Add small delay to ensure proper state updates
			const timer = setTimeout(() => {
				speak(message.content, message.id);
				hasPlayedRef.current = true;
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [autoPlay, message.id, message.content, message.sender, speak]);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				stop();
			}
		};

		const handlePageHide = () => {
			stop();
		};

		window.addEventListener("pagehide", handlePageHide);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("pagehide", handlePageHide);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			// Only stop on unmount, not on every re-render
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty deps to only run once

	return (
		<div
			className={`flex ${
				message.sender === "user" ? "justify-end" : "justify-start"
			}`}
		>
			<div
				className={`flex flex-col space-y-1 ${
					message.sender === "user" ? "items-end" : "items-start"
				} w-[80%] md:w-[70%]`}
			>
				<div
					className={`w-fit px-3.5 py-1.5 ${
						message.sender === "user"
							? "bg-gray-100 dark:bg-slate-700 rounded-t-4xl rounded-l-2xl ml-auto"
							: "dark:bg-amber-600/60 bg-sky-100 rounded-t-4xl rounded-r-2xl"
					}`}
				>
					<div
						className={`${
							message.sender === "user"
								? "text-slate-900 dark:text-slate-100"
								: ""
						}`}
					>
						<MarkdownRenderer noSplit={false}>
							{message.content}
						</MarkdownRenderer>
					</div>
				</div>
				<span className="text-xs opacity-40">
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
				{message.sender === "ai" && (
					<div className="flex gap-3 items-center">
						{isLoading && currentPlayingId === message.id ? (
							<svg
								className="animate-spin"
								width={15}
								height={15}
								viewBox="0 0 15 15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7.5 1.5C7.5 0.947715 7.05228 0.5 6.5 0.5C5.94772 0.5 5.5 0.947715 5.5 1.5V3.5C5.5 4.05228 5.94772 4.5 6.5 4.5C7.05228 4.5 7.5 4.05228 7.5 3.5V1.5Z"
									fill="currentColor"
								/>
							</svg>
						) : (
							<svg
								onClick={() => {
									if (currentPlayingId === message.id && isPlaying) {
										stop();
									} else {
										speak(message.content, message.id);
									}
								}}
								className="cursor-pointer hover:opacity-70 transition-opacity"
								width={15}
								height={15}
								viewBox="0 0 15 15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7.46968 1.05085C7.64122 1.13475 7.75 1.30904 7.75 1.5V13.5C7.75 13.691 7.64122 13.8653 7.46968 13.9492C7.29813 14.0331 7.09377 14.0119 6.94303 13.8947L3.2213 11H1.5C0.671571 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.2213L6.94303 1.10533C7.09377 0.988085 7.29813 0.966945 7.46968 1.05085ZM6.75 2.52232L3.69983 4.89468C3.61206 4.96294 3.50405 5 3.39286 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77615 1.22386 10 1.5 10H3.39286C3.50405 10 3.61206 10.0371 3.69983 10.1053L6.75 12.4777V2.52232ZM10.2784 3.84804C10.4623 3.72567 10.7106 3.77557 10.833 3.95949C12.2558 6.09798 12.2558 8.90199 10.833 11.0405C10.7106 11.2244 10.4623 11.2743 10.2784 11.1519C10.0944 11.0296 10.0445 10.7813 10.1669 10.5973C11.4111 8.72728 11.4111 6.27269 10.1669 4.40264C10.0445 4.21871 10.0944 3.97041 10.2784 3.84804ZM12.6785 1.43044C12.5356 1.2619 12.2832 1.24104 12.1147 1.38386C11.9462 1.52667 11.9253 1.77908 12.0681 1.94762C14.7773 5.14488 14.7773 9.85513 12.0681 13.0524C11.9253 13.2209 11.9462 13.4733 12.1147 13.6161C12.2832 13.759 12.5356 13.7381 12.6785 13.5696C15.6406 10.0739 15.6406 4.92612 12.6785 1.43044Z"
									fill="currentColor"
									fillRule="evenodd"
									clipRule="evenodd"
								/>
							</svg>
						)}
						{isPlaying && currentPlayingId === message.id && (
							<div className="text-xs cursor-pointer" onClick={() => stop()}>
								Pause
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
