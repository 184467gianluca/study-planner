import { useDroppable } from "@dnd-kit/core";
import { Course } from "@/types/course";
import { SortableCourse } from "./SortableCourse";

interface Props {
    id: string; // e.g., "sem-1" or "pool"
    title: string;
    description?: string;
    courses: Course[];
    width?: string;
}

export function SemesterColumn({ id, title, description, courses, width = "w-[280px]" }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const cpTotal = courses.reduce((acc, c) => acc + (c.credits || 0), 0);

    return (
        <div className={`flex flex-col shrink-0 ${width} rounded-xl border transition-colors ${isOver ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30' : 'bg-surface/30 border-border/50'} h-full max-h-full overflow-hidden`}>
            {/* Header */}
            <div className="p-3 border-b border-border/50 bg-background/50 rounded-t-xl shrink-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h2 className="text-sm font-bold text-foreground">{title}</h2>
                    {id !== "pool" && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            {cpTotal} CP
                        </span>
                    )}
                </div>
                {description && <p className="text-[10px] text-foreground-muted">{description}</p>}
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto custom-scrollbar min-h-[150px]">
                {courses.map(course => (
                    <SortableCourse key={course.id} course={course} />
                ))}

                {courses.length === 0 && (
                    <div className="h-24 mt-2 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-foreground-muted opacity-50">
                        Drop courses here
                    </div>
                )}
            </div>
        </div>
    );
}
