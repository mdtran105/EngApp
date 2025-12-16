import { API_DOMAIN } from "./config";

const USER_ID_KEY = "english_chatbot_user_id";
const AUTH_TOKEN_KEY = "english_chatbot_auth_token";

export interface User {
	id: string;
	name: string;
	email?: string;
	level: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

/**
 * Register new user
 */
export const register = async (
	name: string,
	email: string,
	password: string,
	level?: string
): Promise<AuthResponse> => {
	const response = await fetch(`${API_DOMAIN}/api/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name,
			email,
			password,
			level: level || "beginner",
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to register");
	}

	const data: AuthResponse = await response.json();

	// Save token and userId
	localStorage.setItem(AUTH_TOKEN_KEY, data.token);
	localStorage.setItem(USER_ID_KEY, data.user.id);

	return data;
};

/**
 * Login user
 */
export const login = async (
	email: string,
	password: string
): Promise<AuthResponse> => {
	const response = await fetch(`${API_DOMAIN}/api/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email,
			password,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to login");
	}

	const data: AuthResponse = await response.json();

	// Save token and userId
	localStorage.setItem(AUTH_TOKEN_KEY, data.token);
	localStorage.setItem(USER_ID_KEY, data.user.id);

	return data;
};

/**
 * Logout user
 */
export const logout = (): void => {
	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(USER_ID_KEY);
};

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
	return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
	return !!getAuthToken();
};

/**
 * Verify token and get user
 */
export const verifyToken = async (): Promise<User | null> => {
	const token = getAuthToken();
	if (!token) return null;

	try {
		const response = await fetch(`${API_DOMAIN}/api/auth/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ token }),
		});

		if (!response.ok) {
			// Token invalid or expired
			logout();
			return null;
		}

		const data = await response.json();
		return data.user;
	} catch (error) {
		console.error("Failed to verify token:", error);
		logout();
		return null;
	}
};

/**
 * Get or create anonymous user ID
 */
export const getUserId = async (): Promise<string> => {
	// Check if logged in
	const token = getAuthToken();
	if (token) {
		const user = await verifyToken();
		if (user) {
			return user.id;
		}
	}

	// Check if has anonymous user ID
	const savedUserId = localStorage.getItem(USER_ID_KEY);
	if (savedUserId) {
		return savedUserId;
	}

	// Create anonymous user
	try {
		const user = await createAnonymousUser();
		localStorage.setItem(USER_ID_KEY, user.id);
		return user.id;
	} catch (error) {
		console.error("Failed to create anonymous user:", error);
		// Fallback: generate temporary ID
		const tempId = `temp_${Date.now()}`;
		localStorage.setItem(USER_ID_KEY, tempId);
		return tempId;
	}
};

/**
 * Create anonymous user
 */
export const createAnonymousUser = async (): Promise<User> => {
	// Get user preferences if available
	const prefsStr = localStorage.getItem("user_preferences");
	let prefs = { fullName: "User", level: "beginner" };
	if (prefsStr) {
		try {
			prefs = JSON.parse(prefsStr);
		} catch (e) {
			console.error("Error parsing user preferences:", e);
		}
	}

	const response = await fetch(`${API_DOMAIN}/api/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: prefs.fullName || "Anonymous User",
			level: prefs.level || "beginner",
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to create anonymous user");
	}

	return await response.json();
};

/**
 * Claim anonymous user (convert to registered user)
 */
export const claimAnonymousUser = async (
	userId: string,
	name: string,
	email: string,
	password: string
): Promise<AuthResponse> => {
	const response = await fetch(`${API_DOMAIN}/api/auth/claim`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			userId,
			name,
			email,
			password,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to claim user");
	}

	const data: AuthResponse = await response.json();

	// Save token and userId
	localStorage.setItem(AUTH_TOKEN_KEY, data.token);
	localStorage.setItem(USER_ID_KEY, data.user.id);

	return data;
};

/**
 * Get current user (from token or anonymous)
 */
export const getCurrentUser = async (): Promise<User | null> => {
	const token = getAuthToken();
	if (token) {
		return await verifyToken();
	}

	// Get anonymous user
	const userId = localStorage.getItem(USER_ID_KEY);
	if (userId && !userId.startsWith("temp_")) {
		try {
			const response = await fetch(`${API_DOMAIN}/api/users/${userId}`);
			if (response.ok) {
				return await response.json();
			}
		} catch (error) {
			console.error("Failed to get user:", error);
		}
	}

	return null;
};
