"use client";

import { useCourses } from "@/context/CourseContext";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2, CircleDashed, Clock, GraduationCap, Star, FileText, MessageCircle, Calendar } from "lucide-react";

export default function RoadmapView() {
    const { courses, startSeason } = useCourses();

    const getSeasonForSemester = (sem: number) => {
        const isStartWiSe = startSeason === "WiSe";
        const isOdd = sem % 2 !== 0;
        if (isStartWiSe) return isOdd ? "WiSe" : "SoSe";
        return isOdd ? "SoSe" : "WiSe";
    };

    const getCategoryStyles = (category?: string) => {
        switch (category) {
            case "meteorology": return "bg-blue-500/5 text-blue-300 border-blue-500/20";
            case "physics": return "bg-purple-500/5 text-purple-300 border-purple-500/20";
            case "math": return "bg-emerald-500/5 text-emerald-300 border-emerald-500/20";
            case "elective": return "bg-orange-500/5 text-orange-300 border-orange-500/20";
            default: return "bg-surface/50 text-foreground-muted border-border/50";
        }
    };

    // Phase 9: Group courses strictly by semester for the new Kanban layout
    const coursesBySemester = courses.reduce((acc, course) => {
        const sem = course.semester;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(course);
        return acc;
    }, {} as Record<number, typeof courses>);

    // Get a sorted array of the semester numbers that actually have courses
    const activeSemesters = Object.keys(coursesBySemester)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                    Roadmap
                </h1>
                <p className="text-foreground-muted mt-2">
                    Visual layout of your entire B.Sc. plan, sorted by semester.
                </p>
            </div>

            {activeSemesters.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-foreground-muted">
                        No courses available to generate roadmap.
                    </CardContent>
                </Card>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                    <div className="flex gap-6 h-full items-start min-w-max pb-4 px-2">
                        {activeSemesters.map(semesterNum => {
                            const semesterCourses = coursesBySemester[semesterNum];
                            const totalCP = semesterCourses.reduce((acc, c) => acc + (c.credits || 0), 0);
                            const season = getSeasonForSemester(semesterNum);

                            return (
                                <div key={`sem-${semesterNum}`} className="flex flex-col w-[320px] max-h-full shrink-0">
                                    {/* Column Header */}
                                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md pb-4 mb-2 border-b border-border">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h2 className="text-lg font-bold text-foreground">Semester {semesterNum}</h2>
                                            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider bg-surface px-2 py-0.5 rounded-full">
                                                {season}
                                            </span>
                                        </div>
                                        <p className="text-sm text-primary font-medium">{totalCP} Total CP</p>
                                    </div>

                                    {/* Scrollable Column Content (The Cards) */}
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-2">
                                        {semesterCourses
                                            .filter(c => !c.parentModuleId) // Only render top-level courses as main cards
                                            .map(course => {
                                                const childCourses = semesterCourses.filter(c => c.parentModuleId === course.id);

                                                return (
                                                    <Card key={course.id} className={`border shadow-sm transition-all hover:bg-surface-hover ${getCategoryStyles(course.category)} relative overflow-hidden`}>
                                                        {/* Status Indicator Strip */}
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${course.status === "completed" ? "bg-success" :
                                                            course.status === "in-progress" ? "bg-primary" :
                                                                "bg-foreground-muted"
                                                            }`} />

                                                        <CardContent className="p-4 pl-5">
                                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <h3 className="font-semibold text-sm leading-snug">
                                                                            {course.name}
                                                                        </h3>
                                                                        {course.countsTowardsFinalGrade && (
                                                                            <span title="Counts towards B.Sc. Grade">
                                                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20 shrink-0" />
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Rich Metadata row 1: CP & Grade */}
                                                                    <div className="flex items-center gap-2 text-[10px] font-medium">
                                                                        <span className="px-1.5 py-0.5 rounded bg-black/30 shrink-0">
                                                                            {course.credits} CP
                                                                        </span>
                                                                        {course.status === "completed" && course.isGraded !== false && course.grade && course.grade <= 4.0 && (
                                                                            <span className="px-1.5 py-0.5 rounded bg-success/20 text-success shrink-0 border border-success/30 flex items-center gap-1">
                                                                                <GraduationCap className="w-3 h-3" />
                                                                                Grade: {course.grade.toFixed(1)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Rich Metadata row 2: Workload & Exams */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] opacity-80">
                                                                {((course.sws || 0) + (course.exerciseSws || 0)) > 0 && (
                                                                    <span className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border">
                                                                        <Clock className="w-3 h-3" />
                                                                        {(course.sws || 0) + (course.exerciseSws || 0)} SWS
                                                                    </span>
                                                                )}
                                                                {course.examType && course.examType !== "none" && (
                                                                    <span className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border" title={`${course.examType} Exam`}>
                                                                        {course.examType === 'written' ? <FileText className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                                                                        <span className="capitalize">{course.examType}</span>
                                                                    </span>
                                                                )}
                                                                {course.offeredIn && course.offeredIn !== "both" && (
                                                                    <span className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {course.offeredIn}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between mt-3 text-[10px] pt-3 border-t border-border/50">
                                                                <span className="opacity-70 capitalize bg-background/50 px-2 py-1 rounded">
                                                                    {course.category}
                                                                </span>
                                                                <div className={`flex items-center gap-1.5 font-medium ${course.status === "completed" ? "text-success" :
                                                                    course.status === "in-progress" ? "text-primary" :
                                                                        "text-foreground-muted"
                                                                    }`}>
                                                                    {course.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                                                                        course.status === "in-progress" ? <Clock className="w-3.5 h-3.5" /> :
                                                                            <CircleDashed className="w-3.5 h-3.5" />}
                                                                    <span className="capitalize">{course.status}</span>
                                                                </div>
                                                            </div>

                                                            {childCourses.length > 0 && (
                                                                <div className="mt-3 pt-3 border-t border-black/10 space-y-1.5">
                                                                    {childCourses.map(child => (
                                                                        <div key={child.id} className={`px-2 py-1.5 rounded border text-[11px] flex justify-between items-center bg-background/80 ${getCategoryStyles(child.category)}`}>
                                                                            <span className="font-medium truncate mr-2" title={child.name}>{child.name}</span>
                                                                            <span className="whitespace-nowrap opacity-80">{child.credits} CP</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
