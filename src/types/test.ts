export interface Test {
  id: number;
  title: string;
  description: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  schoolYear: string;
  subject: string;
  quarter: string;
  schoolUnit: string;
  category: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestFormData extends Omit<Test, "id" | "createdAt" | "updatedAt"> {}

export interface TestFilters {
  searchTerm: string;
  schoolYear: string;
  subject: string;
  quarter: string;
  schoolUnit: string;
  category: string;
}