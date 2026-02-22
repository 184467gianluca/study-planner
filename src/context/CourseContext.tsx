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
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
    const [savedCourses, setSavedCourses] = useLocalStorage<Course[]>("study-planner-courses", defaultMeteorologyCourses);
    const [currentSemester, setCurrentSemester] = useLocalStorage<number>("study-planner-current-semester", 1);
    const [startSeason, setStartSeason] = useLocalStorage<Season>("study-planner-start-season", "WiSe");

    // Dynamically derive course status based on current semester
    const courses = savedCourses.map(course => {
        let status: import("@/types/course").CourseStatus = "planned";
        if (course.semester < currentSemester) status = "completed";
        else if (course.semester === currentSemester) status = "in-progress";

        return { ...course, status };
    });

    const addCourse = (course: Course) => {
        setSavedCourses((prev) => [...prev, course]);
    };

    const updateCourse = (id: string, updatedFields: Partial<Course>) => {
        setSavedCourses((prev) =>
            prev.map((course) =>
                course.id === id ? { ...course, ...updatedFields } : course
            )
        );
    };

    const deleteCourse = (id: string) => {
        setSavedCourses((prev) => prev.filter((course) => course.id !== id));
    };

    const loadCourses = (newCourses: Course[]) => {
        setSavedCourses(newCourses);
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
            loadCourses
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
