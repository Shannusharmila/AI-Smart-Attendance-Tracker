// src/lib/seed-data.ts — Static reference data shared between client & seed script.

export const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  "CSE-A": ["Mathematics", "Computer Science", "English"],
  "CSE-B": ["Mathematics", "Physics", "English"],
  "IT-A": ["Mathematics", "Computer Science", "Physics"],
  "IT-B": ["Computer Science", "Physics", "English"],
};

export const ALL_CLASSES = ["CSE-A", "CSE-B", "IT-A", "IT-B"];

export const EXAM_NAMES = ["Unit Test 1", "Mid Term", "Unit Test 2", "Final"];

export const SUBJECTS_LIST = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "English",
  "Chemistry",
  "General",
];
