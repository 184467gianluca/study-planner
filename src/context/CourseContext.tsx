"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Course } from "@/types/course";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultMeteorologyCourses } from "@/app/data/defaultCourses";

export type Season = "WiSe" | "SoSe";

interface CourseContextType {
    courses: Course[];
    currentSemester: number;
    startSeason: Season;
    setCurrentSemester: (semester: number) => void;
    setStartSeason: (season: Season) => void;
    addCourse: (course: Course) => void;
    updateCourse: (id: string, updatedFields: Partial<Course>) => void;
    deleteCourse: (id: string) => void;
    loadCourses: (courses: Course[]) => void;
    undo: () => void;
    resetToDefaults: () => void;
    canUndo: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
    const [savedCourses, setSavedCourses] = useLocalStorage<Course[]>("study-planner-courses", defaultMeteorologyCourses);
    const [currentSemester, setCurrentSemester] = useLocalStorage<number>("study-planner-current-semester", 1);
    const [startSeason, setStartSeason] = useLocalStorage<Season>("study-planner-start-season", "WiSe");

    // Phase 6: State History
    const [history, setHistory] = React.useState<Course[][]>([]);

    const saveHistory = () => {
        setHistory(prev => [...prev, savedCourses]);
    };

    // Dynamically derive course status based on current semester AND grade
    const courses = savedCourses.map(course => {
        let status: import("@/types/course").CourseStatus = "planned";

        // Helper to check if passed
        const isPassed = !course.isGraded || (course.isGraded && course.grade && course.grade <= 4.0);

        if (course.semester < currentSemester) {
            // It's in the past. But is it passed?
            if (isPassed) {
                status = "completed";
            } else {
                status = "in-progress"; // Still need to pass it
            }
        }
        else if (course.semester === currentSemester) {
            // Current semester. If already passed (e.g. early exam), mark completed.
            if (isPassed && course.grade) {
                status = "completed"
            } else {
                status = "in-progress";
            }
        }

        return { ...course, status };
    });

    const addCourse = (course: Course) => {
        saveHistory();
        setSavedCourses((prev) => [...prev, course]);
    };

    const updateCourse = (id: string, updatedFields: Partial<Course>) => {
        saveHistory();

        setSavedCourses((prev) => {
            // Find the course being modified
            const targetCourse = prev.find(c => c.id === id);
            if (!targetCourse) return prev;

            const isComposite = targetCourse.compositeExamId !== undefined;
            const updatedCourse = { ...targetCourse, ...updatedFields };

            return prev.map((course) => {
                // Update the exact target course
                if (course.id === id) {
                    return updatedCourse;
                }

                // Phase 7: Sync shared exam/grade data across composite counterparts
                if (isComposite && course.compositeExamId === targetCourse.compositeExamId) {
                    return {
                        ...course,
                        grade: updatedCourse.grade,
                        isGraded: updatedCourse.isGraded,
                        examAttemptsMax: updatedCourse.examAttemptsMax,
                        examAttemptsUsed: updatedCourse.examAttemptsUsed,
                        examType: updatedCourse.examType
                    };
                }

                return course;
            });
        });
    };

    const deleteCourse = (id: string) => {
        saveHistory();
        setSavedCourses((prev) => prev.filter((course) => course.id !== id));
    };

    const loadCourses = (newCourses: Course[]) => {
        saveHistory();
        setSavedCourses(newCourses);
    };

    const undo = () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        setSavedCourses(previousState);
        setHistory(prev => prev.slice(0, -1));
    };

    const resetToDefaults = () => {
        saveHistory();
        setSavedCourses(defaultMeteorologyCourses);
    };

    return (
        <CourseContext.Provider value={{
            courses,
            currentSemester,
            startSeason,
            setCurrentSemester,
            setStartSeason,
            addCourse,
            updateCourse,
            deleteCourse,
            loadCourses,
            undo,
            resetToDefaults,
            canUndo: history.length > 0
        }}>
            {children}
        </CourseContext.Provider>
    );
}

export function useCourses() {
    const context = useContext(CourseContext);
    if (context === undefined) {
        throw new Error("useCourses must be used within a CourseProvider");
    }
    return context;
}
