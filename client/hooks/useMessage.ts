import { ChatResponse, Conversation, Message } from "@/app/chat/types";
import { getCurrentUser, getUserId } from "@/lib/authService";
import { API_DOMAIN } from "@/lib/config";
import { useCallback, useEffect, useState } from "react";

export const useMessage = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [currentConversationId, setCurrentConvId] = useState<string | null>(
		null
	);
	const [hasRestoredMessages, setHasRestoredMessages] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [userName, setUserName] = useState("User");
	const [isProcessing, setIsProcessing] = useState(false);
	const [isContinuousMode, setIsContinuousMode] = useState(false);
	const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);

	// Detect when component is mounted and get userId
	useEffect(() => {
		setIsMounted(true);
		getUserId().then(setUserId);
		// Get user name from authenticated user
		getCurrentUser().then((user) => {
			if (user) {
				setUserName(user.name);
			}
		});
	}, []);

	// Load chat history from server on mount
	useEffect(() => {
		if (!isMounted || !userId) return;

		const loadChatHistory = async () => {
			try {
				const response = await fetch(
					`${API_DOMAIN}/api/chat/history/${userId}?limit=100`
				);

				if (!response.ok) {
					throw new Error("Failed to load chat history");
				}

				const historyMessages = await response.json();

				// Group messages by sessionId
				const conversationsMap = new Map<string, Message[]>();

				historyMessages.forEach((msg: any) => {
					const sessionId = msg.sessionId || "default";
					if (!conversationsMap.has(sessionId)) {
						conversationsMap.set(sessionId, []);
					}

					conversationsMap.get(sessionId)!.push({
						id: msg.id,
						content: msg.content,
						sender: msg.role === "user" ? "user" : "ai",
						timestamp: new Date(msg.createdAt),
					});
				});

				// Convert to conversations array
				const loadedConversations: Conversation[] = Array.from(
					conversationsMap.entries()
				).map(([sessionId, msgs]) => {
					// Sort messages by timestamp (oldest first)
					const sortedMsgs = msgs.sort(
						(a, b) => a.timestamp.getTime() - b.timestamp.getTime()
					);

					// Generate conversation title from first user message
					const firstUserMsg = sortedMsgs.find((m) => m.sender === "user");
					let title = "Cuộc trò chuyện mới";

					if (firstUserMsg) {
						// Take first 30 characters of first user message
						const preview = firstUserMsg.content.substring(0, 30);
						title = preview + (firstUserMsg.content.length > 30 ? "..." : "");
					} else {
						// Fallback to date/time
						const date = new Date(sortedMsgs[0]?.timestamp);
						title = `Chat ${date.toLocaleDateString(
							"vi-VN"
						)} ${date.toLocaleTimeString("vi-VN", {
							hour: "2-digit",
							minute: "2-digit",
						})}`;
					}

					return {
						id: sessionId,
						title,
						messages: sortedMsgs,
						createdAt: sortedMsgs[0]?.timestamp || new Date(),
						updatedAt:
							sortedMsgs[sortedMsgs.length - 1]?.timestamp || new Date(),
					};
				});

				if (loadedConversations.length > 0) {
					// Sort conversations by updatedAt (most recent last)
					const sortedConversations = loadedConversations.sort(
						(a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
					);

					// Load the most recent conversation
					const mostRecent =
						sortedConversations[sortedConversations.length - 1];
					setCurrentConvId(mostRecent.id);
					setConversations(sortedConversations);
					setMessages(mostRecent.messages);
					setHasRestoredMessages(true);
				} else {
					// No history, create first conversation
					createFirstConversation();
				}
			} catch (error) {
				console.error("Failed to load chat history:", error);
				// On error, create first conversation
				createFirstConversation();
			}
		};

		const createFirstConversation = () => {
			const newConversation: Conversation = {
				id: Date.now().toString(),
				title: "Cuộc trò chuyện mới",
				messages: [
					{
						id: "welcome-" + Date.now(),
						content: `Hello ${userName}! I am a virtual assistant.\n\nI am here to assist you with your language learning journey. Feel free to ask me anything to practice speaking!`,
						sender: "ai",
						timestamp: new Date(),
					},
				],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			setCurrentConvId(newConversation.id);
			setConversations([newConversation]);
			setMessages(newConversation.messages);
			setHasRestoredMessages(true);
		};

		loadChatHistory();
	}, [isMounted, userId, userName]);

	const handleClearChat = async () => {
		if (!userId || !currentConversationId) return;

		try {
			// Delete chat history from server
			await fetch(`${API_DOMAIN}/api/chat/history/${userId}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId: currentConversationId }),
			});

			// Reset local state
			setMessages([
				{
					id: "welcome-" + Date.now(),
					content: `Hello ${userName}! I am a virtual assistant.\n\nI am here to assist you with your language learning journey. Feel free to ask me anything to practice speaking!`,
					sender: "ai",
					timestamp: new Date(),
				},
			]);
		} catch (error) {
			console.error("Failed to clear chat:", error);
		}
	};

	const createNewConversation = useCallback(() => {
		const newConversation: Conversation = {
			id: Date.now().toString(),
			title: "Cuộc trò chuyện mới",
			messages: [
				{
					id: "welcome-" + Date.now(),
					content: `Hello ${userName}! I am a virtual assistant.\n\nI am here to assist you with your language learning journey. Feel free to ask me anything to practice speaking!`,
					sender: "ai",
					timestamp: new Date(),
				},
			],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setCurrentConvId(newConversation.id);
		setConversations((prev) => [...prev, newConversation]);
		setMessages(newConversation.messages);
		setHasRestoredMessages(true);
		setLastNewMessageId(null);
	}, [userName]);

	const clearAllConversations = useCallback(async () => {
		if (!userId) return;

		try {
			// Clear all chat history from server
			await fetch(`${API_DOMAIN}/api/chat/history/${userId}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
			});

			// Reset state
			setConversations([]);
			setCurrentConvId(null);
			setMessages([]);
			setHasRestoredMessages(false);

			// Create a new conversation
			createNewConversation();
		} catch (error) {
			console.error("Failed to clear all conversations:", error);
		}
	}, [userId, createNewConversation]);

	const switchConversation = useCallback(
		(conversationId: string) => {
			const conversation = conversations.find((c) => c.id === conversationId);
			if (conversation) {
				setCurrentConvId(conversationId);
				setMessages(conversation.messages);
				setHasRestoredMessages(true);
				setLastNewMessageId(null);
			}
		},
		[conversations]
	);

	const removeConversation = useCallback(
		async (conversationId: string) => {
			if (!userId) return;

			try {
				// Delete from server
				await fetch(`${API_DOMAIN}/api/chat/history/${userId}`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ sessionId: conversationId }),
				});

				setConversations((prev) => prev.filter((c) => c.id !== conversationId));

				// If deleting current conversation, create a new one
				if (conversationId === currentConversationId) {
					createNewConversation();
				}
			} catch (error) {
				console.error("Failed to remove conversation:", error);
			}
		},
		[userId, currentConversationId, createNewConversation]
	);

	const handleSendMessage = useCallback(
		async (message: string, transcriptApi: string) => {
			// Ensure userId is available
			if (!userId) {
				console.error("userId is not available");
				return;
			}

			setIsProcessing(true);
			const userMessage: Message = {
				id: Date.now().toString(),
				content: message || transcriptApi,
				sender: "user",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);

			try {
				// Get current messages including the new user message
				const currentMessages = [...messages, userMessage];

				// Convert to API format (exclude welcome messages and only keep relevant history)
				let conversationHistory = currentMessages
					.filter((msg) => !msg.id.startsWith("welcome-")) // Exclude welcome messages
					.slice(-10) // Keep only last 10 messages for context (5 exchanges)
					.map((msg) => ({
						role: msg.sender === "user" ? "user" : "assistant",
						content: msg.content,
					}));

				// Ensure conversation starts with a user message
				// If first message is assistant, remove messages until we find a user message
				while (
					conversationHistory.length > 0 &&
					conversationHistory[0].role === "assistant"
				) {
					conversationHistory.shift();
				}

				// If no messages left (shouldn't happen but safety check), just send current message
				if (conversationHistory.length === 0) {
					conversationHistory = [
						{ role: "user", content: userMessage.content },
					];
				}

				const headers: HeadersInit = {
					accept: "application/json",
					"Content-Type": "application/json",
				};

				// Construct URL with query parameters
				const url = new URL(`${API_DOMAIN}/api/chat`);

				const response = await fetch(url.toString(), {
					method: "POST",
					headers,
					body: JSON.stringify({
						messages: conversationHistory,
						userId: userId,
						sessionId: currentConversationId,
					}),
				});

				if (!response.ok) {
					throw new Error(await response.text());
				}

				const aiResponse: ChatResponse = await response.json();
				const aiMessage: Message = {
					id: (Date.now() + 1).toString(),
					content: aiResponse.reply,
					sender: "ai",
					timestamp: new Date(),
					suggestions: aiResponse.Suggestions,
				};

				// TTS will be auto-played by MessageItem component
				setMessages((prev) => [...prev, aiMessage]);
				// Mark this message as the last new message to trigger auto-play
				setLastNewMessageId(aiMessage.id);
				// setCurrentSuggestions(aiResponse.Suggestions || []);
			} catch (error) {
				console.error("Chat error:", error);
				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
					sender: "ai",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsProcessing(false);
			}
		},
		[userId, currentConversationId, messages]
	);

	return {
		messages,
		setMessages,
		handleClearChat,
		handleSendMessage,
		isProcessing,
		setIsProcessing,
		isContinuousMode,
		setIsContinuousMode,
		lastNewMessageId,
		conversations,
		currentConversationId,
		createNewConversation,
		switchConversation,
		removeConversation,
		clearAllConversations,
	};
};
