import { useGlobalTTS } from "@/contexts/GlobalTTSContext";
import { API_DOMAIN } from "@/lib/config";
import { useEffect, useRef, useState } from "react";
// import SpeechRecognition from "react-speech-recognition";

export const useRecordAudio = (isContinuousMode: boolean = false) => {
	const { speak, stop: stopTTS } = useGlobalTTS();
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const [transcriptApi, setTranscriptApi] = useState("");
	const [isListening, setIsListening] = useState(false);
	const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const compressorRef = useRef<DynamicsCompressorNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);

	const SILENCE_THRESHOLD = 30; // Volume threshold adjusted for compressed audio
	const SILENCE_DURATION = 1500; // Must be silent for 1.5 seconds before stopping
	const MIN_SPEAKING_TIME = 500; // Minimum time to speak before silence detection starts
	const speakingStartTimeRef = useRef<number>(0);

	const checkForSilence = (analyser: AnalyserNode) => {
		const dataArray = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(dataArray);

		// Calculate RMS (Root Mean Square) for better accuracy
		const sumSquares = dataArray.reduce((sum, value) => sum + value * value, 0);
		const rms = Math.sqrt(sumSquares / dataArray.length);

		// Also check peak volume to detect sudden sounds
		const maxVolume = Math.max(...dataArray);

		return rms < SILENCE_THRESHOLD && maxVolume < SILENCE_THRESHOLD * 2;
	};

	// Dừng ghi âm
	const stopRecording = () => {
		if (silenceTimerRef.current) {
			clearTimeout(silenceTimerRef.current);
			silenceTimerRef.current = null;
		}
		if (silenceIntervalRef.current) {
			clearInterval(silenceIntervalRef.current);
			silenceIntervalRef.current = null;
		}
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== "inactive"
		) {
			mediaRecorderRef.current.stop();
		}
		// SpeechRecognition.stopListening();
	};

	const startSilenceDetection = () => {
		if (!analyserRef.current) {
			return;
		}

		let silenceDuration = 0;
		let consecutiveSilentChecks = 0;
		const CHECKS_NEEDED = 1; // Need 1 consecutive silent check before counting

		silenceIntervalRef.current = setInterval(() => {
			if (!analyserRef.current || !mediaRecorderRef.current) {
				if (silenceIntervalRef.current) {
					clearInterval(silenceIntervalRef.current);
					silenceIntervalRef.current = null;
				}
				return;
			}

			// Don't detect silence during minimum speaking time
			const timeSinceSpeakingStarted =
				Date.now() - speakingStartTimeRef.current;
			if (timeSinceSpeakingStarted < MIN_SPEAKING_TIME) {
				return;
			}

			const isSilent = checkForSilence(analyserRef.current);

			if (isSilent) {
				consecutiveSilentChecks++;
				// Only start counting silence after consistent silent checks
				if (consecutiveSilentChecks >= CHECKS_NEEDED) {
					silenceDuration += 100;
					if (silenceDuration >= SILENCE_DURATION) {
						if (silenceIntervalRef.current) {
							clearInterval(silenceIntervalRef.current);
							silenceIntervalRef.current = null;
						}
						stopRecording();
					}
				}
			} else {
				// Reset both counters when sound is detected
				silenceDuration = 0;
				consecutiveSilentChecks = 0;
			}
		}, 100);
	};

	const startRecording = async () => {
		setIsListening(true);
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				alert(
					"Trình duyệt không hỗ trợ ghi âm (getUserMedia). Vui lòng dùng Chrome trên Android hoặc Safari mới nhất."
				);
				setIsListening(false);
				return;
			}
			stopTTS();
			// resetTranscript();
			// Improved audio constraints for better quality
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true, // Khử tiếng vọng
					noiseSuppression: true, // Giảm nhiễu
					autoGainControl: false, // Tắt tự động điều chỉnh âm lượng
					sampleRate: 48000, // Tần số lấy mẫu (48kHz = chất lượng cao)
					sampleSize: 16, // 16-bit audio
					channelCount: 1, // Mono (1 kênh)
				},
			});
			streamRef.current = stream;

			// Setup Web Audio API with audio processing pipeline
			const audioContext = new (window.AudioContext ||
				(window as any).webkitAudioContext)();
			audioContextRef.current = audioContext;

			// Create audio nodes
			const source = audioContext.createMediaStreamSource(stream);

			// Compressor - Cân bằng âm lượng
			const compressor = audioContext.createDynamicsCompressor();
			compressor.threshold.value = -50; // Start compressing at -50dB
			compressor.knee.value = 40; // Smooth compression curve
			compressor.ratio.value = 12; // Compression ratio
			compressor.attack.value = 0.003; // Fast attack (3ms)
			compressor.release.value = 0.25; // 250ms release
			compressorRef.current = compressor;

			// Add gain node for volume boost
			const gainNode = audioContext.createGain();
			gainNode.gain.value = 1.5; // Boost volume by 50%
			gainNodeRef.current = gainNode;

			// Create analyser for silence detection
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 2048;
			analyser.smoothingTimeConstant = 0.8;
			analyser.minDecibels = -90;
			analyser.maxDecibels = -10;
			analyserRef.current = analyser;

			// Connect the audio pipeline: source -> compressor -> gain -> analyser
			source.connect(compressor);
			compressor.connect(gainNode);
			gainNode.connect(analyser);

			// Note: We don't connect analyser to destination as we only use it for analysis
			// The original stream is still recorded by MediaRecorder

			// Choose best available audio format with fallback
			let mimeType = "audio/webm;codecs=opus"; // OPUS codec - nén tốt, chất lượng cao
			if (!MediaRecorder.isTypeSupported(mimeType)) {
				if (MediaRecorder.isTypeSupported("audio/webm")) {
					mimeType = "audio/webm";
				} else if (MediaRecorder.isTypeSupported("audio/mp4")) {
					mimeType = "audio/mp4";
				} else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
					mimeType = "audio/ogg;codecs=opus";
				} else {
					mimeType = ""; // Let browser choose default
				}
			}

			const recorderOptions: MediaRecorderOptions = mimeType
				? { mimeType, audioBitsPerSecond: 128000 }
				: { audioBitsPerSecond: 128000 };

			mediaRecorderRef.current = new MediaRecorder(stream, recorderOptions);
			audioChunksRef.current = [];
			// Lưu chunks âm thanh vào array
			mediaRecorderRef.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data); // Mỗi chunk là một Blob
				}
			};

			mediaRecorderRef.current.onstop = async () => {
				// Use the actual mimeType that was recorded
				const recordedMimeType =
					mediaRecorderRef.current?.mimeType || "audio/webm";

				// Ghép tất cả chunks thành 1 Blob
				const audioBlob = new Blob(audioChunksRef.current, {
					type: recordedMimeType,
				});
				const url = URL.createObjectURL(audioBlob);
				setAudioURL(url);

				if (audioChunksRef.current.length === 0) {
					setIsListening(false);
					return;
				}

				const urlApi = new URL(`${API_DOMAIN}/api/chat/whisper`);

				// Tạo FormData để upload
				const formData = new FormData();
				formData.append("file", audioBlob, "speech.webm");
				try {
					const res = await fetch(urlApi.toString(), {
						method: "POST",
						body: formData, // Gửi binary data
					});
					const data = await res.json();
					setTranscriptApi(data.transcript);
				} catch (error) {
					console.error("Error transcribing audio:", error);
				} finally {
					setIsListening(false);
					// Stop audio context and close stream
					if (audioContextRef.current) {
						audioContextRef.current.close();
						audioContextRef.current = null;
					}
					if (streamRef.current) {
						streamRef.current.getTracks().forEach((track) => track.stop());
						streamRef.current = null;
					}
					analyserRef.current = null;
					compressorRef.current = null;
					gainNodeRef.current = null;
				}
			};

			mediaRecorderRef.current.start();
			// SpeechRecognition.startListening({ continuous: true });

			// Start silence detection after a short delay to allow audio to stabilize
			// Only enable silence detection in continuous mode
			if (isContinuousMode) {
				speakingStartTimeRef.current = Date.now();
				setTimeout(() => {
					startSilenceDetection();
				}, 500);
			}
		} catch (error) {
			console.log("error", error);
			setIsListening(false);
		}
	};

	useEffect(() => {
		if (!transcriptApi) {
			setAudioURL(null);
		}
	}, [transcriptApi]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (silenceIntervalRef.current) {
				clearInterval(silenceIntervalRef.current);
			}
			if (silenceTimerRef.current) {
				clearTimeout(silenceTimerRef.current);
			}
			if (audioContextRef.current) {
				audioContextRef.current.close();
			}
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	return {
		audioURL,
		setAudioURL,
		speak,
		cancel: stopTTS,
		isListening,
		startRecording,
		stopRecording,
		transcriptApi,
		setTranscriptApi,
	};
};
