export type Message = {
	id: string;
	content: string;
	sender: "user" | "ai";
	suggestions?: string[];
	timestamp: Date;
};

export type Conversation = {
	id: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
};

export interface ChatRequest {
	ChatHistory: {
		FromUser: boolean;
		Message: string;
	}[];
	Question: string;
	imagesAsBase64?: string[];
}

export interface ChatResponse {
	MessageInMarkdown: string;
	Suggestions: string[];
	reply: string;
}
