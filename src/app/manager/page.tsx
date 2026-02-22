"use client";

import { useState } from "react";
import { useCourses, Season } from "@/context/CourseContext";
import { Course } from "@/types/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Trash2, Pencil, Download, Upload } from "lucide-react";

export default function CourseManager() {
    const {
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        currentSemester,
        setCurrentSemester,
        startSeason,
        setStartSeason,
        loadCourses
    } = useCourses();

    const [isEditing, setIsEditing] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        credits: "",
        semester: "",
        category: "meteorology",
        parentModuleId: "none",
        sws: "",
        grade: "",
        isGraded: true,
        hasExercise: false,
        exerciseSws: "",
        workloadMin: "",
        workloadMax: "",
        admissionStatus: "not-required" as "not-required" | "pending" | "granted",
        examType: "written" as "none" | "written" | "oral",
        offeredIn: "both" as "SoSe" | "WiSe" | "both",
        examAttemptsMax: "3",
        examAttemptsUsed: "0",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const courseData: Partial<Course> = {
            name: formData.name,
            credits: Number(formData.credits),
            semester: Number(formData.semester),
            category: formData.category,
            parentModuleId: formData.parentModuleId === "none" ? undefined : formData.parentModuleId,
            sws: formData.sws ? Number(formData.sws) : undefined,
            isGraded: formData.isGraded,
            grade: formData.isGraded && formData.grade ? Number(formData.grade) : undefined,
            hasExercise: formData.hasExercise,
            exerciseSws: formData.hasExercise && formData.exerciseSws ? Number(formData.exerciseSws) : undefined,
            workloadMin: formData.hasExercise && formData.workloadMin ? Number(formData.workloadMin) : undefined,
            workloadMax: formData.hasExercise && formData.workloadMax ? Number(formData.workloadMax) : undefined,
            admissionStatus: formData.admissionStatus,
            examType: formData.examType,
            offeredIn: formData.offeredIn,
            examAttemptsMax: formData.examType !== "none" && formData.examAttemptsMax ? Number(formData.examAttemptsMax) : undefined,
            examAttemptsUsed: formData.examType !== "none" && formData.examAttemptsUsed ? Number(formData.examAttemptsUsed) : undefined,
        };

        if (isEditing) {
            updateCourse(isEditing, courseData);
            setIsEditing(null);
        } else {
            const newCourse: Course = {
                id: crypto.randomUUID(),
                ...courseData,
            } as Course;
            addCourse(newCourse);
        }

        setFormData({
            name: "", credits: "", semester: "", category: "meteorology", parentModuleId: "none", sws: "", grade: "", isGraded: true,
            hasExercise: false, exerciseSws: "", workloadMin: "", workloadMax: "", admissionStatus: "not-required", examType: "written",
            offeredIn: "both", examAttemptsMax: "3", examAttemptsUsed: "0"
        });
    };

    const handleEditClick = (course: Course) => {
        setIsEditing(course.id);
        setFormData({
            name: course.name,
            credits: String(course.credits),
            semester: String(course.semester),
            category: course.category || "meteorology",
            parentModuleId: course.parentModuleId || "none",
            sws: course.sws !== undefined ? String(course.sws) : "",
            grade: course.grade !== undefined ? String(course.grade) : "",
            isGraded: course.isGraded !== undefined ? course.isGraded : true,
            hasExercise: course.hasExercise || false,
            exerciseSws: course.exerciseSws !== undefined ? String(course.exerciseSws) : "",
            workloadMin: course.workloadMin !== undefined ? String(course.workloadMin) : "",
            workloadMax: course.workloadMax !== undefined ? String(course.workloadMax) : "",
            admissionStatus: course.admissionStatus || "not-required",
            examType: course.examType || "written",
            offeredIn: course.offeredIn || "both",
            examAttemptsMax: course.examAttemptsMax !== undefined ? String(course.examAttemptsMax) : "3",
            examAttemptsUsed: course.examAttemptsUsed !== undefined ? String(course.examAttemptsUsed) : "0",
        });
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getSeasonForSemester = (sem: number) => {
        const isStartWiSe = startSeason === "WiSe";
        // If starting in WiSe, odd semesters are WiSe, even are SoSe
        // If starting in SoSe, odd semesters are SoSe, even are WiSe
        const isOdd = sem % 2 !== 0;
        if (isStartWiSe) return isOdd ? "WiSe" : "SoSe";
        return isOdd ? "SoSe" : "WiSe";
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(courses, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "study_planner_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedCourses = JSON.parse(event.target?.result as string);
                if (Array.isArray(importedCourses)) {
                    loadCourses(importedCourses);
                    alert("Courses imported successfully!");
                } else {
                    alert("Invalid file format. Expected an array of courses.");
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Error reading file. Please ensure it is a valid JSON backup.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                    Course Manager
                </h1>
                <p className="text-foreground-muted mt-2">
                    Add and manage your courses for the semester.
                </p>
            </div>

            <Card className="mb-6 mb-8 border-primary/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <CardHeader>
                    <CardTitle className="text-secondary drop-shadow-[0_0_5px_rgba(0,255,157,0.4)]">Global Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="currentSemester">I am currently in Semester</Label>
                            <Input
                                id="currentSemester"
                                type="number"
                                min="1"
                                max="20"
                                value={currentSemester}
                                onChange={(e) => setCurrentSemester(Number(e.target.value) || 1)}
                                className="mt-1"
                            />
                            <p className="text-xs text-foreground-muted mt-2">
                                Course statuses (Completed, In Progress, Planned) are calculated automatically based on this.
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="startSeason">My first semester started in</Label>
                            <select
                                id="startSeason"
                                value={startSeason}
                                onChange={(e) => setStartSeason(e.target.value as Season)}
                                className="mt-1 flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                            >
                                <option value="WiSe">Winter Semester (WiSe)</option>
                                <option value="SoSe">Summer Semester (SoSe)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-medium">Backup & Restore</h3>
                            <p className="text-xs text-foreground-muted">Export your current plan or load an existing one.</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="secondary" onClick={handleExport} className="flex-1 sm:flex-none">
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                            <div className="relative flex-1 sm:flex-none">
                                <Label htmlFor="import-file" className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium transition-colors border rounded-md cursor-pointer border-border hover:bg-surface-hover hover:text-foreground">
                                    <Upload className="w-4 h-4 mr-2" /> Import
                                </Label>
                                <Input
                                    id="import-file"
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? "Edit Course" : "Add New Course"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Course Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Advanced Calculus"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="credits">Credits (ECTS)</Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        min="0"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                        placeholder="e.g. 5"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sws">SWS (optional)</Label>
                                    <Input
                                        id="sws"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={formData.sws}
                                        onChange={(e) => setFormData({ ...formData, sws: e.target.value })}
                                        placeholder="e.g. 4"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="semester">Semester</Label>
                                    <Input
                                        id="semester"
                                        type="number"
                                        min="1"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        placeholder="e.g. 3"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category (Theme)</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="mt-1 flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                    >
                                        <option value="meteorology">Meteorology (Core)</option>
                                        <option value="physics">Physics</option>
                                        <option value="math">Mathematics</option>
                                        <option value="elective">Elective Module</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="offeredIn">Offered In</Label>
                                    <select
                                        id="offeredIn"
                                        value={formData.offeredIn}
                                        onChange={(e) => setFormData({ ...formData, offeredIn: e.target.value as any })}
                                        className="mt-1 flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                    >
                                        <option value="both">Both (WiSe & SoSe)</option>
                                        <option value="WiSe">Winter Semester (WiSe)</option>
                                        <option value="SoSe">Summer Semester (SoSe)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="parentModuleId">Parent Module</Label>
                                    <select
                                        id="parentModuleId"
                                        value={formData.parentModuleId}
                                        onChange={(e) => setFormData({ ...formData, parentModuleId: e.target.value })}
                                        className="mt-1 flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                    >
                                        <option value="none">-- None (Standalone Course) --</option>
                                        {courses
                                            .filter(c => c.id !== isEditing) // Don't let a course be its own parent
                                            .map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} (Sem {c.semester})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* EXERCISES & WORKLOAD SECTION */}
                            <div className="pt-4 border-t border-border mt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <Label htmlFor="hasExercise" className="font-medium text-primary">Includes Exercise/Tutorial?</Label>
                                    <div className="flex items-center">
                                        <input
                                            id="hasExercise"
                                            type="checkbox"
                                            checked={formData.hasExercise}
                                            onChange={(e) => setFormData({ ...formData, hasExercise: e.target.checked })}
                                            className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
                                        />
                                    </div>
                                </div>

                                {formData.hasExercise && (
                                    <div className="space-y-4 bg-surface-hover/30 p-3 rounded-md border border-border/50">
                                        <div>
                                            <Label htmlFor="exerciseSws">Exercise SWS (optional)</Label>
                                            <Input
                                                id="exerciseSws"
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={formData.exerciseSws}
                                                onChange={(e) => setFormData({ ...formData, exerciseSws: e.target.value })}
                                                placeholder="e.g. 2"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="workloadMin">Min Workload (hrs/wk)</Label>
                                                <Input
                                                    id="workloadMin"
                                                    type="number"
                                                    min="0"
                                                    value={formData.workloadMin}
                                                    onChange={(e) => setFormData({ ...formData, workloadMin: e.target.value })}
                                                    placeholder="e.g. 4"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="workloadMax">Max Workload (hrs/wk)</Label>
                                                <Input
                                                    id="workloadMax"
                                                    type="number"
                                                    min="0"
                                                    value={formData.workloadMax}
                                                    onChange={(e) => setFormData({ ...formData, workloadMax: e.target.value })}
                                                    placeholder="e.g. 8"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="admissionStatus">Exam Admission (Zulassung)</Label>
                                            <select
                                                id="admissionStatus"
                                                value={formData.admissionStatus}
                                                onChange={(e) => setFormData({ ...formData, admissionStatus: e.target.value as any })}
                                                className="mt-1 flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                            >
                                                <option value="not-required">Not Required</option>
                                                <option value="pending">Pending (Working on Sheets)</option>
                                                <option value="granted">Granted (Zulassung erhalten!)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* GRADING & EXAM SECTION */}
                            <div className="pt-4 border-t border-border mt-4">
                                <div className="mb-4">
                                    <Label htmlFor="examType">Exam Type</Label>
                                    <select
                                        id="examType"
                                        value={formData.examType}
                                        onChange={(e) => setFormData({ ...formData, examType: e.target.value as any })}
                                        className="mt-1 flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors mb-4"
                                    >
                                        <option value="none">None (Portfolioprüfung/Presentation)</option>
                                        <option value="written">Written Exam (Klausur)</option>
                                        <option value="oral">Oral Exam (Mündlich)</option>
                                    </select>
                                </div>

                                {formData.examType !== "none" && (
                                    <div className="grid grid-cols-2 gap-4 mb-4 bg-surface-hover/20 p-3 rounded-md border border-border/30">
                                        <div>
                                            <Label htmlFor="examAttemptsMax">Max Attempts</Label>
                                            <Input
                                                id="examAttemptsMax"
                                                type="number"
                                                min="1"
                                                value={formData.examAttemptsMax}
                                                onChange={(e) => setFormData({ ...formData, examAttemptsMax: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="examAttemptsUsed">Attempts Used</Label>
                                            <Input
                                                id="examAttemptsUsed"
                                                type="number"
                                                min="0"
                                                max={formData.examAttemptsMax}
                                                value={formData.examAttemptsUsed}
                                                onChange={(e) => setFormData({ ...formData, examAttemptsUsed: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <Label htmlFor="isGraded" className="font-medium">Is this course graded?</Label>
                                    <div className="flex items-center">
                                        <input
                                            id="isGraded"
                                            type="checkbox"
                                            checked={formData.isGraded}
                                            onChange={(e) => setFormData({ ...formData, isGraded: e.target.checked })}
                                            className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
                                        />
                                    </div>
                                </div>

                                {formData.isGraded && (
                                    <div>
                                        <Label htmlFor="grade">Grade (1.0 - 5.0)</Label>
                                        <Input
                                            id="grade"
                                            type="number"
                                            min="1.0"
                                            max="5.0"
                                            step="0.1"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                            placeholder="e.g. 1.3 (Leave empty if not yet completed)"
                                        />
                                        <p className="text-[10px] text-foreground-muted mt-1">Grades are used to calculate your average current grade.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button type="submit" className="flex-1">
                                    {isEditing ? "Save Changes" : "Add Course"}
                                </Button>
                                {isEditing && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setIsEditing(null);
                                            setFormData({
                                                name: "", credits: "", semester: "", category: "meteorology", parentModuleId: "none", sws: "", grade: "", isGraded: true,
                                                hasExercise: false, exerciseSws: "", workloadMin: "", workloadMax: "", admissionStatus: "not-required", examType: "written",
                                                offeredIn: "both", examAttemptsMax: "3", examAttemptsUsed: "0"
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {courses.length === 0 ? (
                            <p className="text-sm text-foreground-muted">No courses added yet.</p>
                        ) : (
                            courses.map((course) => (
                                <div key={course.id} className="flex flex-col bg-surface/50 border border-border rounded-lg p-4 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold">{course.name}</h4>
                                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${course.status === "completed" ? "bg-success/20 text-success" :
                                                course.status === "in-progress" ? "bg-primary/20 text-primary" :
                                                    "bg-surface-hover text-foreground-muted"
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleEditClick(course)}
                                                className="text-foreground-muted hover:text-primary hover:bg-primary/10 p-2 h-auto mr-1"
                                                aria-label="Edit course"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => deleteCourse(course.id)}
                                                className="text-foreground-muted hover:text-danger hover:bg-danger/10 p-2 h-auto"
                                                aria-label="Delete course"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-foreground-muted mt-2 items-center">
                                        <div className="flex gap-2 items-center">
                                            <span>{course.credits} Credits</span>
                                            {course.category && (
                                                <span className="capitalize px-1.5 py-0.5 rounded-sm bg-surface-hover opacity-80 text-[10px]">
                                                    {course.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span>
                                                Semester {course.semester}
                                                <span className="text-[10px] ml-1 opacity-70">
                                                    ({course.offeredIn === 'WiSe' ? 'WiSe' : course.offeredIn === 'SoSe' ? 'SoSe' : getSeasonForSemester(course.semester)})
                                                </span>
                                            </span>
                                            <div className="text-[10px] text-foreground-muted mt-0.5 space-x-2">
                                                {course.sws !== undefined && <span>{course.sws} SWS</span>}
                                                {!course.isGraded && <span>Pass/Fail</span>}
                                                {course.isGraded && course.grade && <span className="text-secondary font-medium">Grade: {course.grade.toFixed(1)}</span>}
                                                {course.hasExercise && course.admissionStatus === 'pending' && <span className="text-orange-400 font-medium">Zulassung Pending</span>}
                                                {course.hasExercise && course.admissionStatus === 'granted' && <span className="text-success font-medium">Zulassung Granted</span>}
                                            </div>
                                            <div className="text-[10px] mt-0.5 space-x-2">
                                                {course.examType === 'written' && <span className="text-foreground-muted">Written Exam</span>}
                                                {course.examType === 'oral' && <span className="text-foreground-muted">Oral Exam</span>}
                                                {course.workloadMin && course.workloadMax && <span className="text-foreground-muted">Workload: {course.workloadMin}-{course.workloadMax}h/wk</span>}

                                                {course.examType !== 'none' && course.examAttemptsMax && (
                                                    <span className={`font-medium ${(course.examAttemptsMax - (course.examAttemptsUsed || 0)) <= 1
                                                        ? "text-danger animate-pulse"
                                                        : "text-foreground-muted"
                                                        }`}>
                                                        Attempts: {course.examAttemptsUsed || 0}/{course.examAttemptsMax}
                                                    </span>
                                                )}
                                            </div>
                                            {course.parentModuleId && courses.find(c => c.id === course.parentModuleId) && (
                                                <span className="text-[10px] text-primary/70 mt-0.5">
                                                    ↳ {courses.find(c => c.id === course.parentModuleId)?.name.substring(0, 20)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
