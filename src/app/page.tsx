"use client";

import { useCourses } from "@/context/CourseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, GraduationCap, TrendingUp, Clock, AlertCircle, FileText, Info } from "lucide-react";

export default function Dashboard() {
  const { courses, currentSemester } = useCourses();

  // Helper: check if a course is passed
  const isPassed = (c: any) => !c.isGraded || (c.isGraded && c.grade && c.grade <= 4.0);



  // Progress calculations (Only count CP if passed)
  const totalCompletedCP = courses
    .filter(c => c.status === "completed" && isPassed(c))
    .reduce((acc, course) => acc + (course.credits || 0), 0);
  const totalInProgressCP = courses
    .filter(c => c.status === "in-progress")
    .reduce((acc, course) => acc + (course.credits || 0), 0);
  const totalPlannedCP = courses
    .filter(c => c.status === "planned")
    .reduce((acc, course) => acc + (course.credits || 0), 0);

  const bscGoalCP = 180;
  const progressPercent = Math.min((totalCompletedCP / bscGoalCP) * 100, 100);

  // Phase 5 & 7: Grade calculation (Aktuelle Note) - Weighted average: Sum(Grade * CP) / Sum(CP)
  // Strict Rules: Only courses with `countsTowardsFinalGrade`.
  // Composite Exam Rule: Courses with the same `compositeExamId` act as a single mathematical block.
  const gradedCourses = courses.filter(c => c.status === "completed" && c.isGraded !== false && c.grade && c.countsTowardsFinalGrade);
  let averageGrade = 0;

  if (gradedCourses.length > 0) {
    let totalGradedCP = 0;
    let weightedSum = 0;

    // Group courses by their composite ID, or treat standalone courses uniquely
    const processedComposites = new Set<string>();

    gradedCourses.forEach(course => {
      if (course.compositeExamId) {
        // Only process composite blocks once
        if (!processedComposites.has(course.compositeExamId)) {
          processedComposites.add(course.compositeExamId);

          // Find all completed, graded parts of this composite exam
          const compositeParts = gradedCourses.filter(c => c.compositeExamId === course.compositeExamId);
          // Sum their CPs together
          const compositeCP = compositeParts.reduce((acc, c) => acc + (c.credits || 0), 0);

          // Add the grouped CP and weight it ONCE by the shared grade
          totalGradedCP += compositeCP;
          weightedSum += (course.grade || 0) * compositeCP;
        }
      } else {
        // Standard standalone course
        totalGradedCP += (course.credits || 0);
        weightedSum += (course.grade || 0) * (course.credits || 0);
      }
    });

    // Official Exam Rules: Keep only 1 decimal, NO ROUNDING
    if (totalGradedCP > 0) {
      averageGrade = Math.trunc((weightedSum / totalGradedCP) * 10) / 10;
    }
  }

  // SWS calculation for current semester
  const currentInProgress = courses.filter(c => c.semester === currentSemester && c.status === "in-progress");
  const currentSWS = currentInProgress.reduce((acc, c) => acc + (c.sws || 0) + (c.exerciseSws || 0), 0);

  // Phase 3 Metrics
  const writtenExams = currentInProgress.filter(c => c.examType === 'written').length;
  const oralExams = currentInProgress.filter(c => c.examType === 'oral').length;
  const pendingAdmissions = currentInProgress.filter(c => c.hasExercise && c.admissionStatus === 'pending').length;
  const totalWorkloadMin = currentInProgress.reduce((acc, c) => acc + (c.workloadMin || 0), 0);
  const totalWorkloadMax = currentInProgress.reduce((acc, c) => acc + (c.workloadMax || 0), 0);

  // Phase 4 Metrics: Exam Attempts
  const criticalExams = courses.filter(c =>
    c.examType !== "none" &&
    c.examAttemptsMax &&
    (c.examAttemptsMax - (c.examAttemptsUsed || 0)) <= 1 &&
    c.status !== "completed"
  ).length;

  const activeCourses = currentInProgress.length;
  const completedCourses = courses.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]">
          Dashboard
        </h1>
        <p className="text-foreground-muted mt-2">
          Overview of your academic progress.
        </p>
      </div>

      {/* Progress Bar Section */}
      <Card className="bg-surface/60 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex justify-between items-center">
            <span>B.Sc. Progress</span>
            <span className="text-primary">{progressPercent.toFixed(1)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-4 bg-surface-hover rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-primary/80 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
              title={`Completed: ${totalCompletedCP} CP`}
            />
            <div
              className="h-full bg-secondary/50 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((totalInProgressCP / bscGoalCP) * 100, 100 - progressPercent)}%` }}
              title={`In Progress: ${totalInProgressCP} CP`}
            />
          </div>
          <div className="flex justify-between text-xs text-foreground-muted mt-2">
            <span>{totalCompletedCP} CP Completed</span>
            <span>Goal: {bscGoalCP} CP</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-foreground-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary/80"></span>
              <span>Passed & Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-secondary/50"></span>
              <span>Actively In Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-surface/60 border-primary/20 hover:border-primary/50 transition-colors relative z-10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group">
              Current Grade
              <Info className="h-4 w-4 text-secondary/50 hover:text-secondary transition-colors cursor-help" />

              {/* Hover Tooltip Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-72 bg-surface-hover/95 backdrop-blur-md border border-border shadow-lg rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <p className="text-xs font-semibold text-foreground mb-2 pb-2 border-b border-border/50">Modules directly affecting the B.Sc. Grade:</p>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-[11px] text-foreground-muted">
                  <p className="font-medium text-foreground">Meteorology (1-fach B.Sc.):</p>
                  <ul className="list-disc pl-4 space-y-1 mb-2">
                    <li>Allgemeine Meteorologie (EMETA - 10 CP)</li>
                    <li>IT & Atmosphärendynamik 1+2 (EMETB - 12 CP)</li>
                    <li>Physik & Chemie der Atmosphäre 1 (6 CP)</li>
                    <li>Atmosphärendynamik 3 (6 CP)</li>
                    <li>Numerische Wettervorhersage (5 CP)</li>
                    <li>Bachelorarbeit (12 CP)</li>
                  </ul>
                  <p className="font-medium text-foreground">Physics & Math:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Mathematik für Physik 1 (8 CP)</li>
                    <li>Mechanik & Thermodynamik (10 CP)</li>
                    <li>Mathematik für Meteorologie 2 (8 CP)</li>
                    <li>Elektrodynamik (8 CP)</li>
                    <li>Theoretische Physik 2 (8 CP)</li>
                    <li>Mathematik für Meteorologie 3 (8 CP)</li>
                    <li>Optik (4 CP)</li>
                    <li>Atome und Quanten (4 CP)</li>
                  </ul>
                </div>
              </div>
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${averageGrade && averageGrade <= 1.5 ? 'text-success' : averageGrade && averageGrade <= 2.5 ? 'text-primary' : 'text-foreground'}`}>
              {averageGrade ? averageGrade.toFixed(1) : "—"}
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Calculated based on {gradedCourses.length} strictly exam-relevant modules (no rounding).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-secondary/20 hover:border-secondary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Total Credits
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCompletedCP + totalInProgressCP + totalPlannedCP}</div>
            <p className="text-xs text-foreground-muted mt-1">
              Planned across all {courses.length} courses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-success/20 hover:border-success/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCourses}</div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              In-progress courses this semester.<br />
              {completedCourses} completed total.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-orange-500/20 hover:border-orange-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Weekly Workload
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-baseline gap-2">
              {currentSWS} <span className="text-sm font-normal text-foreground-muted">SWS</span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Est. Self-Study: {totalWorkloadMin} - {totalWorkloadMax} hrs/week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-purple-500/20 hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Upcoming Exams
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{writtenExams + oralExams}</div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              {writtenExams} Written (Klausur)<br />
              {oralExams} Oral (Mündlich)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-danger/20 hover:border-danger/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Admissions (Zulassung)
            </CardTitle>
            <AlertCircle className={`h-4 w-4 ${pendingAdmissions > 0 ? 'text-danger' : 'text-foreground-muted'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${pendingAdmissions > 0 ? 'text-danger' : 'text-foreground'}`}>
              {pendingAdmissions} <span className="text-sm font-normal text-foreground-muted">Pending</span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Mandatory exercises that require successful submission.
            </p>
          </CardContent>
        </Card>

        {/* Phase 4: Critical Exams Card */}
        <Card className="bg-surface/60 border-red-500/20 hover:border-red-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Critical Attempts
            </CardTitle>
            <AlertCircle className={`h-4 w-4 ${criticalExams > 0 ? 'text-red-500 animate-pulse' : 'text-foreground-muted'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${criticalExams > 0 ? 'text-red-500' : 'text-foreground'}`}>
              {criticalExams} <span className="text-sm font-normal text-foreground-muted">Exams</span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Exams with ≤ 1 attempt remaining across all planned & active courses.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-6">
              No courses added yet. Go to the Course Manager to add some.
            </p>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {course.name}
                      {course.grade && course.status === "completed" && (
                        <span className="text-[10px] font-bold bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-sm">
                          {course.grade.toFixed(1)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-foreground-muted flex gap-3 mt-1">
                      <span>Sem {course.semester}</span>
                      {course.sws !== undefined && <span>{course.sws} SWS</span>}
                      {course.category && <span className="capitalize opacity-60">• {course.category}</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold">{course.credits} CP</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.status === "completed" ? "bg-success/20 text-success" :
                      course.status === "in-progress" ? "bg-primary/20 text-primary" :
                        "bg-surface-hover text-foreground-muted"
                      }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
