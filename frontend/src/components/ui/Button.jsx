import React from "react";
import { cn } from "../../utils/cn";

export function Button({
    className,
    variant = "default",
    size = "default",
    children,
    ...props
}) {
    const buttonVariants = {
        default: "bg-gradient-to-r from-accent to-[#226053] text-white shadow-[0_4px_14px_0_rgba(42,117,101,0.39)] hover:shadow-[0_6px_20px_rgba(42,117,101,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300",
        secondary: "bg-white text-primary border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        ghost: "text-primary hover:bg-gray-100/50 hover:text-accent font-medium",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        danger: "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-red-500/40 hover:-translate-y-0.5 active:scale-95",
    };

    const buttonSizes = {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:grayscale",
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
