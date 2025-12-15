import { ReactNode } from "react";

export interface CardProps {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	hover?: boolean;
	transparent?: boolean;
}

const Card = ({
	children,
	className = "",
	onClick,
	hover = true,
	transparent = false,
}: CardProps) => {
	const baseClasses =
		"rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all duration-300 border-2";
	const hoverClasses = hover ? "hover:shadow-2xl hover:-translate-y-1" : "";
	const bgClasses = transparent
		? "bg-white/90 dark:bg-slate-800/90 border-teal-200/50 dark:border-teal-700/50"
		: "bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-700";
	const interactiveClasses = onClick
		? "cursor-pointer hover:border-teal-300 dark:hover:border-teal-600"
		: "";

	return (
		<div
			className={`${baseClasses} ${hoverClasses} ${bgClasses} ${interactiveClasses} ${className}`}
			onClick={onClick}
			role={onClick ? "button" : undefined}
		>
			{children}
		</div>
	);
};

export default Card;
