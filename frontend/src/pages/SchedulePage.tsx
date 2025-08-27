import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Download, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Save,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSchedule } from "@/contexts/ScheduleContext";
import { ApiService } from "@/lib/api";

export default function SchedulePage() {
  const { 
    currentSchedule, 
    removeFromSchedule, 
    clearSchedule, 
    saveCurrentSchedule 
  } = useSchedule();
  const { toast } = useToast();
  
  // Save schedule form state
  const [saveFormOpen, setSaveFormOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

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

  const handleDownloadSchedule = () => {
    if (currentSchedule.length === 0) {
      toast({
        title: "No Exams in Schedule",
        description: "Add some exams to your schedule first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const examIds = currentSchedule.map(exam => exam.id);
      const filename = `my-ubc-exam-schedule-${new Date().toISOString().split('T')[0]}.ics`;
      const downloadUrl = ApiService.getIcsDownloadUrlByIds(examIds, filename);
      
      ApiService.downloadFile(downloadUrl, filename);
      
      toast({
        title: "Download Started",
        description: `Downloading calendar file for ${currentSchedule.length} exams.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download your schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveExam = (examId: number) => {
    removeFromSchedule(examId);
    toast({
      title: "Exam Removed",
      description: "Exam has been removed from your schedule.",
    });
  };

  const handleClearSchedule = () => {
    if (currentSchedule.length === 0) return;
    
    clearSchedule();
    toast({
      title: "Schedule Cleared",
      description: "All exams have been removed from your schedule.",
    });
  };

  const handleSaveSchedule = () => {
    if (!scheduleName.trim() || !semester || !year) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to save your schedule.",
        variant: "destructive",
      });
      return;
    }

    if (currentSchedule.length === 0) {
      toast({
        title: "Empty Schedule",
        description: "Add some exams to your schedule before saving.",
        variant: "destructive",
      });
      return;
    }

    saveCurrentSchedule(scheduleName.trim(), semester, year);
    
    // Reset form
    setScheduleName("");
    setSemester("");
    setYear(new Date().getFullYear());
    setSaveFormOpen(false);
    
    toast({
      title: "Schedule Saved",
      description: `"${scheduleName}" has been saved to your history.`,
    });
  };

  // Generate semester options
  const currentYear = new Date().getFullYear();
  const semesterOptions = [
    { value: `${currentYear}W1`, label: `${currentYear} Fall (W1)` },
    { value: `${currentYear}W2`, label: `${currentYear} Winter (W2)` },
    { value: `${currentYear}S`, label: `${currentYear} Summer (S)` },
    { value: `${currentYear + 1}W1`, label: `${currentYear + 1} Fall (W1)` },
    { value: `${currentYear + 1}W2`, label: `${currentYear + 1} Winter (W2)` },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Schedule</h1>
            <p className="text-muted-foreground">
              Manage your personal exam schedule and download as calendar file.
            </p>
          </div>

          {/* Schedule Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Current Schedule ({currentSchedule.length} exams)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleDownloadSchedule}
                  disabled={currentSchedule.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Schedule</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setSaveFormOpen(!saveFormOpen)}
                  disabled={currentSchedule.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to History</span>
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleClearSchedule}
                  disabled={currentSchedule.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Schedule</span>
                </Button>
              </div>

              {/* Save Schedule Form */}
              {saveFormOpen && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-medium mb-4">Save Schedule to History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule-name">Schedule Name</Label>
                      <Input
                        id="schedule-name"
                        placeholder="e.g., Fall 2024 Finals"
                        value={scheduleName}
                        onChange={(e) => setScheduleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        min="2020"
                        max="2030"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setSaveFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSchedule}>
                      Save Schedule
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Table */}
          <Card className="shadow-card">
            <CardContent className="p-0">
              {currentSchedule.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Exams in Schedule</h3>
                  <p className="mb-4">
                    Go to the Search tab to find and add exams to your schedule.
                  </p>
                  <Button asChild>
                    <a href="/search">Search Exams</a>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSchedule
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((exam) => {
                        const dateTime = formatExamDateTime(exam.startTime, exam.durationMin);
                        const addedDate = format(new Date(exam.addedAt), "MMM d");
                        
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
                              <span className="text-sm text-muted-foreground">{addedDate}</span>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveExam(exam.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
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

          {currentSchedule.length > 0 && (
            <Card className="shadow-card border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Schedule Tips</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      • Download your schedule as an .ics file to import into Google Calendar, Outlook, or other calendar apps<br />
                      • Save your schedule to history before clearing it to keep a record<br />
                      • Exams are automatically sorted by date and time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
