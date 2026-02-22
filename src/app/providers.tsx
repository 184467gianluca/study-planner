"use client";

import { ReactNode } from "react";
import { CourseProvider } from "@/context/CourseContext";

export function Providers({ children }: { children: ReactNode }) {
    return <CourseProvider>{children}</CourseProvider>;
}
