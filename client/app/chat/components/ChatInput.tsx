import { Send } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

interface ChatInputProps {
	onSend: (message: string, transcriptApi: string) => Promise<void>;
	isProcessing: boolean;
	resetTranscript?: () => void;
	isListening: boolean;
	transcriptApi: string;
	isContinuousMode?: boolean;
}

export default function ChatInput({
	// inputMessage = "",
	onSend,
	isProcessing,
	resetTranscript,
	transcriptApi,
	isListening,
	isContinuousMode = false,
}: ChatInputProps) {
	const { register, handleSubmit, watch, reset, setValue } = useForm<{
		message: string;
	}>({
		defaultValues: { message: "" },
	});

	const message = watch("message");
	const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

	const handleFormSubmit = useCallback(() => {
		if ((!message.trim() && !transcriptApi) || isListening) return;
		onSend(message, transcriptApi);
		reset({ message: "" });
		resetTranscript?.();
	}, [transcriptApi, message, onSend, reset, resetTranscript, isListening]);

	// Auto-send logic for continuous mode
	useEffect(() => {
		if (isContinuousMode && !isProcessing && !isListening) {
			const finalMessage = message.trim() || (transcriptApi?.trim() ?? "");

			if (finalMessage) {
				// Clear previous timer
				if (autoSendTimerRef.current) {
					clearTimeout(autoSendTimerRef.current);
				}

				// Set new timer for auto-send after user stops typing (2 seconds)
				autoSendTimerRef.current = setTimeout(() => {
					handleFormSubmit();
				}, 2000);
			}
		}

		return () => {
			if (autoSendTimerRef.current) {
				clearTimeout(autoSendTimerRef.current);
			}
		};
	}, [
		isContinuousMode,
		message,
		transcriptApi,
		isProcessing,
		isListening,
		handleFormSubmit,
	]);

	useEffect(() => {
		if (transcriptApi) {
			setValue("message", transcriptApi);
		}
	}, [transcriptApi, setValue]);

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
			<div className="flex items-center space-x-2">
				<textarea
					{...register("message")}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleFormSubmit();
						}
					}}
					placeholder={
						isListening
							? "Listening..."
							: isContinuousMode
							? "Gõ tin nhắn (sẽ gửi tự động)"
							: "Shift + Enter để xuống dòng"
					}
					disabled={isProcessing}
					className="text-sm xs:text-xs flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 max-h-32"
				/>

				{!isContinuousMode && (
					<button
						type="submit"
						disabled={isProcessing || !message.trim()}
						className={`rounded-lg p-2.5 text-white transition-all duration-200 ${
							isProcessing || !message.trim()
								? "bg-slate-400 cursor-not-allowed opacity-50"
								: "bg-linear-to-r from-orange-700 to-amber-600 hover:from-orange-700 hover:to-amber-700"
						}`}
					>
						<Send className={`h-5 w-5 ${isProcessing ? "opacity-30" : ""}`} />
					</button>
				)}
			</div>
		</form>
	);
}
