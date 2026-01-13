import { useState, useMemo } from "react";
import { Test, TestFilters } from "@/types/test";

export const useTestFilters = (tests: Test[]) => {
  const [filters, setFilters] = useState<TestFilters>({
    searchTerm: "",
    schoolYear: "",
    subject: "",
    quarter: "",
    schoolUnit: "",
    category: "",
  });

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        !filters.searchTerm ||
        test.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        test.fileName.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesSchoolYear = !filters.schoolYear || test.schoolYear === filters.schoolYear;
      const matchesSubject = !filters.subject || test.subject === filters.subject;
      const matchesQuarter = !filters.quarter || test.quarter === filters.quarter;
      const matchesSchoolUnit = !filters.schoolUnit || test.schoolUnit === filters.schoolUnit;
      const matchesCategory = !filters.category || test.category === filters.category;

      return (
        matchesSearch &&
        matchesSchoolYear &&
        matchesSubject &&
        matchesQuarter &&
        matchesSchoolUnit &&
        matchesCategory
      );
    });
  }, [tests, filters]);

  const uniqueSchoolYears = useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.schoolYear).filter(Boolean))).sort();
  }, [tests]);

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.subject).filter(Boolean))).sort();
  }, [tests]);

  const uniqueQuarters = useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.quarter).filter(Boolean))).sort();
  }, [tests]);

  const uniqueSchoolUnits = useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.schoolUnit).filter(Boolean))).sort();
  }, [tests]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.category).filter(Boolean))).sort();
  }, [tests]);

  const updateFilter = (key: keyof TestFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      schoolYear: "",
      subject: "",
      quarter: "",
      schoolUnit: "",
      category: "",
    });
  };

  return {
    filters,
    filteredTests,
    uniqueSchoolYears,
    uniqueSubjects,
    uniqueQuarters,
    uniqueSchoolUnits,
    uniqueCategories,
    updateFilter,
    clearFilters,
  };
};