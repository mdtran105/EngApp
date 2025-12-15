import TypingIndicator from "@/components/TypingIndicator";
import { useEffect, useRef, useState } from "react";
import { Message } from "../types";
import MessageItem from "./MessageItem";

interface ChatMessagesProps {
	messages: Message[];
	isProcessing: boolean;
	onClearChat: () => void;
	isClearing: boolean;
	onShowClearConfirm: () => void;
	lastNewMessageId: string | null;
}

export default function ChatMessages({
	messages,
	isProcessing,
	isClearing,
	onShowClearConfirm,
	lastNewMessageId,
}: ChatMessagesProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [lastAutoPlayedId, setLastAutoPlayedId] = useState<string | null>(null);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isProcessing]);

	// Track the last AI message for auto-play
	// Auto-play only for newly added messages (from API), not restored messages
	useEffect(() => {
		if (
			!isProcessing &&
			lastNewMessageId &&
			lastNewMessageId !== lastAutoPlayedId
		) {
			setLastAutoPlayedId(lastNewMessageId);
		}
	}, [lastNewMessageId, isProcessing, lastAutoPlayedId]);

	return (
		<div className="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] rounded-t-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700">
			<div className="p-3 space-y-2 scroll-smooth">
				{/* Messages */}
				{messages.map((message) => (
					<MessageItem
						key={message.id}
						message={message}
						autoPlay={
							message.sender === "ai" && message.id === lastAutoPlayedId
						}
					/>
				))}{" "}
				{/* Typing Indicator */}
				{isProcessing && (
					<div className="flex justify-start">
						<TypingIndicator />
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
