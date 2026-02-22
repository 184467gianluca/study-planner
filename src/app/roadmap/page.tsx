"use client";

import { useCourses } from "@/context/CourseContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Map, CheckCircle2, CircleDashed, Clock } from "lucide-react";

export default function RoadmapView() {
    const { courses, startSeason } = useCourses();

    const sortedCourses = [...courses].sort((a, b) => a.semester - b.semester);

    const getSeasonForSemester = (sem: number) => {
        const isStartWiSe = startSeason === "WiSe";
        const isOdd = sem % 2 !== 0;
        if (isStartWiSe) return isOdd ? "WiSe" : "SoSe";
        return isOdd ? "SoSe" : "WiSe";
    };

    const topLevelCourses = sortedCourses.filter(c => !c.parentModuleId);

    const getCategoryStyles = (category?: string) => {
        switch (category) {
            case "meteorology": return "bg-blue-500/5 text-blue-300 border-blue-500/20";
            case "physics": return "bg-purple-500/5 text-purple-300 border-purple-500/20";
            case "math": return "bg-emerald-500/5 text-emerald-300 border-emerald-500/20";
            case "elective": return "bg-orange-500/5 text-orange-300 border-orange-500/20";
            default: return "bg-surface/50 text-foreground-muted border-border/50";
        }
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Roadmap
                </h1>
                <p className="text-foreground-muted mt-2">
                    High-level semester journey.
                </p>
            </div>

            {sortedCourses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-foreground-muted">
                        No courses available to generate roadmap.
                    </CardContent>
                </Card>
            ) : (
                <div className="flex-1 overflow-x-auto relative pb-8 mt-4 custom-scrollbar">
                    <div className="flex items-center absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 min-w-max px-8 z-0"></div>

                    <div className="flex items-center space-x-12 px-8 min-w-max h-full z-10 relative">
                        {topLevelCourses.map((course, index) => {
                            const childCourses = sortedCourses.filter(c => c.parentModuleId === course.id);

                            return (
                                <div key={course.id} className="relative flex flex-col justify-center w-72 h-full">
                                    {/* Node dot on the line */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-background border ${course.status === "completed" ? "border-success text-success" :
                                            course.status === "in-progress" ? "border-primary text-primary" :
                                                "border-foreground-muted text-foreground-muted"
                                            }`}>
                                            {course.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
                                                course.status === "in-progress" ? <Clock className="w-4 h-4" /> :
                                                    <CircleDashed className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {/* Card below or above the line alternating */}
                                    <div className={`transition-transform hover:-translate-y-1 ${index % 2 === 0 ? "mt-40 mb-0" : "-mt-40 mb-40"}`}>
                                        <Card className={`border shadow-sm bg-background/50 backdrop-blur-sm ${getCategoryStyles(course.category)}`}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
                                                        Sem {course.semester} ({getSeasonForSemester(course.semester)})
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-medium">
                                                        {course.credits} CP
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-sm leading-snug mb-2">
                                                    {course.name}
                                                </h3>
                                                {course.category && (
                                                    <div className="text-[10px] opacity-70 capitalize mb-1">
                                                        {course.category}
                                                    </div>
                                                )}

                                                {childCourses.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-black/10 space-y-1.5">
                                                        <p className="text-[10px] font-medium uppercase opacity-70 mb-2">Assigned Modules</p>
                                                        {childCourses.map(child => (
                                                            <div key={child.id} className={`p-2 rounded border text-[11px] flex justify-between items-center bg-background/80 ${getCategoryStyles(child.category)}`}>
                                                                <span className="font-medium truncate mr-2" title={child.name}>{child.name}</span>
                                                                <span className="whitespace-nowrap opacity-80">{child.credits} CP</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 22, 41, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.2);
          border-radius: 8px;
          border: 2px solid rgba(15, 22, 41, 1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.5);
        }
      `}</style>
        </div>
    );
}
