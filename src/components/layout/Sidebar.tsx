"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Map, GanttChartSquare } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Course Manager", href: "/manager", icon: BookOpen },
        { name: "Roadmap", href: "/roadmap", icon: Map },
        { name: "Timeline", href: "/timeline", icon: GanttChartSquare },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300">
            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-center p-4 border-b border-border mb-4">
                    <h1 className="text-2xl font-bold text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                        Planner
                    </h1>
                </div>
                <nav className="flex-1 space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-primary/10 text-primary shadow-[inset_4px_0_0_0_rgba(0,229,255,1)]"
                                        : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto p-4 text-xs text-foreground-muted text-center border-t border-border">
                    <p>Semester Systems v1.0</p>
                </div>
            </div>
        </aside>
    );
}
