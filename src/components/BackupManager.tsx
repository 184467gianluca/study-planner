"use client";

import { useCourses } from "@/context/CourseContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Download, Upload, HardDriveDownload } from "lucide-react";
import { useRef } from "react";

export function BackupManager() {
    const { courses, currentSemester, startSeason, loadCourses, setCurrentSemester, setStartSeason } = useCourses();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            version: "1.0",
            courses,
            currentSemester,
            startSeason
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.courses && Array.isArray(data.courses)) {
                    loadCourses(data.courses);
                    if (data.currentSemester) setCurrentSemester(data.currentSemester);
                    if (data.startSeason) setStartSeason(data.startSeason);
                    alert("Backup successfully restored! Your workspace is ready.");
                } else {
                    alert("Invalid backup file format. Missing courses array.");
                }
            } catch {
                alert("Error importing backup. The file may be corrupted.");
            }
        };
        reader.readAsText(file);
        // Reset input for sequential uploads
        e.target.value = '';
    };

    return (
        <Card className="bg-surface/30 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-primary font-semibold">
                    <HardDriveDownload className="w-5 h-5" />
                    Local Backup
                </CardTitle>
                <CardDescription>
                    Export your data before installing the Desktop App, or restore an entire planning state from a JSON file.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm group"
                >
                    <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Export Backup
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm group"
                >
                    <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Restore File
                </button>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="hidden"
                />
            </CardContent>
        </Card>
    );
}
