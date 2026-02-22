"use client";

import { useCourses, Season } from "@/context/CourseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TimelineView() {
    const { courses, startSeason } = useCourses();

    const getSeasonForSemester = (sem: number) => {
        const isStartWiSe = startSeason === "WiSe";
        const isOdd = sem % 2 !== 0;
        if (isStartWiSe) return isOdd ? "WiSe" : "SoSe";
        return isOdd ? "SoSe" : "WiSe";
    };

    const topLevelCourses = courses.filter(c => !c.parentModuleId);

    const getCategoryStyles = (category?: string, status?: string) => {
        const base = "border rounded-md px-3 shadow-none transition-all overflow-hidden flex items-center";
        const opacity = status === "completed" ? "opacity-100" : status === "in-progress" ? "opacity-100 ring-1 ring-primary/50" : "opacity-40 border-dashed text-foreground-muted";

        let color = "bg-surface-hover border-border text-foreground";
        if (status !== "planned") {
            switch (category) {
                case "meteorology": color = "bg-blue-500/20 border-blue-500/30 text-blue-200"; break;
                case "physics": color = "bg-purple-500/20 border-purple-500/30 text-purple-200"; break;
                case "math": color = "bg-emerald-500/20 border-emerald-500/30 text-emerald-200"; break;
                case "elective": color = "bg-orange-500/20 border-orange-500/30 text-orange-200"; break;
            }
        }

        return `${base} ${opacity} ${color}`;
    };

    if (courses.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Timeline
                    </h1>
                    <p className="text-foreground-muted mt-2">
                        Gantt chart view of your courses.
                    </p>
                </div>
                <Card>
                    <CardContent className="py-12 text-center text-foreground-muted">
                        No courses available to generate timeline. Add courses in the Manager first.
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate semester timeframe
    const minTime = 1;
    const maxTime = Math.max(...courses.map(c => c.semester), 6); // Default to at least 6 semesters
    const totalDuration = maxTime - minTime + 1; // Span of semesters

    const formatSemester = (sem: number) => {
        return `Sem ${sem} (${getSeasonForSemester(sem)})`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Timeline
                </h1>
                <p className="text-foreground-muted mt-2">
                    Visualize course durations across the semester.
                </p>
            </div>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Semester Gantt Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mt-4">
                        {/* Time Axis */}
                        <div className="flex justify-between border-b border-border pb-2 mb-4 text-xs text-foreground-muted font-medium">
                            <span>{formatSemester(minTime)}</span>
                            <span>Study Progression</span>
                            <span>{formatSemester(maxTime)}</span>
                        </div>

                        {/* Courses list */}
                        <div className="space-y-3 relative z-10">
                            {topLevelCourses.map((course) => {
                                const childCourses = courses.filter(c => c.parentModuleId === course.id);

                                const renderGanttBar = (c: typeof course, isChild: boolean = false) => {
                                    const leftPercent = ((c.semester - minTime) / totalDuration) * 100;
                                    const widthPercent = (1 / totalDuration) * 100;

                                    return (
                                        <div key={c.id} className="relative flex items-center group mb-2 last:mb-0">
                                            {/* Spacer for indentation if child */}
                                            {isChild && <div className="w-8 flex-shrink-0 flex justify-end pr-2"><div className="w-px h-full bg-border"></div></div>}

                                            <div className="relative flex-1 h-8 flex items-center">
                                                {/* Background track (subtle) */}
                                                <div className="absolute w-full h-full bg-surface/30 rounded-md border border-border/20"></div>

                                                {/* Gantt Bar */}
                                                <div
                                                    className={`absolute h-full ${getCategoryStyles(c.category, c.status)}`}
                                                    style={{
                                                        left: `${Math.max(0, leftPercent)}%`,
                                                        width: `${Math.max(2, widthPercent)}%`,
                                                    }}
                                                >
                                                    <span className={`font-semibold whitespace-nowrap truncate ${isChild ? 'text-[11px]' : 'text-xs'}`}>
                                                        {c.name}
                                                    </span>
                                                </div>

                                                {/* Tooltip on hover */}
                                                <div className="absolute opacity-0 group-hover:opacity-100 bg-surface border border-border text-foreground text-xs p-2 rounded shadow-lg z-20 bottom-full mb-1 left-1/2 transform -translate-x-1/2 pointer-events-none transition-opacity whitespace-nowrap">
                                                    <span className="font-bold">{c.name}</span> ({c.credits} Credits)<br />
                                                    Semester {c.semester} ({getSeasonForSemester(c.semester)})
                                                    {c.category && <><br /><span className="capitalize text-[10px] opacity-70">Category: {c.category}</span></>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                };

                                return (
                                    <div key={course.id} className="pt-2">
                                        {renderGanttBar(course)}
                                        {childCourses.length > 0 && (
                                            <div className="mt-1">
                                                {childCourses.map(child => renderGanttBar(child, true))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid lines */}
                        <div className="absolute inset-y-0 left-0 w-full pointer-events-none flex justify-between px-2 pt-8 z-0">
                            {Array.from({ length: totalDuration + 1 }).map((_, i) => (
                                <div key={i} className="h-full w-px bg-border/30 border-r border-dashed border-border/20"></div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-6 text-sm mt-4 text-foreground-muted">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-surface-hover border border-border border-dashed rounded-sm"></div>
                    <span className="text-xs">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/20 ring-1 ring-primary/50 rounded-sm"></div>
                    <span className="text-xs">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/50 border border-primary/30 rounded-sm"></div>
                    <span className="text-xs">Completed</span>
                </div>
                <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-blue-300">Meteorology</span>
                    <span className="text-purple-300">Physics</span>
                    <span className="text-emerald-300">Math</span>
                    <span className="text-orange-300">Electives</span>
                </div>
            </div>
        </div>
    );
}
