import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { ApiService, Exam, PageResponse } from "@/lib/api";
import { useSchedule } from "@/contexts/ScheduleContext";

interface ExamResultsProps {
  examPage: PageResponse<Exam> | null;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ExamResults({
  examPage,
  onPageChange,
  isLoading
}: ExamResultsProps) {
  const { addToSchedule, isInSchedule } = useSchedule();
  const exams = examPage?.content || [];
  const totalElements = examPage?.totalElements || 0;
  const totalPages = examPage?.totalPages || 0;
  const currentPage = examPage?.number || 0;

  const formatExamDateTime = (startTime: string, durationMin: number | null) => {
    const start = new Date(startTime);
    const duration = durationMin || 120; // Default to 2 hours if null
    const end = new Date(start.getTime() + duration * 60000);
    
    return {
      date: format(start, "MMM d, yyyy"),
      time: `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`
    };
  };

  const handleAddToSchedule = (exam: Exam) => {
    addToSchedule(exam);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Search Results ({totalElements} exams found)</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click "Add to Schedule" to add exams to your personal schedule
          </p>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No exams found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                  {exams.map((exam) => {
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
                            variant={inSchedule ? "secondary" : "default"}
                            onClick={() => handleAddToSchedule(exam)}
                            disabled={inSchedule}
                          >
                            {inSchedule ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {currentPage * (examPage?.size || 20) + 1} to {Math.min((currentPage + 1) * (examPage?.size || 20), totalElements)} of {totalElements} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}