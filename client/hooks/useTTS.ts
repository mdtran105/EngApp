import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { useCallback, useRef, useState } from "react";

interface UseTTSOptions {
	voice?: string;
	onStart?: () => void;
	onEnd?: () => void;
	onError?: (error: Error) => void;
}

export const useTTS = (options: UseTTSOptions = {}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const currentTextRef = useRef<string>("");

	const stop = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			audioRef.current = null;
		}
		setIsPlaying(false);
		setIsLoading(false);
		options.onEnd?.();
	}, [options]);

	const speak = useCallback(
		async (text: string) => {
			// Stop any currently playing audio
			if (isPlaying) {
				stop();
			}

			// If same text is clicked again while loading, cancel
			if (isLoading && currentTextRef.current === text) {
				stop();
				return;
			}

			currentTextRef.current = text;
			setIsLoading(true);
			options.onStart?.();

			try {
				const apiUrl = getApiUrl(API_ENDPOINTS.tts.elevenlabs);

				const response = await fetch(apiUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						text: text,
						voice: options.voice,
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error("TTS Error Response:", errorText);
					throw new Error(
						`TTS request failed: ${response.statusText} - ${errorText}`
					);
				}

				const data = await response.json();

				if (!data.audioData) {
					throw new Error(
						"No audio data received from server. Response: " +
							JSON.stringify(data)
					);
				}

				// Convert base64 to blob
				const audioBlob = base64ToBlob(
					data.audioData,
					data.contentType || "audio/mpeg"
				);

				const audioUrl = URL.createObjectURL(audioBlob);

				// Create and play audio
				const audio = new Audio();
				audio.src = audioUrl;
				audio.preload = "auto";
				audio.volume = 1.0;
				audioRef.current = audio;

				audio.onended = () => {
					URL.revokeObjectURL(audioUrl);
					setIsPlaying(false);
					setIsLoading(false);
					audioRef.current = null;
					options.onEnd?.();
				};

				audio.onerror = (error) => {
					console.error("Audio playback error:", error);
					console.error("Audio error code:", audio.error?.code);
					console.error("Audio error message:", audio.error?.message);
					URL.revokeObjectURL(audioUrl);
					setIsPlaying(false);
					setIsLoading(false);
					audioRef.current = null;
					const playbackError = new Error("Audio playback failed");
					options.onError?.(playbackError);
				};

				// Load the audio first
				audio.load();

				try {
					const playPromise = audio.play();
					if (playPromise !== undefined) {
						await playPromise;
						setIsLoading(false);
						setIsPlaying(true);
					}
				} catch (playError: any) {
					// If autoplay was blocked, don't throw
					if (playError.name === "NotAllowedError") {
						setIsLoading(false);
						setIsPlaying(false);
						// Don't throw for autoplay blocks, just log
						return;
					}
					throw playError;
				}
			} catch (error) {
				const normalizedError =
					error instanceof Error ? error : new Error("Unknown error");
				console.error("TTS Error:", normalizedError);
				setIsLoading(false);
				setIsPlaying(false);
				options.onError?.(normalizedError);
				throw normalizedError;
			}
		},
		[isPlaying, isLoading, options, stop]
	);

	return {
		speak,
		stop,
		isPlaying,
		isLoading,
	};
};

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, contentType: string): Blob {
	const byteCharacters = atob(base64);
	const byteArrays: BlobPart[] = [];

	for (let offset = 0; offset < byteCharacters.length; offset += 512) {
		const slice = byteCharacters.slice(offset, offset + 512);
		const byteNumbers = new Array(slice.length);

		for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		const byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}

	return new Blob(byteArrays, { type: contentType });
}
