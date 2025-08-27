import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ExamFilters, type ExamFilters as ExamFiltersType } from "@/components/exam/ExamFilters";
import { ExamResults } from "@/components/exam/ExamResults";
import { useToast } from "@/hooks/use-toast";
import { ApiService, PageResponse, Exam } from "@/lib/api";

export default function SearchPage() {
  const [filters, setFilters] = useState<ExamFiltersType>({
    campus: "V",
    subject: "",
    course: "",
    section: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [examPage, setExamPage] = useState<PageResponse<Exam> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  // Search exams based on current filters and page
  const searchExams = async (page: number = 0) => {
    if (!filters.subject) {
      setExamPage(null);
      return;
    }

    setIsLoading(true);
    try {
      const searchParams = {
        campus: filters.campus,
        subject: filters.subject,
        course: filters.course || undefined,
        section: filters.section || undefined,
        page,
        size: 20,
        sort: 'startTime,asc'
      };

      const results = await ApiService.searchExams(searchParams);
      setExamPage(results);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to search exams:', error);
      toast({
        title: "Search Failed",
        description: "Failed to load exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load exams when filters change
  useEffect(() => {
    setCurrentPage(0);
    searchExams(0);
  }, [filters]);

  const handleFiltersChange = (newFilters: ExamFiltersType) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    searchExams(page);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Search Exams</h1>
            <p className="text-muted-foreground">
              Find and download your UBC exam schedule as a calendar file.
            </p>
          </div>

          <ExamFilters
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />

          <ExamResults
            examPage={examPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}