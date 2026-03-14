"use client";

import { useCourses } from "@/context/CourseContext";
import { BackupManager } from "@/components/BackupManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  Info,
  PieChart, // Added icon for Dashboard Card
} from "lucide-react";
import { Course } from "@/types/course";

export default function Dashboard() {
  const { courses, currentSemester } = useCourses();

  // HoverCard Helper for dynamic tooltips
  const HoverCard = ({
    title,
    coursesList,
    align = "left",
    renderValue,
  }: {
    title: string;
    coursesList: Course[];
    align?: "left" | "right" | "center";
    renderValue?: (c: Course) => React.ReactNode;
  }) => {
    const alignClass =
      align === "right"
        ? "right-0"
        : align === "center"
          ? "left-1/2 -translate-x-1/2"
          : "left-0";
    return (
      <div
        className={`absolute top-full ${alignClass} pt-2 w-72 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all group-hover:pointer-events-auto`}
      >
        <div className="bg-surface-hover/95 backdrop-blur-md border border-border shadow-2xl rounded-lg p-3">
          <p className="text-xs font-semibold text-foreground mb-2 pb-2 border-b border-border/50">
            {title} ({coursesList.length})
          </p>
          {coursesList.length === 0 ? (
            <p className="text-[11px] text-foreground-muted italic">None</p>
          ) : (
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar text-[11px] text-foreground-muted pointer-events-auto">
              {coursesList.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-start gap-2 border-b border-border/30 last:border-0 pb-1 last:pb-0"
                >
                  <span
                    className="font-medium text-foreground truncate pr-2"
                    title={c.name}
                  >
                    {c.name}
                  </span>
                  <span className="shrink-0">
                    {renderValue ? renderValue(c) : `${c.credits} CP`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper: check if a course is passed
  const isPassed = (c: Course) =>
    !c.isGraded || (c.isGraded && c.grade && c.grade <= 4.0);

  // Progress calculations (Only count CP if passed)
  const totalCompletedCP = courses
    .filter((c) => c.status === "completed" && isPassed(c) && !c.isContainer)
    .reduce((acc, course) => acc + (course.credits || 0), 0);
  const totalInProgressCP = courses
    .filter((c) => c.status === "in-progress" && !c.isContainer)
    .reduce((acc, course) => acc + (course.credits || 0), 0);
  const totalPlannedCP = courses
    .filter((c) => c.status === "planned" && !c.isContainer)
    .reduce((acc, course) => acc + (course.credits || 0), 0);

  const bscGoalCP = 180;
  const progressPercent = Math.min((totalCompletedCP / bscGoalCP) * 100, 100);

  // Phase 5 & 7 & 18: Grade calculation (Aktuelle Note) - Weighted average: Sum(Grade * CP) / Sum(CP)
  // Strict Rules: Only courses with `countsTowardsFinalGrade`.
  // Composite Exam Rule: Courses with the same `compositeExamId` act as a single mathematical block.
  const gradedCourses = courses.filter(
    (c) =>
      c.status === "completed" &&
      c.isGraded !== false &&
      c.grade &&
      c.countsTowardsFinalGrade &&
      !c.isContainer,
  );
  let averageGrade = 0;
  let totalGradedCP = 0;
  let weightedSum = 0;

  // Array to hold the math steps for the tooltip
  const gradeBreakdown: {
    name: string;
    cp: number;
    grade: number;
    weight: number;
  }[] = [];

  if (gradedCourses.length > 0) {
    // Group courses by their composite ID, or treat standalone courses uniquely
    const processedComposites = new Set<string>();

    gradedCourses.forEach((course) => {
      if (course.compositeExamId) {
        // Only process composite blocks once
        if (!processedComposites.has(course.compositeExamId)) {
          processedComposites.add(course.compositeExamId);

          // Find all completed, graded parts of this composite exam
          const compositeParts = gradedCourses.filter(
            (c) => c.compositeExamId === course.compositeExamId,
          );
          // Sum their CPs together
          const compositeCP = compositeParts.reduce(
            (acc, c) => acc + (c.credits || 0),
            0,
          );

          // Add the grouped CP and weight it ONCE by the shared grade
          totalGradedCP += compositeCP;
          weightedSum += (course.grade || 0) * compositeCP;

          gradeBreakdown.push({
            name: `Composite: ${compositeParts.map((c) => c.name).join(" + ")}`,
            cp: compositeCP,
            grade: course.grade || 0,
            weight: (course.grade || 0) * compositeCP,
          });
        }
      } else {
        // Standard standalone course
        totalGradedCP += course.credits || 0;
        weightedSum += (course.grade || 0) * (course.credits || 0);

        gradeBreakdown.push({
          name: course.name,
          cp: course.credits || 0,
          grade: course.grade || 0,
          weight: (course.grade || 0) * (course.credits || 0),
        });
      }
    });

    // Official Exam Rules: Keep only 1 decimal, NO ROUNDING
    if (totalGradedCP > 0) {
      averageGrade = Math.trunc((weightedSum / totalGradedCP) * 10) / 10;
    }
  }

  // SWS calculation for current semester
  const currentInProgress = courses.filter(
    (c) =>
      c.semester === currentSemester &&
      c.status === "in-progress" &&
      !c.isContainer,
  );
  const currentSWS = currentInProgress.reduce(
    (acc, c) => acc + (c.sws || 0) + (c.exerciseSws || 0),
    0,
  );

  // Phase 3 & 18 Metrics: Deduplicate Exams
  const processedExamComposites = new Set<string>();
  let writtenExams = 0;
  let oralExams = 0;

  currentInProgress
    .filter((c) => c.examType !== "none")
    .forEach((course) => {
      if (course.compositeExamId) {
        if (!processedExamComposites.has(course.compositeExamId)) {
          processedExamComposites.add(course.compositeExamId);
          if (course.examType === "written") writtenExams++;
          if (course.examType === "oral") oralExams++;
        }
      } else {
        if (course.examType === "written") writtenExams++;
        if (course.examType === "oral") oralExams++;
      }
    });
  const pendingAdmissions = currentInProgress.filter(
    (c) => c.hasExercise && c.admissionStatus === "pending",
  ).length;
  const totalWorkloadMin = currentInProgress.reduce(
    (acc, c) => acc + (c.workloadMin || 0),
    0,
  );
  const totalWorkloadMax = currentInProgress.reduce(
    (acc, c) => acc + (c.workloadMax || 0),
    0,
  );

  // Phase 22: Category Distribution
  // Define stable colors for known categories, and a fallback palette for custom ones
  const CATEGORY_COLORS: Record<string, string> = {
    meteorologie: "rgb(0, 229, 255)", // primary
    physik: "rgb(168, 85, 247)", // purple
    mathe: "rgb(249, 115, 22)", // orange
    it: "rgb(34, 197, 94)", // success
    other: "rgb(100, 116, 139)", // slate (fallback)
  };

  const categoryCPMap = new Map<string, number>();
  let totalCurriculumCP = 0;

  courses
    .filter((c) => !c.isContainer)
    .forEach((c) => {
      // Normalize string so 'IT' and 'it' group together, default to 'other'
      const cat = c.category ? c.category.trim().toLowerCase() : "other";
      const current = categoryCPMap.get(cat) || 0;
      categoryCPMap.set(cat, current + (c.credits || 0));
      totalCurriculumCP += c.credits || 0;
    });

  // Convert to array and calculate percentages + conic gradient segments
  let currentConicAngle = 0;
  const categoryStats = Array.from(categoryCPMap.entries())
    .map(([cat, cp]) => {
      const percentage =
        totalCurriculumCP > 0 ? (cp / totalCurriculumCP) * 100 : 0;
      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS["other"];
      // For CSS conic-gradient, we need the start and end angle
      const startAngle = currentConicAngle;
      const endAngle = currentConicAngle + percentage;
      currentConicAngle = endAngle;

      return {
        name: cat,
        cp,
        percentage,
        color,
        gradientString: `${color} ${startAngle}%, ${color} ${endAngle}%`,
      };
    })
    .sort((a, b) => b.cp - a.cp); // Sort largest to smallest

  const conicGradient = categoryStats.map((s) => s.gradientString).join(", ");

  // Phase 4 Metrics: Exam Attempts
  const criticalExams = courses.filter(
    (c) =>
      c.examType !== "none" &&
      c.examAttemptsMax &&
      c.examAttemptsMax - (c.examAttemptsUsed || 0) <= 1 &&
      c.status !== "completed",
  ).length;

  const activeCourses = currentInProgress.length;
  const completedCourses = courses.filter(
    (c) => c.status === "completed" && !c.isContainer,
  ).length;

  // Module Collections (Container Modules)
  const containerModules = courses.filter((c) => c.isContainer);
  const containerProgress = containerModules.map((container) => {
    const children = courses.filter((c) => c.parentModuleId === container.id);
    const completedCP = children
      .filter((c) => c.status === "completed" && isPassed(c))
      .reduce((acc, c) => acc + (c.credits || 0), 0);
    return {
      ...container,
      completedCP,
    };
  });

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
      <Card className="bg-surface/60 border-primary/20 relative z-10 hover:z-50 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex justify-between items-center">
            <span className="flex items-center gap-2">
              B.Sc. Progress{" "}
              <Info className="h-4 w-4 text-foreground-muted opacity-50" />
            </span>
            <span className="text-primary">{progressPercent.toFixed(1)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="w-full h-4 bg-surface-hover rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-primary/80 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="h-full bg-secondary/50 transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min((totalInProgressCP / bscGoalCP) * 100, 100 - progressPercent)}%`,
                }}
              />
            </div>
            <div className="absolute inset-0 flex">
              <div
                className="h-full relative group cursor-help"
                style={{ width: `${progressPercent}%` }}
              >
                <HoverCard
                  title="Completed Modules"
                  coursesList={courses.filter(
                    (c) =>
                      c.status === "completed" && isPassed(c) && !c.isContainer,
                  )}
                />
              </div>
              <div
                className="h-full relative group cursor-help"
                style={{
                  width: `${Math.min((totalInProgressCP / bscGoalCP) * 100, 100 - progressPercent)}%`,
                }}
              >
                <HoverCard
                  title="Actively In Progress"
                  coursesList={courses.filter(
                    (c) => c.status === "in-progress" && !c.isContainer,
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-foreground-muted mt-2">
            <span>{totalCompletedCP} CP Completed</span>
            <span>Goal: {bscGoalCP} CP</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-foreground-muted">
            <div className="flex items-center gap-1.5 relative group cursor-help">
              <span className="w-3 h-3 rounded-full bg-primary/80"></span>
              <span>Passed & Completed</span>
              <HoverCard
                title="Completed Modules"
                coursesList={courses.filter(
                  (c) =>
                    c.status === "completed" && isPassed(c) && !c.isContainer,
                )}
              />
            </div>
            <div className="flex items-center gap-1.5 relative group cursor-help">
              <span className="w-3 h-3 rounded-full bg-secondary/50"></span>
              <span>Actively In Progress</span>
              <HoverCard
                title="Actively In Progress"
                coursesList={courses.filter(
                  (c) => c.status === "in-progress" && !c.isContainer,
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {containerModules.length > 0 && (
        <Card className="bg-surface/60 border-primary/20 relative z-10 hover:z-50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">
              Module Collections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {containerProgress.map((container) => {
              const children = courses.filter(
                (c) => c.parentModuleId === container.id,
              );
              return (
                <div key={container.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      {container.name}{" "}
                      <Info className="h-3.5 w-3.5 text-foreground-muted opacity-50" />
                    </span>
                    <span className="text-foreground-muted">
                      {container.completedCP} / {container.credits} CP
                    </span>
                  </div>
                  <div className="relative group cursor-help">
                    <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/80 transition-all"
                        style={{
                          width: `${Math.min((container.completedCP / (container.credits || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    <HoverCard
                      title={`Included in ${container.name}`}
                      coursesList={children}
                      renderValue={(c) =>
                        c.status === "completed" ? (
                          <span className="text-success">
                            {c.credits} CP (Done)
                          </span>
                        ) : (
                          <span className="opacity-50">{c.credits} CP</span>
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-surface/60 border-primary/20 hover:border-primary/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group">
              Current Grade
              <Info className="h-4 w-4 text-secondary/50 hover:text-secondary transition-colors cursor-help" />
              <div className="absolute top-full left-0 pt-2 w-80 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all group-hover:pointer-events-auto">
                <div className="bg-surface-hover/95 backdrop-blur-md border border-border shadow-2xl rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-2 pb-2 border-b border-border/50">
                    Grade Breakdown (Sum of (Grade * CP) / Total CP)
                  </p>

                  {gradeBreakdown.length === 0 ? (
                    <p className="text-[11px] text-foreground-muted italic">
                      No graded modules yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-[11px] text-foreground-muted pointer-events-auto">
                        {gradeBreakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start gap-2 border-b border-border/30 last:border-0 pb-1.5 last:pb-0"
                          >
                            <span
                              className="font-medium text-foreground truncate pr-2 w-2/3"
                              title={item.name}
                            >
                              {item.name}
                            </span>
                            <span className="shrink-0 font-mono text-secondary">
                              ({item.grade.toFixed(1)} * {item.cp}) ={" "}
                              <span className="text-foreground">
                                {item.weight.toFixed(1)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border/50 text-xs font-mono text-foreground bg-surface/50 p-2 rounded flex flex-col gap-1 items-center">
                        <div>Sum = {weightedSum.toFixed(1)}</div>
                        <div className="w-full border-b border-dashed border-foreground-muted/50"></div>
                        <div>Total CP = {totalGradedCP}</div>
                        <div className="mt-1 font-sans font-bold text-primary">
                          = {averageGrade ? averageGrade.toFixed(1) : "—"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${averageGrade && averageGrade <= 1.5 ? "text-success" : averageGrade && averageGrade <= 2.5 ? "text-primary" : "text-foreground"}`}
            >
              {averageGrade ? averageGrade.toFixed(1) : "—"}
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Calculated based on {gradedCourses.length} strictly exam-relevant
              modules (no rounding).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-secondary/20 hover:border-secondary/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group cursor-help w-full justify-between">
              <span className="flex items-center gap-1.5">
                Total Credits <Info className="h-4 w-4 opacity-50" />
              </span>
              <GraduationCap className="h-4 w-4 text-secondary" />

              <HoverCard
                title="All Tracked Courses"
                coursesList={courses.filter((c) => !c.isContainer)}
                align="right"
                renderValue={(c) =>
                  c.status === "completed" ? (
                    <span className="text-success">{c.credits} CP</span>
                  ) : c.status === "in-progress" ? (
                    <span className="text-secondary">{c.credits} CP</span>
                  ) : (
                    <span className="opacity-50">{c.credits} CP</span>
                  )
                }
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalCompletedCP + totalInProgressCP + totalPlannedCP}
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Planned across all {courses.length} courses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-success/20 hover:border-success/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group cursor-help w-full justify-between">
              <span className="flex items-center gap-1.5">
                Active Courses <Info className="h-4 w-4 opacity-50" />
              </span>
              <BookOpen className="h-4 w-4 text-success" />

              <HoverCard
                title={`In Progress (Semester ${currentSemester})`}
                coursesList={currentInProgress}
                align="right"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCourses}</div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              In-progress courses this semester.
              <br />
              {completedCourses} completed total.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-orange-500/20 hover:border-orange-500/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group cursor-help w-full justify-between">
              <span className="flex items-center gap-1.5">
                Weekly Workload <Info className="h-4 w-4 opacity-50" />
              </span>
              <Clock className="h-4 w-4 text-orange-400" />

              <HoverCard
                title="Current Semester Workload"
                coursesList={currentInProgress.filter(
                  (c) => (c.sws || 0) + (c.exerciseSws || 0) > 0,
                )}
                align="left"
                renderValue={(c) =>
                  `${(c.sws || 0) + (c.exerciseSws || 0)} SWS`
                }
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-baseline gap-2">
              {currentSWS}{" "}
              <span className="text-sm font-normal text-foreground-muted">
                SWS
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Est. Self-Study: {totalWorkloadMin} - {totalWorkloadMax} hrs/week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-purple-500/20 hover:border-purple-500/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group cursor-help w-full justify-between">
              <span className="flex items-center gap-1.5">
                Upcoming Exams <Info className="h-4 w-4 opacity-50" />
              </span>
              <FileText className="h-4 w-4 text-purple-400" />

              <HoverCard
                title={`Exams in Semester ${currentSemester}`}
                coursesList={currentInProgress.filter(
                  (c) => c.examType !== "none",
                )}
                align="center"
                renderValue={(c) => (
                  <span className="capitalize">{c.examType}</span>
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{writtenExams + oralExams}</div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              {writtenExams} Written (Klausur)
              <br />
              {oralExams} Oral (Mündlich)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-danger/20 hover:border-danger/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group cursor-help w-full justify-between">
              <span className="flex items-center gap-1.5">
                Admissions <Info className="h-4 w-4 opacity-50" />
              </span>
              <AlertCircle
                className={`h-4 w-4 ${pendingAdmissions > 0 ? "text-danger" : "text-foreground-muted"}`}
              />

              <HoverCard
                title="Pending Admission Status"
                coursesList={currentInProgress.filter(
                  (c) => c.hasExercise && c.admissionStatus === "pending",
                )}
                align="right"
                renderValue={() => (
                  <span className="text-danger flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Pending
                  </span>
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${pendingAdmissions > 0 ? "text-danger" : "text-foreground"}`}
            >
              {pendingAdmissions}{" "}
              <span className="text-sm font-normal text-foreground-muted">
                Pending
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Mandatory exercises that require successful submission.
            </p>
          </CardContent>
        </Card>

        {/* Phase 4: Critical Exams Card */}
        <Card className="bg-surface/60 border-red-500/20 hover:border-red-500/50 transition-colors relative z-10 hover:z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2 relative group cursor-help w-full justify-between">
              <span className="flex items-center gap-1.5">
                Critical Attempts <Info className="h-4 w-4 opacity-50" />
              </span>
              <AlertCircle
                className={`h-4 w-4 ${criticalExams > 0 ? "text-danger" : "text-foreground-muted"}`}
              />

              <HoverCard
                title="Modules with ≤ 1 Attempt Left"
                coursesList={courses.filter(
                  (c) =>
                    c.examType !== "none" &&
                    c.examAttemptsMax &&
                    c.examAttemptsMax - (c.examAttemptsUsed || 0) <= 1 &&
                    c.status !== "completed",
                )}
                align="left"
                renderValue={(c) => (
                  <span className="font-bold text-danger">
                    {c.examAttemptsMax! - (c.examAttemptsUsed || 0)} left
                  </span>
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${criticalExams > 0 ? "text-red-500" : "text-foreground"}`}
            >
              {criticalExams}{" "}
              <span className="text-sm font-normal text-foreground-muted">
                Exams
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 leading-tight">
              Exams with ≤ 1 attempt remaining across all planned & active
              courses.
            </p>
          </CardContent>
        </Card>

        {/* Phase 22: Category Distribution Pie Chart */}
        <Card className="bg-surface/60 border-primary/20 hover:border-primary/50 transition-colors relative z-10 hover:z-50 md:col-span-2 lg:col-span-3 mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-8 py-4">
            {/* Pie Chart Graphic */}
            <div
              className="w-40 h-40 rounded-full shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-border/50 relative overflow-hidden"
              style={{
                background: `conic-gradient(${conicGradient})`,
              }}
            >
              {/* Inner cutout to make it a donut chart (optional, looks better) */}
              <div className="absolute inset-[15%] rounded-full bg-surface/95 backdrop-blur-md shadow-inner flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-foreground">
                  {totalCurriculumCP}
                </span>
                <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
                  Total CP
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
              {categoryStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: stat.color }}
                  />
                  <div className="overflow-hidden">
                    <p
                      className="text-xs font-semibold text-foreground truncate capitalize"
                      title={stat.name}
                    >
                      {stat.name}
                    </p>
                    <p className="text-[10px] text-foreground-muted">
                      {stat.cp} CP ({stat.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start mt-6">
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
                  <div
                    key={course.id}
                    className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0"
                  >
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
                        {course.sws !== undefined && (
                          <span>{course.sws} SWS</span>
                        )}
                        {course.category && (
                          <span className="capitalize opacity-60">
                            • {course.category}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold">
                        {course.credits} CP
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          course.status === "completed"
                            ? "bg-success/20 text-success"
                            : course.status === "in-progress"
                              ? "bg-primary/20 text-primary"
                              : "bg-surface-hover text-foreground-muted"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <BackupManager />
      </div>
    </div>
  );
}
