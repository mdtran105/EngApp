import { Conversation, Message } from "@/app/chat/types";
import {
	CHAT_HISTORY_KEY,
	CONVERSATIONS_KEY,
	CURRENT_CONVERSATION_ID_KEY,
} from "./constants";

type UserPreferences = {
	fullName: string;
	gender: string;
	age: number;
	geminiApiKey: string;
	hasCompletedOnboarding: boolean;
	proficiencyLevel: number;
};

const STORAGE_KEY = "user-preferences";

const isBrowser = typeof window !== "undefined";

export const saveUserPreferences = (preferences: Partial<UserPreferences>) => {
	if (!isBrowser) return false;

	try {
		const existing = getUserPreferences();
		const updated = { ...existing, ...preferences };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		return true;
	} catch (error) {
		console.error("Error saving user preferences:", error);
		return false;
	}
};

export const getUserPreferences = (): Partial<UserPreferences> => {
	if (!isBrowser) return {};

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch (error) {
		console.error("Error getting user preferences:", error);
		return {};
	}
};

export const hasCompletedOnboarding = (): boolean => {
	if (!isBrowser) return false;

	const preferences = getUserPreferences();
	return preferences.hasCompletedOnboarding || false;
};

export const clearHistoryMessage = () => {
	localStorage.removeItem(CHAT_HISTORY_KEY);
};

// Conversation management functions
export const saveConversations = (conversations: Conversation[]): boolean => {
	if (!isBrowser) return false;

	try {
		localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
		return true;
	} catch (error) {
		console.error("Error saving conversations:", error);
		return false;
	}
};

export const getConversations = (): Conversation[] => {
	if (!isBrowser) return [];

	try {
		const stored = localStorage.getItem(CONVERSATIONS_KEY);
		if (!stored) return [];

		const conversations = JSON.parse(stored);
		// Convert string timestamps back to Date objects
		return conversations.map((conv: any) => ({
			...conv,
			createdAt: new Date(conv.createdAt),
			updatedAt: new Date(conv.updatedAt),
			messages: conv.messages.map((msg: any) => ({
				...msg,
				timestamp: new Date(msg.timestamp),
			})),
		}));
	} catch (error) {
		console.error("Error getting conversations:", error);
		return [];
	}
};

export const saveConversation = (conversation: Conversation): boolean => {
	if (!isBrowser) return false;

	try {
		const conversations = getConversations();
		const existingIndex = conversations.findIndex(
			(c) => c.id === conversation.id
		);

		if (existingIndex >= 0) {
			conversations[existingIndex] = conversation;
		} else {
			conversations.push(conversation);
		}

		return saveConversations(conversations);
	} catch (error) {
		console.error("Error saving conversation:", error);
		return false;
	}
};

export const deleteConversation = (conversationId: string): boolean => {
	if (!isBrowser) return false;

	try {
		const conversations = getConversations();
		const filtered = conversations.filter((c) => c.id !== conversationId);
		return saveConversations(filtered);
	} catch (error) {
		console.error("Error deleting conversation:", error);
		return false;
	}
};

export const getCurrentConversationId = (): string | null => {
	if (!isBrowser) return null;

	try {
		return localStorage.getItem(CURRENT_CONVERSATION_ID_KEY);
	} catch (error) {
		console.error("Error getting current conversation ID:", error);
		return null;
	}
};

export const setCurrentConversationId = (conversationId: string): boolean => {
	if (!isBrowser) return false;

	try {
		localStorage.setItem(CURRENT_CONVERSATION_ID_KEY, conversationId);
		return true;
	} catch (error) {
		console.error("Error setting current conversation ID:", error);
		return false;
	}
};

export const generateConversationTitle = (messages: Message[]): string => {
	// Get first user message to generate title
	const firstUserMessage = messages.find((m) => m.sender === "user");
	if (!firstUserMessage) return "Cuộc trò chuyện mới";

	// Truncate to first 50 characters
	const title = firstUserMessage.content.slice(0, 50);
	return title.length < firstUserMessage.content.length ? title + "..." : title;
};
