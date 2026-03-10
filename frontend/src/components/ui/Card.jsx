import React from "react";
import { cn } from "../../utils/cn";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }) {
    return <div className={cn("p-8", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
    return <h3 className={cn("text-2xl font-bold leading-tight tracking-tight text-primary", className)} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }) {
    return <div className={cn("p-8 pt-0", className)} {...props}>{children}</div>;
}
