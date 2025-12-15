"use client";

import { useBrowserTTS } from "@/hooks/useBrowserTTS";
import { useTTS } from "@/hooks/useTTS";
import React, { createContext, useContext } from "react";

interface GlobalTTSContextType {
	speak: (text: string, id?: string) => Promise<void>;
	stop: () => void;
	isPlaying: boolean;
	isLoading: boolean;
	currentPlayingId: string | null;
}

const GlobalTTSContext = createContext<GlobalTTSContextType | undefined>(
	undefined
);

export const GlobalTTSProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentPlayingId, setCurrentPlayingId] = React.useState<string | null>(
		null
	);
	const [engine, setEngine] = React.useState<"server" | "browser">("server");

	const resetPlaying = React.useCallback(() => setCurrentPlayingId(null), []);

	const {
		speak: speakServer,
		stop: stopServer,
		isLoading: isServerLoading,
		isPlaying: isServerPlaying,
	} = useTTS({
		onEnd: resetPlaying,
		onError: resetPlaying,
	});

	const {
		speak: speakBrowser,
		stop: stopBrowser,
		isLoading: isBrowserLoading,
		isPlaying: isBrowserPlaying,
	} = useBrowserTTS({
		onEnd: resetPlaying,
		onError: resetPlaying,
	});

	// Wrap speak to remember current id
	const speakWithId = React.useCallback(
		async (text: string, id?: string) => {
			setCurrentPlayingId(id || null);
			setEngine("server");
			try {
				await speakServer(text);
			} catch (err) {
				console.warn("Server TTS failed, falling back to browser TTS", err);
				setEngine("browser");
				speakBrowser(text);
			}
		},
		[speakServer, speakBrowser]
	);

	const stopWithReset = React.useCallback(() => {
		setCurrentPlayingId(null);
		stopServer();
		stopBrowser();
	}, [stopServer, stopBrowser]);

	const isPlaying = engine === "server" ? isServerPlaying : isBrowserPlaying;
	const isLoading = engine === "server" ? isServerLoading : isBrowserLoading;

	return (
		<GlobalTTSContext.Provider
			value={{
				speak: speakWithId,
				stop: stopWithReset,
				isPlaying,
				isLoading,
				currentPlayingId,
			}}
		>
			{children}
		</GlobalTTSContext.Provider>
	);
};

export const useGlobalTTS = (): GlobalTTSContextType => {
	const context = useContext(GlobalTTSContext);
	if (!context) {
		throw new Error("useGlobalTTS must be used within GlobalTTSProvider");
	}
	return context;
};
