"use client";

import { useState, useEffect } from "react";
import { History, Save, Download, Trash2, X, AlertCircle } from "lucide-react";
import { useCourses } from "@/context/CourseContext";
import { Course } from "@/types/course";

interface Version {
  id: string;
  name: string;
  timestamp: number;
  courses: Course[];
}

export function VersionManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [newVersionName, setNewVersionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { courses, loadCourses } = useCourses();

  // Fetch all on mount or open
  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/versions");
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newVersionName.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVersionName,
          courses: courses,
        }),
      });
      if (res.ok) {
        setNewVersionName("");
        fetchVersions();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/versions?id=${id}`, { method: "DELETE" });
      fetchVersions();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = (version: Version) => {
    if (
      confirm(
        `Are you sure you want to load "${version.name}"? This will overwrite your active progress.`,
      )
    ) {
      loadCourses(version.courses);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 text-foreground-muted hover:bg-surface-hover hover:text-foreground hover:shadow-[inset_4px_0_0_0_rgba(255,165,0,0.8)]"
      >
        <History className="h-5 w-5" />
        Version History (Saves)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="text-primary w-5 h-5" /> Version Control
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border flex flex-col gap-3">
              <p className="text-[11px] text-foreground-muted flex items-start gap-2 leading-tight">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-secondary" />
                Snapshot your current progress. Unlike local-storage, these
                versions are written as hard files to the project folder, so
                they persist when sent to another PC.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Version Name (e.g. End of 3rd Semester)"
                  className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <button
                  onClick={handleSave}
                  disabled={!newVersionName.trim() || isLoading}
                  className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isLoading && versions.length === 0 && (
                <p className="text-center text-sm text-foreground-muted animate-pulse">
                  Loading versions...
                </p>
              )}
              {!isLoading && versions.length === 0 && (
                <p className="text-center text-sm text-foreground-muted">
                  No versions saved yet.
                </p>
              )}

              {versions.map((v) => (
                <div
                  key={v.id}
                  className="bg-surface-hover border border-border/50 rounded-lg p-3 flex justify-between items-center group transition-colors hover:border-border"
                >
                  <div className="overflow-hidden">
                    <h3
                      className="font-semibold text-sm truncate"
                      title={v.name}
                    >
                      {v.name}
                    </h3>
                    <p className="text-xs text-foreground-muted flex items-center gap-2 mt-1">
                      {new Date(v.timestamp).toLocaleString()} •{" "}
                      {v.courses.length} Courses
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleLoad(v)}
                      className="p-1.5 text-success hover:bg-success/20 rounded transition-colors"
                      title="Load Version (Restores this state)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-danger hover:bg-danger/20 rounded transition-colors"
                      title="Delete Version"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
