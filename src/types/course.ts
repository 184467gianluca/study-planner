export type CourseStatus = "planned" | "in-progress" | "completed";

export interface Course {
    id: string;
    name: string;
    credits: number;
    semester: number;
    status?: CourseStatus; // Dynamically computed based on current semester
    parentModuleId?: string; // ID of the parent module if this is an elective choice
    category?: string; // e.g., 'meteorology', 'physics', 'math', 'elective'
    sws?: number; // Semesterwochenstunden
    grade?: number; // 1.0 - 5.0
    isGraded?: boolean; // Default true, distinguishes pass/fail only

    // Phase 3: Workload, Exercises and Exams
    hasExercise?: boolean;
    exerciseSws?: number;
    workloadMin?: number; // Estimated hours per week (min)
    workloadMax?: number; // Estimated hours per week (max)
    admissionStatus?: "not-required" | "pending" | "granted";
    examType?: "none" | "written" | "oral";

    // Phase 4: Semester Offerings & Exam Attempts
    offeredIn?: "SoSe" | "WiSe" | "both";
    examAttemptsMax?: number; // Usually 3
    examAttemptsUsed?: number;

    // Phase 5: Official B.Sc. Grade Calculation
    countsTowardsFinalGrade?: boolean;

    // Phase 7: Multi-Part Modules & Composite Exams
    compositeExamId?: string; // Group courses that share a single unified exam ("Doppelklausur")
}
