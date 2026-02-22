import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Course } from "@/types/course";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, GripVertical } from "lucide-react";

interface Props {
    course: Course;
    isOverlay?: boolean;
}

export function SortableCourse({ course, isOverlay }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: course.id,
        data: course,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        zIndex: isOverlay ? 999 : "auto",
        position: isOverlay ? "relative" : "static",
        touchAction: "none" // Crucial for mobile DND testing
    } as React.CSSProperties;

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
        <div ref={setNodeRef} style={style} className="mb-3">
            <Card className={`border shadow-sm transition-colors focus-within:ring-2 focus-within:ring-primary ${getCategoryStyles(course.category)} relative overflow-hidden`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${course.status === "completed" ? "bg-success" :
                    course.status === "in-progress" ? "bg-primary" :
                        "bg-foreground-muted"
                    }`} />

                <CardContent className="p-3 pl-4 flex gap-2">
                    <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-foreground-muted hover:text-foreground shrink-0 mt-1" title="Drag to move">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-1">
                            <h3 className="font-semibold text-xs leading-snug truncate">
                                {course.name}
                            </h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-medium shrink-0">
                                {course.credits} CP
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[9px] opacity-80">
                            {course.countsTowardsFinalGrade && (
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500/20 shrink-0" />
                            )}
                            {((course.sws || 0) + (course.exerciseSws || 0)) > 0 && (
                                <span className="bg-surface px-1 rounded border border-border">
                                    {(course.sws || 0) + (course.exerciseSws || 0)} SWS
                                </span>
                            )}
                            {course.examType && course.examType !== "none" && (
                                <span className="bg-surface px-1 rounded border border-border capitalize">
                                    {course.examType}
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
