import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  History, 
  Download, 
  Calendar, 
  Clock, 
  Trash2, 
  RotateCw,
  Search,
  MapPin,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSchedule } from "@/contexts/ScheduleContext";
import { ApiService, PageResponse, Exam } from "@/lib/api";
import { ExamFilters } from "@/components/exam/ExamFilters";

export default function HistoryPage() {
  const { 
    scheduleHistory, 
    deleteScheduleHistory, 
    loadScheduleFromHistory,
    addToSchedule,
    isInSchedule 
  } = useSchedule();
  const { toast } = useToast();

  // Past exam search state
  const [pastExamPage, setPastExamPage] = useState<PageResponse<Exam> | null>(null);
  const [isLoadingPastExams, setIsLoadingPastExams] = useState(false);
  const [pastExamFilters, setPastExamFilters] = useState({
    campus: "V",
    subject: "",
    course: "",
    section: "",
  });
  
  // Year selection for past exams
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Search past exams (this would need backend support for historical data)
  const searchPastExams = async () => {
    if (!pastExamFilters.subject) {
      setPastExamPage(null);
      return;
    }

    setIsLoadingPastExams(true);
    try {
      // Note: This assumes the backend can filter by year/semester
      // In reality, you might need additional API endpoints for historical data
      const searchParams = {
        campus: pastExamFilters.campus,
        subject: pastExamFilters.subject,
        course: pastExamFilters.course || undefined,
        section: pastExamFilters.section || undefined,
        year: selectedYear,
        semester: selectedSemester || undefined,
        page: 0,
        size: 50,
        sort: 'startTime,asc'
      };

      // For now, we'll use the regular search endpoint
      // In a real app, you'd have a separate historical search endpoint
      const results = await ApiService.searchExams(searchParams);
      setPastExamPage(results);
    } catch (error) {
      console.error('Failed to search past exams:', error);
      toast({
        title: "Search Failed",
        description: "Failed to load past exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPastExams(false);
    }
  };

  const handleDeleteSchedule = (scheduleId: string, scheduleName: string) => {
    deleteScheduleHistory(scheduleId);
    toast({
      title: "Schedule Deleted",
      description: `"${scheduleName}" has been removed from your history.`,
    });
  };

  const handleLoadSchedule = (scheduleId: string, scheduleName: string) => {
    loadScheduleFromHistory(scheduleId);
    toast({
      title: "Schedule Loaded",
      description: `"${scheduleName}" has been loaded to your current schedule.`,
    });
  };

  const handleDownloadSchedule = (schedule: any) => {
    try {
      const examIds = schedule.exams.map((exam: any) => exam.id);
      const filename = `${schedule.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
      const downloadUrl = ApiService.getIcsDownloadUrlByIds(examIds, filename);
      
      ApiService.downloadFile(downloadUrl, filename);
      
      toast({
        title: "Download Started",
        description: `Downloading "${schedule.name}" calendar file.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatExamDateTime = (startTime: string, durationMin: number | null) => {
    const start = new Date(startTime);
    const duration = durationMin || 120;
    const end = new Date(start.getTime() + duration * 60000);
    
    return {
      date: format(start, "MMM d, yyyy"),
      time: `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`
    };
  };

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const semesterOptions = [
    { value: "W1", label: "Fall (W1)" },
    { value: "W2", label: "Winter (W2)" },
    { value: "S", label: "Summer (S)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
            <p className="text-muted-foreground">
              View your saved schedules and search past semester exam information.
            </p>
          </div>

          <Tabs defaultValue="schedule-history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule-history">My Schedule History</TabsTrigger>
              <TabsTrigger value="past-exams">Past Semesters</TabsTrigger>
            </TabsList>

            {/* Schedule History Tab */}
            <TabsContent value="schedule-history" className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-primary" />
                    <span>Saved Schedules ({scheduleHistory.length})</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your previously saved exam schedules
                  </p>
                </CardHeader>
                <CardContent>
                  {scheduleHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No saved schedules yet</p>
                      <p className="text-sm">Save your current schedule from the Schedule tab to see it here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scheduleHistory.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-smooth"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-medium">{schedule.name}</span>
                                <Badge variant="secondary">
                                  {schedule.exams.length} exams
                                </Badge>
                                <Badge variant="outline">
                                  {schedule.semester} {schedule.year}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Saved {format(new Date(schedule.createdAt), "MMM d, yyyy")}</span>
                                </div>
                                {schedule.downloadedAt && (
                                  <div className="flex items-center space-x-1">
                                    <Download className="w-3 h-3" />
                                    <span>Downloaded {format(new Date(schedule.downloadedAt), "MMM d, yyyy")}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Courses: {Array.from(new Set(schedule.exams.map(exam => `${exam.subject} ${exam.course}`))).join(", ")}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLoadSchedule(schedule.id, schedule.name)}
                              >
                                <RotateCw className="w-3 h-3 mr-1" />
                                Load
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadSchedule(schedule)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSchedule(schedule.id, schedule.name)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Past Exams Tab */}
            <TabsContent value="past-exams" className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-primary" />
                    <span>Search Past Semesters</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Search exam information from previous years and semesters
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Year and Semester Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="year-select">Year</Label>
                      <Select 
                        value={selectedYear.toString()} 
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester-select">Semester (Optional)</Label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger>
                          <SelectValue placeholder="All semesters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All semesters</SelectItem>
                          {semesterOptions.map((semester) => (
                            <SelectItem key={semester.value} value={semester.value}>
                              {semester.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Course Filters */}
                  <ExamFilters
                    onFiltersChange={setPastExamFilters}
                    isLoading={isLoadingPastExams}
                  />

                  <div className="flex justify-center">
                    <Button 
                      onClick={searchPastExams}
                      disabled={!pastExamFilters.subject || isLoadingPastExams}
                      className="flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Past Exams</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Past Exam Results */}
              {pastExamPage && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>Past Exam Results ({pastExamPage.totalElements} found)</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Historical exam data for {selectedYear} {selectedSemester && `- ${semesterOptions.find(s => s.value === selectedSemester)?.label}`}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {pastExamPage.content.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No past exams found for the selected criteria.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="w-[120px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pastExamPage.content.map((exam) => {
                            const dateTime = formatExamDateTime(exam.startTime, exam.durationMin);
                            const inSchedule = isInSchedule(exam.id);
                            return (
                              <TableRow key={exam.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {exam.subject} {exam.course}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Section {exam.section}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{dateTime.date}</div>
                                    <div className="text-sm text-muted-foreground flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {dateTime.time}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{dateTime.duration}</Badge>
                                </TableCell>
                                <TableCell>
                                  {exam.building && exam.room ? (
                                    <div className="flex items-center text-sm">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {exam.building} {exam.room}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">TBA</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToSchedule(exam)}
                                    disabled={inSchedule}
                                  >
                                    {inSchedule ? (
                                      <>
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Added
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add to Schedule
                                      </>
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}