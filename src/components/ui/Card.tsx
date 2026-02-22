import React from "react";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={`rounded-xl border border-border bg-surface/50 backdrop-blur-sm text-foreground shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return (
        <h3 className={`font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h3>
    );
}

export function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={`p-6 pt-0 ${className}`}>
            {children}
        </div>
    );
}
