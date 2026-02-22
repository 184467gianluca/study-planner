import { Course } from "@/types/course";



let idCounter = 1;
const nextId = () => `meteorology-${idCounter++}`;

export const defaultMeteorologyCourses: Course[] = [
    // Semester 1 (32 CP)
    { id: nextId(), name: "Allgemeine Meteorologie (EMETA)", credits: 6, semester: 1, category: "meteorology", sws: 4, isGraded: true },
    { id: nextId(), name: "Mathematik für Studierende der Physik 1 (VMATH1)", credits: 8, semester: 1, category: "math", sws: 6, isGraded: true },
    { id: nextId(), name: "Mechanik, Thermodynamik (VEX1)", credits: 10, semester: 1, category: "physics", sws: 8, isGraded: true },
    { id: nextId(), name: "Theoretische Physik 1 (VTH1)", credits: 8, semester: 1, category: "physics", sws: 6, isGraded: true },

    // Semester 2 (28 CP)
    { id: nextId(), name: "Allgemeine Klimatologie (EMETA)", credits: 4, semester: 2, category: "meteorology", sws: 3, isGraded: true },
    { id: nextId(), name: "Mathematik für Studierende der Meteorologie 2 (VMATH2M)", credits: 8, semester: 2, category: "math", sws: 6, isGraded: true },
    { id: nextId(), name: "Elektrodynamik (VEX2)", credits: 8, semester: 2, category: "physics", sws: 6, isGraded: true },
    { id: nextId(), name: "Theoretische Physik 2 (VTH2)", credits: 8, semester: 2, category: "physics", sws: 6, isGraded: true },

    // Semester 3 (28 CP)
    { id: nextId(), name: "Einführung in IT und Programmierung (EMETB)", credits: 1, semester: 3, category: "meteorology", sws: 1, isGraded: false },
    { id: nextId(), name: "Atmosphärendynamik 1 (EMETB)", credits: 5, semester: 3, category: "meteorology", sws: 4, isGraded: true },
    { id: nextId(), name: "Mathematik für Studierende der Meteorologie 3 (VMATH3M)", credits: 8, semester: 3, category: "math", sws: 6, isGraded: true },
    { id: nextId(), name: "Optik (VEX3a)", credits: 4, semester: 3, category: "physics", sws: 3, isGraded: true },
    { id: nextId(), name: "Atome und Quanten (VEX3b)", credits: 4, semester: 3, category: "physics", sws: 3, isGraded: true },
    { id: nextId(), name: "Anfängerpraktikum 1 (PEX1)", credits: 6, semester: 3, category: "physics", sws: 4, isGraded: false },

    // Semester 4 (32 CP)
    { id: nextId(), name: "Einführung in IT und Programmierung (EMETB)", credits: 1, semester: 4, category: "meteorology", sws: 1, isGraded: false },
    { id: nextId(), name: "Atmosphärendynamik 2 (EMETB)", credits: 5, semester: 4, category: "meteorology", sws: 4, isGraded: true },
    { id: nextId(), name: "Physik und Chemie der Atmosphäre 1 (METPC)", credits: 6, semester: 4, category: "meteorology", sws: 4, isGraded: true },
    { id: nextId(), name: "Meteorologisches Instrumentenpraktikum 1 (METP)", credits: 4, semester: 4, category: "meteorology", sws: 3, isGraded: false },
    { id: nextId(), name: "Optionalmodul (MOPT)", credits: 4, semester: 4, category: "elective", sws: 2, isGraded: false },
    { id: nextId(), name: "Wahlpflichtmodule Physik (PWA)", credits: 12, semester: 4, category: "elective", sws: 8, isGraded: true },

    // Semester 5 (29 CP)
    { id: nextId(), name: "Atmosphärendynamik 3 (METTH)", credits: 6, semester: 5, category: "meteorology", sws: 4, isGraded: true },
    { id: nextId(), name: "Numerische Wettervorhersage (METV)", credits: 5, semester: 5, category: "meteorology", sws: 4, isGraded: true },
    { id: nextId(), name: "Meteorologisches Instrumentenpraktikum 2 (METP)", credits: 2, semester: 5, category: "meteorology", sws: 2, isGraded: false },
    { id: nextId(), name: "Meteorologisches Vertiefungsmodul (METWA)", credits: 8, semester: 5, category: "elective", sws: 6, isGraded: true },
    { id: nextId(), name: "Optionalmodul (MOPT)", credits: 2, semester: 5, category: "elective", sws: 2, isGraded: false },
    { id: nextId(), name: "Wahlpflichtmodule Physik (PWA)", credits: 6, semester: 5, category: "elective", sws: 4, isGraded: true },

    // Semester 6 (31 CP)
    { id: nextId(), name: "Meteorologisches Vertiefungsmodul (METWA)", credits: 8, semester: 6, category: "elective", sws: 6, isGraded: true },
    { id: nextId(), name: "Meteorologisches Seminar (METS)", credits: 4, semester: 6, category: "meteorology", sws: 2, isGraded: true },
    { id: nextId(), name: "Wahlpflichtmodule Physik (PWA)", credits: 4, semester: 6, category: "elective", sws: 2, isGraded: true },
    { id: nextId(), name: "Vorbereitung zur Bachelorarbeit (BAM)", credits: 3, semester: 6, category: "meteorology", sws: 0, isGraded: false },
    { id: nextId(), name: "Bachelorarbeit (BAM)", credits: 12, semester: 6, category: "meteorology", sws: 0, isGraded: true },
];
