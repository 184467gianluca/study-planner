import React from "react";

export function Label({ className = "", children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground-muted mb-1 block ${className}`}
            {...props}
        >
            {children}
        </label>
    );
}
