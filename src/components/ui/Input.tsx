import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={`flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-inner ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";
