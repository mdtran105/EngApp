"use client";

import MarkdownRenderer from "@/components/MarkdownRenderer";
import Navbar from "@/components/Navbar";
import { API_DOMAIN } from "@/lib/config";
import { getUserPreferences } from "@/lib/localStorage";
import {
	BookOpen,
	ChevronDown,
	History,
	Search,
	Sparkles,
	Volume2,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";

const VISITED_KEY = "has-visited-dictionary";
const RECENT_SEARCHES_KEY = "recent-dictionary-searches";

type RecentSearch = {
	keyword: string;
	timestamp: Date;
};

interface DictionaryResponse {
	content: string;
	audioUrls: { us: string };
}

// 100 diverse vocabulary items including words, phrasal verbs, idioms, and business terms
const SAMPLE_SEARCHES = [
	// Common vocabulary
	"accomplish",
	"resilient",
	"endeavor",
	"persistent",
	"innovative",
	"efficient",
	"versatile",
	"meticulous",
	"profound",
	"ambiguous",
	"diligent",
	"authentic",
	"genuine",
	"spontaneous",
	"tremendous",
	"significant",
	"inevitable",
	"dynamic",
	"crucial",
	"essential",
	// Phrasal verbs
	"break down",
	"carry out",
	"look up to",
	"give up",
	"put off",
	"figure out",
	"get along",
	"bring up",
	"hold on",
	"come across",
	"take off",
	"look forward to",
	"run into",
	"catch up",
	"stand out",
	"turn down",
	"work out",
	"put up with",
	"set up",
	"hang out",
	// Academic vocabulary
	"methodology",
	"hypothesis",
	"empirical",
	"paradigm",
	"synthesis",
	"preliminary",
	"subsequent",
	"comprehensive",
	"fundamental",
	"perspective",
	"theoretical",
	"analytical",
	"coherent",
	"correlate",
	"derivative",
	"qualitative",
	"quantitative",
	"abstract",
	"conceptual",
	"implicit",
	// Idioms
	"piece of cake",
	"break the ice",
	"hit the nail on the head",
	"under the weather",
	"bite the bullet",
	"blessing in disguise",
	"cost an arm and a leg",
	"pull yourself together",
	"beat around the bush",
	"once in a blue moon",
	"get cold feet",
	"let the cat out of the bag",
	"kill two birds with one stone",
	"barking up the wrong tree",
	"cut corners",
	"spill the beans",
	"tie the knot",
	"paint the town red",
	"call it a day",
	"face the music",
	// Business vocabulary
	"outsource",
	"stakeholder",
	"leverage",
	"implementation",
	"initiative",
	"benchmark",
	"sustainable",
	"optimize",
	"facilitate",
	"strategize",
	"incentivize",
	"monetize",
	"scalable",
	"synergy",
	"metrics",
	"portfolio",
	"acquisition",
	"revenue",
	"diversify",
	"innovative",
];

export default function DictionaryPage() {
	const [keyword, setKeyword] = useState("");
	const [context, setContext] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [showContextInput, setShowContextInput] = useState(false);
	const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
	const [showRecent, setShowRecent] = useState(true);
	const router = useRouter();
	const preferences = getUserPreferences();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [displayedSearches, setDisplayedSearches] = useState<string[]>([]);

	// New states for inline result display
	const [result, setResult] = useState<DictionaryResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const { speak, speaking } = useSpeechSynthesis();

	useEffect(() => {
		if (!preferences.hasCompletedOnboarding) {
			router.push("/");
			return;
		}

		// Load recent searches
		const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
		if (savedSearches) {
			setRecentSearches(JSON.parse(savedSearches));
		}

		// Randomly select 5 sample searches
		const shuffled = [...SAMPLE_SEARCHES].sort(() => 0.5 - Math.random());
		setDisplayedSearches(shuffled.slice(0, 5));
	}, [router, preferences.hasCompletedOnboarding]);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!keyword.trim() || isSubmitting) return;

		const trimmedKeyword = keyword.trim();

		// Validate keyword length
		if (trimmedKeyword.length > 20) {
			setError("Từ khóa không được vượt quá 20 ký tự");
			return;
		}

		setIsSubmitting(true);
		setIsLoading(true);
		setShowResult(true);
		setError(null);

		// Save to recent searches
		const newSearch: RecentSearch = {
			keyword: trimmedKeyword,
			timestamp: new Date(),
		};

		const updatedSearches = [
			newSearch,
			...recentSearches.filter((s) => s.keyword !== trimmedKeyword).slice(0, 4),
		];
		setRecentSearches(updatedSearches);
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));

		try {
			// Fetch dictionary result
			const response = await fetch(`${API_DOMAIN}/api/dictionary`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					keyword: trimmedKeyword,
				}),
			});

			if (!response.ok) {
				throw new Error((await response.text()) || "Không thể tra cứu từ điển");
			}

			const data = await response.json();
			setResult(data);

			// Scroll to result section smoothly
			setTimeout(() => {
				document.getElementById("result-section")?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		} catch (err) {
			console.error("Search error:", err);
			setError(
				err instanceof Error ? err.message : "Đã xảy ra lỗi khi tra cứu"
			);
			setResult(null);
		} finally {
			setIsLoading(false);
			setIsSubmitting(false);
		}
	};

	const handleRecentSearch = async (search: RecentSearch) => {
		setKeyword(search.keyword);
		setIsLoading(true);
		setShowResult(true);
		setError(null);

		try {
			const response = await fetch(`${API_DOMAIN}/api/dictionary`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					keyword: search.keyword,
				}),
			});

			if (!response.ok) {
				throw new Error("Không thể tra cứu từ điển");
			}

			const data = await response.json();
			setResult(data);

			setTimeout(() => {
				document.getElementById("result-section")?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		} catch (err) {
			console.error("Search error:", err);
			setError(
				err instanceof Error ? err.message : "Đã xảy ra lỗi khi tra cứu"
			);
			setResult(null);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSuggestionClick = async (word: string) => {
		setKeyword(word);
		setContext("");
		setShowContextInput(false);
		setIsLoading(true);
		setShowResult(true);
		setError(null);

		try {
			const response = await fetch(`${API_DOMAIN}/api/dictionary`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ keyword: word }),
			});

			if (!response.ok) {
				throw new Error("Không thể tra cứu từ điển");
			}

			const data = await response.json();
			setResult(data);

			// Save to recent searches
			const newSearch: RecentSearch = {
				keyword: word,
				timestamp: new Date(),
			};
			const updatedSearches = [
				newSearch,
				...recentSearches.filter((s) => s.keyword !== word).slice(0, 4),
			];
			setRecentSearches(updatedSearches);
			localStorage.setItem(
				RECENT_SEARCHES_KEY,
				JSON.stringify(updatedSearches)
			);

			setTimeout(() => {
				document.getElementById("result-section")?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		} catch (err) {
			console.error("Search error:", err);
			setError(
				err instanceof Error ? err.message : "Đã xảy ra lỗi khi tra cứu"
			);
			setResult(null);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-purple-400 to-blue-600">
			<div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-400 blur-3xl opacity-30"></div>
			<div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-400 blur-3xl opacity-30"></div>
			<Navbar />

			{/* Main Content */}
			<div className="container mx-auto px-4 pt-20 py-10 mt-4">
				<div className="mx-auto max-w-4xl">
					{/* Hero Section */}
					<div
						className={`mb-8 text-center transition-all duration-500 ${
							showResult ? "mb-6" : "mb-12"
						}`}
					>
						<div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
							<BookOpen className="h-10 w-10" />
						</div>
						<h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
							TỪ ĐIỂN
						</h1>
						<p className="mx-auto max-w-xl text-slate-600 dark:text-slate-400 text-sm">
							Tra cứu từ vựng tiếng Anh chi tiết với định nghĩa, phát âm, ví dụ
							và hơn thế nữa.
						</p>
					</div>

					{/* Search Form */}
					<div className="relative mb-8 space-y-6">
						<form onSubmit={handleSearch} className="space-y-4">
							{error && (
								<div className="animate-fadeIn rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400">
									<div className="flex items-center space-x-2">
										<span className="font-medium">Lỗi:</span>
										<span>{error}</span>
									</div>
								</div>
							)}

							<div className="relative flex gap-5">
								<input
									type="text"
									value={keyword}
									onChange={(e) => setKeyword(e.target.value)}
									onKeyDown={(e) => {
										setError(null);
										if (e.key === "Enter") {
											e.preventDefault();
											if (keyword.trim() && !isSubmitting) handleSearch(e);
										}
									}}
									className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
									placeholder="Nhập từ cần tra cứu..."
									required
								/>
								{/* <button
									type="button"
									onClick={() => setShowContextInput(!showContextInput)}
									className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
									title="Thêm ngữ cảnh"
								>
									<Sparkles className="h-5 w-5" />
								</button> */}
								<button
									type="submit"
									disabled={isSubmitting || !keyword.trim()}
									className={`group relative cursor-pointer w-full transform overflow-hidden rounded-xl px-6 py-4 font-medium text-white shadow-lg transition-all duration-200 ${
										isSubmitting || !keyword.trim()
											? "cursor-not-allowed bg-slate-500"
											: "bg-gradient-to-r from-blue-500 to-cyan-400 shadow-blue-500/25 hover:translate-y-[-2px] hover:shadow-xl dark:shadow-blue-900/25"
									}`}
								>
									<div className="relative z-10 flex items-center justify-center space-x-2">
										<Search className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
										<span>{isSubmitting ? "Đang tra cứu..." : "Tra cứu"}</span>
									</div>
									<div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:translate-x-0" />
								</button>
							</div>

							{/* {showContextInput && (
								<div className="animate-fadeIn">
									<textarea
										value={context}
										onChange={(e) => {
											setError(null);
											setContext(e.target.value);
										}}
										className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
										placeholder="Thêm ngữ cảnh để nhận kết quả chính xác hơn. Ngữ cảnh là đoạn văn bản chứa từ khóa cần tra cứu."
										rows={3}
									/>
								</div>
							)} */}

							{/* Sample Searches - Only show when no result */}
							{!showResult && (
								<div className="rounded-xl bg-white p-4 shadow-md dark:bg-slate-800">
									<div className="mb-4 flex items-center space-x-2 text-slate-900 dark:text-white">
										<Sparkles className="h-5 w-5" />
										<h2 className="font-semibold">Có thể bạn chưa biết</h2>
									</div>
									<div className="flex flex-wrap gap-2">
										{displayedSearches.map((word, index) => (
											<button
												key={index}
												onClick={() => handleSuggestionClick(word)}
												className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 cursor-pointer"
											>
												{word}
											</button>
										))}
									</div>
								</div>
							)}
						</form>
					</div>

					{/* Result Section */}
					{showResult && (
						<div id="result-section" className="animate-fadeIn mb-8">
							<div className="rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:bg-slate-800/90">
								<div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
									<h2 className="text-2xl font-bold text-slate-900 dark:text-white">
										Kết quả tra cứu
									</h2>
									<div className="flex items-center gap-2">
										{result && (
											<button
												onClick={() => keyword && speak({ text: keyword })}
												className={`flex items-center cursor-pointer space-x-2 rounded-lg bg-white/80 px-4 py-2 text-slate-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 dark:bg-slate-700/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white ${
													speaking
														? "bg-gradient-to-r from-purple-500 to-pink-500 !text-white"
														: ""
												}`}
												title={speaking ? "Đang phát..." : "Phát âm"}
											>
												<Volume2
													className={`h-5 w-5 ${
														speaking ? "text-white animate-pulse" : ""
													}`}
												/>
											</button>
										)}
										<button
											onClick={() => {
												setShowResult(false);
												setResult(null);
												setError(null);
											}}
											className="flex items-center cursor-pointer space-x-2 rounded-lg bg-white/80 px-4 py-2 text-slate-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 dark:bg-slate-700/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
											title="Đóng"
										>
											<X className="h-5 w-5" />
										</button>
									</div>
								</div>

								{isLoading ? (
									<div className="flex flex-col items-center justify-center space-y-4 py-12">
										<div className="relative h-12 w-12">
											<div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-25"></div>
											<div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
												<Search className="h-6 w-6 text-white" />
											</div>
										</div>
										<p className="text-slate-600 dark:text-slate-400">
											Đang tra cứu...
										</p>
									</div>
								) : result ? (
									<div className="animate-fadeIn">
										<MarkdownRenderer noSplit>
											{result.content}
										</MarkdownRenderer>
									</div>
								) : (
									<div className="text-center py-8 text-slate-600 dark:text-slate-400">
										Không tìm thấy kết quả cho từ khóa này.
									</div>
								)}
							</div>
						</div>
					)}

					{/* Recent Searches */}
					{recentSearches.length > 0 && !showResult && (
						<div className="rounded-xl bg-white shadow-md dark:bg-slate-800">
							<button
								onClick={() => setShowRecent(!showRecent)}
								className="flex w-full items-center justify-between p-4"
							>
								<div className="flex items-center space-x-2 text-slate-900 dark:text-white">
									<History className="h-5 w-5" />
									<h2 className="font-semibold">Tìm kiếm gần đây</h2>
								</div>
								<ChevronDown
									className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
										showRecent ? "rotate-180" : ""
									}`}
								/>
							</button>

							{showRecent && (
								<div className="animate-fadeIn border-t border-slate-200 p-4 dark:border-slate-700">
									<div className="space-y-3">
										{recentSearches.map((search, index) => (
											<button
												key={index}
												onClick={() => handleRecentSearch(search)}
												className="w-full rounded-lg bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700"
											>
												<div className="text-sm font-medium text-slate-900 dark:text-white">
													{search.keyword}
												</div>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
