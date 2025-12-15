import { ChatResponse, Conversation, Message } from "@/app/chat/types";
import { API_DOMAIN } from "@/lib/config";
import { CHAT_HISTORY_KEY } from "@/lib/constants";
import {
	clearHistoryMessage,
	deleteConversation,
	generateConversationTitle,
	getConversations,
	getCurrentConversationId,
	getUserPreferences,
	saveConversation,
	setCurrentConversationId as saveCurrentConversationId,
} from "@/lib/localStorage";
import { useCallback, useEffect, useState } from "react";

export const useMessage = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [currentConversationId, setCurrentConvId] = useState<string | null>(
		null
	);
	const [hasRestoredMessages, setHasRestoredMessages] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const preferences = getUserPreferences();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isContinuousMode, setIsContinuousMode] = useState(false);
	const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);

	// Detect when component is mounted (client-side only)
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Load conversations on mount
	useEffect(() => {
		if (!isMounted) return;

		const loadedConversations = getConversations();
		setConversations(loadedConversations);

		const savedCurrentId = getCurrentConversationId();
		if (
			savedCurrentId &&
			loadedConversations.find((c) => c.id === savedCurrentId)
		) {
			setCurrentConvId(savedCurrentId);
		} else if (loadedConversations.length > 0) {
			// If no saved ID but conversations exist, use the most recent one
			const mostRecent = loadedConversations.sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			)[0];
			setCurrentConvId(mostRecent.id);
			saveCurrentConversationId(mostRecent.id);
		} else {
			// If no conversations exist, will create one
			setCurrentConvId(null);
		}
	}, [isMounted]);

	const loadInitMessage = useCallback(() => {
		if (currentConversationId) {
			// Load messages from current conversation
			setConversations((prevConversations) => {
				const conversation = prevConversations.find(
					(c) => c.id === currentConversationId
				);
				if (conversation) {
					setMessages(conversation.messages);
					setHasRestoredMessages(true);
				}
				return prevConversations;
			});
			return;
		}

		// Fallback: try to load from old CHAT_HISTORY_KEY for backward compatibility
		const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
		if (savedMessages && !hasRestoredMessages) {
			try {
				const parsedMessages = JSON.parse(savedMessages);
				// Convert string timestamps back to Date objects
				const messagesWithDates: Message[] = parsedMessages.map(
					(msg: Omit<Message, "timestamp"> & { timestamp: string }) => ({
						...msg,
						timestamp: new Date(msg.timestamp),
					})
				);
				setMessages(messagesWithDates);
				setHasRestoredMessages(true);
			} catch (error) {
				console.error("Error loading chat history:", error);
			}
		}
	}, [currentConversationId, hasRestoredMessages]);

	useEffect(() => {
		if (!isMounted) return;
		if (currentConversationId !== null) {
			loadInitMessage();
		}
	}, [isMounted, currentConversationId, loadInitMessage]);

	// Helper function to check if conversation has real content (not just welcome message)
	const hasRealContent = useCallback((messages: Message[]) => {
		// Need at least 2 messages: 1 user + 1 ai response
		if (messages.length < 2) return false;

		// Check if there's at least one user message
		const hasUserMessage = messages.some((msg) => msg.sender === "user");

		// Check if there's at least one AI response that's not the welcome message
		const hasRealAiResponse = messages.some(
			(msg) => msg.sender === "ai" && !msg.id.startsWith("welcome-")
		);

		return hasUserMessage && hasRealAiResponse;
	}, []);

	// Auto-create first conversation if none exist
	useEffect(() => {
		if (!isMounted) return;

		if (
			conversations.length === 0 &&
			!currentConversationId &&
			!hasRestoredMessages
		) {
			const newConversation: Conversation = {
				id: Date.now().toString(),
				title: "Cuộc trò chuyện mới",
				messages: [
					{
						id: "welcome-" + Date.now(),
						content: `Hello ${preferences.fullName}! I am a virtual assistant.\n\nI am here to assist you with your language learning journey. Feel free to ask me anything to practice speaking!`,
						sender: "ai",
						timestamp: new Date(),
					},
				],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Don't save to localStorage yet - only when user actually chats
			saveCurrentConversationId(newConversation.id);
			setCurrentConvId(newConversation.id);
			setConversations((prev) => [...prev, newConversation]);
			setMessages(newConversation.messages);
			setHasRestoredMessages(true);
		}
	}, [
		isMounted,
		conversations.length,
		currentConversationId,
		hasRestoredMessages,
		preferences.fullName,
	]);

	// Save current conversation when messages change
	useEffect(() => {
		if (hasRestoredMessages && messages.length > 0 && currentConversationId) {
			const realContent = hasRealContent(messages);

			// Only save if conversation has real content (not just welcome message)
			if (!realContent) {
				// Update in memory only, don't persist to localStorage
				setConversations((prev) => {
					const conversation = prev.find((c) => c.id === currentConversationId);
					if (conversation) {
						const updatedConversation: Conversation = {
							...conversation,
							messages,
							updatedAt: new Date(),
						};
						return prev.map((c) =>
							c.id === currentConversationId ? updatedConversation : c
						);
					}
					return prev;
				});
				return;
			}

			// Has real content - save to localStorage
			setConversations((prev) => {
				const conversation = prev.find((c) => c.id === currentConversationId);
				if (conversation) {
					const updatedConversation: Conversation = {
						...conversation,
						messages,
						updatedAt: new Date(),
						title:
							conversation.title === "Cuộc trò chuyện mới"
								? generateConversationTitle(messages)
								: conversation.title,
					};
					saveConversation(updatedConversation);
					return prev.map((c) =>
						c.id === currentConversationId ? updatedConversation : c
					);
				}
				return prev;
			});
			// Also save to old key for backward compatibility
			localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
		}
	}, [messages, hasRestoredMessages, currentConversationId, hasRealContent]);

	const handleClearChat = () => {
		setMessages([]);
		// setCurrentSuggestions([]);
		setHasRestoredMessages(false);
		clearHistoryMessage();
	};

	const createNewConversation = useCallback(() => {
		const newConversation: Conversation = {
			id: Date.now().toString(),
			title: "Cuộc trò chuyện mới",
			messages: [
				{
					id: "welcome-" + Date.now(),
					content: `Hello ${preferences.fullName}! I am a virtual assistant.\n\nI am here to assist you with your language learning journey. Feel free to ask me anything to practice speaking!`,
					sender: "ai",
					timestamp: new Date(),
				},
			],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Don't save to localStorage yet - only in memory
		// Will save when user actually starts chatting
		saveCurrentConversationId(newConversation.id);
		setCurrentConvId(newConversation.id);
		setConversations((prev) => [...prev, newConversation]);
		setMessages(newConversation.messages);
		setHasRestoredMessages(true);
		setLastNewMessageId(null);
	}, [preferences]);

	const clearAllConversations = useCallback(() => {
		// Clear all conversations from localStorage
		localStorage.removeItem("conversations");
		localStorage.removeItem("current-conversation-id");
		clearHistoryMessage();

		// Reset state
		setConversations([]);
		setCurrentConvId(null);
		setMessages([]);
		setHasRestoredMessages(false);

		// Create a new conversation
		createNewConversation();
	}, [createNewConversation]);

	const switchConversation = useCallback(
		(conversationId: string) => {
			const conversation = conversations.find((c) => c.id === conversationId);
			if (conversation) {
				saveCurrentConversationId(conversationId);
				setCurrentConvId(conversationId);
				setMessages(conversation.messages);
				setHasRestoredMessages(true);
				setLastNewMessageId(null);
			}
		},
		[conversations]
	);

	const removeConversation = useCallback(
		(conversationId: string) => {
			deleteConversation(conversationId);
			setConversations((prev) => prev.filter((c) => c.id !== conversationId));

			// If deleting current conversation, create a new one
			if (conversationId === currentConversationId) {
				createNewConversation();
			}
		},
		[currentConversationId, createNewConversation]
	);

	const handleSendMessage = useCallback(
		async (message: string, transcriptApi: string) => {
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
					body: JSON.stringify({ messages: conversationHistory }),
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
		[]
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
