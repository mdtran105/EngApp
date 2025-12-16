import { API_DOMAIN } from "./config";

const USER_ID_KEY = "english_chatbot_user_id";

export interface User {
	id: string;
	name: string;
	email?: string;
	level: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Get or create user ID
 */
export const getUserId = async (): Promise<string> => {
	// Check if user ID exists in localStorage
	const savedUserId = localStorage.getItem(USER_ID_KEY);
	if (savedUserId) {
		return savedUserId;
	}

	// Create new user
	try {
		const user = await createUser();
		localStorage.setItem(USER_ID_KEY, user.id);
		return user.id;
	} catch (error) {
		console.error("Failed to create user:", error);
		// Fallback: generate temporary ID
		const tempId = `temp_${Date.now()}`;
		localStorage.setItem(USER_ID_KEY, tempId);
		return tempId;
	}
};

/**
 * Create new user
 */
export const createUser = async (
	name?: string,
	email?: string,
	level?: string
): Promise<User> => {
	// Get user preferences if available
	const prefsStr = localStorage.getItem("user_preferences");
	let prefs = { fullName: "User", level: "beginner" };
	if (prefsStr) {
		prefs = JSON.parse(prefsStr);
	}

	const response = await fetch(`${API_DOMAIN}/api/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: name || prefs.fullName || "User",
			email: email,
			level: level || prefs.level || "beginner",
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to create user");
	}

	return await response.json();
};

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
	try {
		const response = await fetch(`${API_DOMAIN}/api/users/${userId}`);
		if (!response.ok) {
			return null;
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to get user:", error);
		return null;
	}
};

/**
 * Clear user ID (for logout/reset)
 */
export const clearUserId = (): void => {
	localStorage.removeItem(USER_ID_KEY);
};

/**
 * Get user information with fallback to localStorage
 * This is a compatibility function that tries database first, then localStorage
 */
export const getUserInfo = async () => {
	// Try to get authenticated user from authService
	try {
		const { getCurrentUser, isLoggedIn } = await import("./authService");

		if (isLoggedIn()) {
			const user = await getCurrentUser();
			if (user) {
				return {
					fullName: user.name,
					level: user.level,
					hasCompletedOnboarding: true,
					email: user.email,
				};
			}
		}
	} catch (error) {
		console.error("Failed to get authenticated user:", error);
	}

	// Fallback to localStorage
	const { getUserPreferences } = await import("./localStorage");
	const localPrefs = getUserPreferences();
	return {
		fullName: localPrefs.fullName || "Guest",
		level: (localPrefs.proficiencyLevel?.toString() || "beginner") as string,
		hasCompletedOnboarding: localPrefs.hasCompletedOnboarding || false,
		email: undefined,
	};
};
