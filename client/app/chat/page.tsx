"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import Navbar from "@/components/Navbar";
import { useMessage } from "@/hooks/useMessage";
import { useRecordAudio } from "@/hooks/useRecordAudio";
import { AudioLines } from "lucide-react";
import { useEffect, useState } from "react";
import "webrtc-adapter";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";

export default function ChatPage() {
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [isClearing, setIsClearing] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const {
		messages,
		handleSendMessage,
		isProcessing,
		handleClearChat,
		isContinuousMode,
		setIsContinuousMode,
		lastNewMessageId,
		conversations,
		currentConversationId,
		createNewConversation,
		switchConversation,
		removeConversation,
		clearAllConversations,
	} = useMessage();

	const {
		isListening,
		audioURL,
		startRecording,
		stopRecording,
		transcriptApi,
		setTranscriptApi,
	} = useRecordAudio(isContinuousMode);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<div className="min-h-screen relative flex overflow-hidden bg-linear-to-br from-teal-50/95 via-emerald-50/98 to-cyan-100/95 dark:from-slate-950/95 dark:via-teal-900/40 dark:to-slate-950/95">
			{/* Decorative blobs */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-160 h-160 bg-linear-to-br from-teal-400/20 to-emerald-400/20 blur-[160px] animate-pulse-slow"></div>
				<div className="absolute bottom-1/4 right-1/4 w-160 h-160 bg-linear-to-br from-emerald-400/20 to-cyan-400/20 blur-[160px] animate-pulse-slow delay-1000"></div>
			</div>

			{/* Left Sidebar - Chat History */}
			<div className="fixed left-0 top-15 bottom-0 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-teal-200/30 dark:border-teal-700/30 shadow-2xl flex-col hidden md:flex">
				{/* Sidebar Header */}
				<div className="shrink-0 p-6 border-b border-teal-200/20 dark:border-teal-700/20">
					<h2 className="text-2xl font-bold bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
						Hội thoại
					</h2>
					<p className="text-sm text-teal-600 dark:text-teal-400 mt-2">
						Lịch sử trò chuyện
					</p>
				</div>

				{/* New Conversation Button */}
				<div className="shrink-0 p-4 border-b border-teal-200/20 dark:border-teal-700/20">
					<button
						onClick={createNewConversation}
						className="w-full px-4 py-3 cursor-pointer rounded-lg bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold transition-all shadow-md hover:shadow-lg"
					>
						➕ Tạo cuộc trò chuyện mới
					</button>
				</div>

				{/* Chat History List - Scrollable */}
				<div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-teal-500/20 scrollbar-track-transparent hover:scrollbar-thumb-teal-500/40">
					{!isMounted ? (
						<p className="text-center text-slate-500 dark:text-slate-400 text-sm py-4">
							Đang tải...
						</p>
					) : conversations.length === 0 ? (
						<p className="text-center text-slate-500 dark:text-slate-400 text-sm py-4">
							Chưa có cuộc trò chuyện nào
						</p>
					) : (
						[...conversations]
							.sort(
								(a, b) =>
									new Date(b.updatedAt).getTime() -
									new Date(a.updatedAt).getTime()
							)
							.map((conversation) => (
								<div
									key={conversation.id}
									className={`group w-full text-left px-4 py-3 rounded-lg border transition-all relative ${
										conversation.id === currentConversationId
											? "bg-linear-to-r from-teal-500/20 to-emerald-500/20 border-teal-300/50 dark:border-teal-600/50"
											: "border-slate-200/50 dark:border-slate-700/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/20"
									}`}
								>
									<button
										onClick={() => switchConversation(conversation.id)}
										className="w-full text-left cursor-pointer"
									>
										<p className="font-semibold text-slate-900 dark:text-white truncate pr-8">
											{conversation.title}
										</p>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											{new Date(conversation.updatedAt).toLocaleDateString(
												"vi-VN",
												{
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												}
											)}
										</p>
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											if (
												confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")
											) {
												removeConversation(conversation.id);
											}
										}}
										className="absolute right-2 top-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
										title="Xóa cuộc trò chuyện"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-red-600 dark:text-red-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							))
					)}
				</div>

				{/* Sidebar Footer - Settings */}
				<div className="shrink-0 p-4 border-t border-teal-200/20 dark:border-teal-700/20 space-y-3">
					<button
						onClick={() => setShowClearConfirm(true)}
						className="w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-50/80 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-all cursor-pointer"
					>
						🗑️ Xóa tất cả lịch sử
					</button>
				</div>
			</div>

			{/* Right Main Content - Chat */}
			<div className="flex-1 relative flex flex-col md:ml-80 h-screen">
				<Navbar />

				{/* Chat Messages Area */}
				<div className="flex-1 overflow-auto pt-15">
					<div className="h-full flex flex-col">
						<ChatMessages
							messages={messages}
							isProcessing={isProcessing}
							onClearChat={handleClearChat}
							isClearing={isClearing}
							onShowClearConfirm={() => setShowClearConfirm(true)}
							lastNewMessageId={lastNewMessageId}
						/>
					</div>
				</div>

				{/* Chat Input Area - Fixed at bottom */}
				<div className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-teal-200/30 dark:border-teal-700/30 shadow-2xl p-4 space-y-4">
					{/* Continuous Mode Toggle */}
					<div className="flex items-center gap-5 px-4 py-3 bg-linear-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg border border-teal-200/30 dark:border-teal-700/30">
						<div className="flex items-center space-x-2">
							<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
								🔄 Chế độ trò chuyện liên tục
							</span>
							<span className="text-xs text-slate-500 dark:text-slate-400">
								{isContinuousMode ? "(Bật)" : "(Tắt)"}
							</span>
						</div>
						<button
							onClick={() => setIsContinuousMode(!isContinuousMode)}
							className={`cursor-pointer relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${
								isContinuousMode
									? "bg-teal-500 hover:bg-teal-600"
									: "bg-slate-300 hover:bg-slate-400"
							}`}
						>
							<span
								className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
									isContinuousMode ? "translate-x-9" : "translate-x-1"
								}`}
							/>
						</button>
					</div>

					{isContinuousMode && (
						<div className="px-4 py-2 bg-teal-100/50 dark:bg-teal-900/30 rounded-lg border border-teal-300/50 dark:border-teal-600/50">
							<p className="text-xs text-teal-700 dark:text-teal-300">
								💡 Trong chế độ liên tục, AI sẽ tự động trả lời các tin nhắn của
								bạn sau 2s bạn ngừng nói mà không cần nhấn nút Send. Gõ tin nhắn
								hoặc bấm Nói để bắt đầu!
							</p>
						</div>
					)}

					{/* Voice Status */}
					{isListening ? (
						<div className="flex flex-col items-center justify-center space-y-4 py-6 bg-linear-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl border border-teal-200/30 dark:border-teal-700/30">
							<div className="relative h-16 w-16">
								<div className="absolute inset-0 animate-ping rounded-full bg-teal-400 opacity-30"></div>
								<div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-teal-500 via-emerald-500 to-cyan-500 shadow-lg">
									<AudioLines className="h-8 w-8 text-white animate-pulse" />
								</div>
							</div>
							<p className="text-teal-700 dark:text-teal-300 font-semibold text-lg">
								🎤 Đang lắng nghe...
							</p>
						</div>
					) : (
						<>
							<ChatInput
								isListening={isListening}
								transcriptApi={transcriptApi}
								resetTranscript={() => {
									setTranscriptApi("");
								}}
								onSend={(message, transcriptApi) =>
									handleSendMessage(message, transcriptApi)
								}
								isProcessing={isProcessing}
								isContinuousMode={isContinuousMode}
							/>
						</>
					)}

					{/* Control Buttons */}
					<div className="grid grid-cols-2 gap-20">
						<button
							onClick={startRecording}
							disabled={isListening}
							className="font-semibold px-6 py-3 rounded-xl bg-linear-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-600 hover:via-emerald-600 hover:to-cyan-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							Nói
						</button>
						<button
							onClick={stopRecording}
							disabled={!isListening}
							className="font-semibold px-6 py-3 rounded-xl text-heading bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
						>
							⏸️ Dừng
						</button>
					</div>
				</div>
			</div>

			<ConfirmDialog
				isOpen={showClearConfirm}
				onClose={() => setShowClearConfirm(false)}
				onConfirm={() => {
					setIsClearing(true);
					clearAllConversations();
					setIsClearing(false);
					setShowClearConfirm(false);
				}}
				title="Xóa tất cả lịch sử trò chuyện"
				message="Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không? Hành động này không thể hoàn tác."
				confirmText="Xóa tất cả"
			/>
		</div>
	);
}
