import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";

    const variants = {
        primary: "bg-primary text-background hover:bg-primary-dark shadow-[0_0_10px_rgba(0,229,255,0.4)]",
        secondary: "bg-secondary text-white hover:bg-secondary/80",
        danger: "bg-danger text-white hover:bg-danger/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]",
        ghost: "hover:bg-surface-hover hover:text-foreground text-foreground-muted",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}
