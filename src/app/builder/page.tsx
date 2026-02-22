"use client";

import { useCourses } from "@/context/CourseContext";
import { useState, useMemo, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    rectIntersection
} from "@dnd-kit/core";
import { Course } from "@/types/course";
import { SemesterColumn } from "./SemesterColumn";
import { SortableCourse } from "./SortableCourse";

export default function StudyBuilderView() {
    const { courses, updateCourse } = useCourses();
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sensors setup for DND Kit
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires 5px of movement before drag starts (prevents accidental clicks vs drags)
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Memoize top level courses to prevent unnecessary re-renders
    const topLevelCourses = useMemo(() => courses.filter(c => !c.parentModuleId), [courses]);

    // Dynamically calculate how many semester columns we need (at least 6)
    const maxSem = useMemo(() => Math.max(6, ...courses.map(c => c.semester)), [courses]);
    const semesters = Array.from({ length: maxSem }, (_, i) => i + 1);

    const getCoursesForContainer = (containerId: string) => {
        if (containerId === "pool") {
            return topLevelCourses.filter(c => c.semester === 0);
        }
        const semNum = parseInt(containerId.replace("sem-", ""));
        return topLevelCourses.filter(c => c.semester === semNum);
    };

    // --- DND Event Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const course = courses.find(c => c.id === active.id);
        if (course) setActiveCourse(course);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCourse(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeCourse = courses.find(c => c.id === activeId);
        if (!activeCourse) return;

        // Since we are using basic draggable/droppable, over.id is the target container string
        const targetContainer = over.id as string;

        if (targetContainer && (targetContainer === "pool" || targetContainer.startsWith("sem-"))) {
            const newSemester = targetContainer === "pool" ? 0 : parseInt(targetContainer.replace("sem-", ""));

            // Apply the update to context if the course actually changed column
            if (activeCourse.semester !== newSemester) {
                updateCourse(activeId, { semester: newSemester });

                // Cascade update to child modules (e.g., practicals tied to lectures)
                const children = courses.filter(c => c.parentModuleId === activeId);
                children.forEach(child => {
                    updateCourse(child.id, { semester: newSemester });
                });
            }
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.4' } },
        }),
    };

    return (
        <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                    Study Builder
                </h1>
                <p className="text-foreground-muted mt-2">
                    Interactive sandbox. Drag courses from the Pool across semesters to visually assemble your degree path. Data is instantly synced.
                </p>
            </div>

            {isMounted ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={rectIntersection}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                        {/* The Unplanned "Pool" Column */}
                        <SemesterColumn
                            id="pool"
                            title="Course Pool"
                            description="Unscheduled (Semester 0)"
                            courses={getCoursesForContainer("pool")}
                        />

                        {/* The Kanban Semester Board */}
                        <div className="flex-1 bg-surface/10 rounded-xl overflow-x-auto custom-scrollbar border border-border/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                            <div className="flex gap-4 h-full p-4 min-w-max">
                                {semesters.map(sem => (
                                    <SemesterColumn
                                        key={`sem-${sem}`}
                                        id={`sem-${sem}`}
                                        title={`Semester ${sem}`}
                                        courses={getCoursesForContainer(`sem-${sem}`)}
                                        width="w-[260px]"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeCourse ? <SortableCourse course={activeCourse} isOverlay /> : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <div className="flex-1 flex items-center justify-center text-foreground-muted">
                    Loading planner...
                </div>
            )}
        </div>
    );
}
