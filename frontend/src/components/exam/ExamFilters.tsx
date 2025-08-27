import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Search } from "lucide-react";
import { ApiService } from "@/lib/api";

interface ExamFiltersProps {
  onFiltersChange: (filters: ExamFilters) => void;
  isLoading?: boolean;
}

export interface ExamFilters {
  campus: string;
  subject: string;
  course: string;
  section: string;
}

// Remove mock data - we'll fetch real data from API

export function ExamFilters({ onFiltersChange, isLoading }: ExamFiltersProps) {
  const [filters, setFilters] = useState<ExamFilters>({
    campus: "V",
    subject: "",
    course: "",
    section: "",
  });

  // State for API data
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  
  // Loading states
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  // Load subjects when component mounts
  useEffect(() => {
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const subjectData = await ApiService.getSubjects(filters.campus);
        setSubjects(subjectData);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [filters.campus]);

  // Load courses when subject changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!filters.subject) {
        setAvailableCourses([]);
        return;
      }

      setLoadingCourses(true);
      try {
        const courseData = await ApiService.getCourses(filters.campus, filters.subject);
        setAvailableCourses(courseData);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setAvailableCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [filters.campus, filters.subject]);

  // Load sections when course changes
  useEffect(() => {
    const loadSections = async () => {
      if (!filters.subject || !filters.course) {
        setAvailableSections([]);
        return;
      }

      setLoadingSections(true);
      try {
        const sectionData = await ApiService.getSections(filters.campus, filters.subject, filters.course);
        setAvailableSections(sectionData);
      } catch (error) {
        console.error('Failed to load sections:', error);
        setAvailableSections([]);
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
  }, [filters.campus, filters.subject, filters.course]);

  const handleFilterChange = (key: keyof ExamFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters
    if (key === "subject") {
      newFilters.course = "";
      newFilters.section = "";
    } else if (key === "course") {
      newFilters.section = "";
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      campus: "V",
      subject: "",
      course: "",
      section: "",
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-primary" />
          <span>Filter Exams</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campus">Campus</Label>
            <Select
              value={filters.campus}
              onValueChange={(value) => handleFilterChange("campus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="V">Vancouver</SelectItem>
                <SelectItem value="O">Okanagan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={filters.subject}
              onValueChange={(value) => handleFilterChange("subject", value)}
              disabled={loadingSubjects}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={filters.course}
              onValueChange={(value) => handleFilterChange("course", value)}
              disabled={!filters.subject || loadingCourses}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select course"} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select
              value={filters.section}
              onValueChange={(value) => handleFilterChange("section", value)}
              disabled={!filters.course || loadingSections}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingSections ? "Loading sections..." : "Select section"} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableSections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}