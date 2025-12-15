import { useCallback, useState } from "react";

interface UseBrowserTTSOptions {
	lang?: string;
	rate?: number;
	pitch?: number;
	volume?: number;
	onError?: (error: Error) => void;
	onEnd?: () => void;
	onStart?: () => void;
}

export const useBrowserTTS = (options: UseBrowserTTSOptions = {}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const stop = useCallback(() => {
		window.speechSynthesis.cancel();
		setIsPlaying(false);
		setIsLoading(false);
		options.onEnd?.();
	}, [options]);

	const speak = useCallback(
		(text: string) => {
			try {
				// Stop any currently playing audio
				window.speechSynthesis.cancel();
				setIsLoading(true);
				options.onStart?.();

				const utterance = new SpeechSynthesisUtterance(text);
				utterance.lang = options.lang || "en-US";
				utterance.rate = options.rate || 1;
				utterance.pitch = options.pitch || 1;
				utterance.volume = options.volume || 1;

				utterance.onstart = () => {
					setIsLoading(false);
					setIsPlaying(true);
				};

				utterance.onend = () => {
					setIsPlaying(false);
					setIsLoading(false);
					options.onEnd?.();
				};

				utterance.onerror = (event) => {
					console.error("Speech synthesis error:", event);
					setIsPlaying(false);
					setIsLoading(false);
					options.onError?.(
						new Error(`Speech synthesis error: ${event.error}`)
					);
				};

				window.speechSynthesis.speak(utterance);
			} catch (error) {
				console.error("TTS Error:", error);
				setIsLoading(false);
				setIsPlaying(false);
				options.onError?.(
					error instanceof Error ? error : new Error("Unknown error")
				);
			}
		},
		[options]
	);

	return {
		speak,
		stop,
		isPlaying,
		isLoading,
	};
};
