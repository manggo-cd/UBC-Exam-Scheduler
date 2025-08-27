import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exam } from '@/lib/api';

export interface ScheduleItem extends Exam {
  addedAt: string; // ISO timestamp when added
  semester?: string; // e.g., "2024W1", "2024S1" 
  year?: number; // e.g., 2024
}

export interface ScheduleHistory {
  id: string;
  name: string; // e.g., "Fall 2024 Finals"
  semester: string;
  year: number;
  exams: ScheduleItem[];
  createdAt: string;
  downloadedAt?: string;
}

interface ScheduleContextType {
  // Current schedule
  currentSchedule: ScheduleItem[];
  addToSchedule: (exam: Exam) => void;
  removeFromSchedule: (examId: number) => void;
  clearSchedule: () => void;
  isInSchedule: (examId: number) => boolean;
  
  // Schedule history
  scheduleHistory: ScheduleHistory[];
  saveCurrentSchedule: (name: string, semester: string, year: number) => void;
  deleteScheduleHistory: (historyId: string) => void;
  loadScheduleFromHistory: (historyId: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_SCHEDULE: 'ubc-exam-planner-current-schedule',
  SCHEDULE_HISTORY: 'ubc-exam-planner-schedule-history',
};

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem[]>([]);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistory[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedSchedule = localStorage.getItem(STORAGE_KEYS.CURRENT_SCHEDULE);
      const savedHistory = localStorage.getItem(STORAGE_KEYS.SCHEDULE_HISTORY);
      
      if (savedSchedule) {
        setCurrentSchedule(JSON.parse(savedSchedule));
      }
      
      if (savedHistory) {
        setScheduleHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load schedule data from localStorage:', error);
    }
  }, []);

  // Save current schedule to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SCHEDULE, JSON.stringify(currentSchedule));
    } catch (error) {
      console.error('Failed to save current schedule to localStorage:', error);
    }
  }, [currentSchedule]);

  // Save schedule history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_HISTORY, JSON.stringify(scheduleHistory));
    } catch (error) {
      console.error('Failed to save schedule history to localStorage:', error);
    }
  }, [scheduleHistory]);

  const addToSchedule = (exam: Exam) => {
    const scheduleItem: ScheduleItem = {
      ...exam,
      addedAt: new Date().toISOString(),
      // Extract semester/year from exam startTime if possible
      semester: extractSemesterFromDate(exam.startTime),
      year: new Date(exam.startTime).getFullYear(),
    };

    setCurrentSchedule(prev => {
      // Check if exam is already in schedule
      if (prev.some(item => item.id === exam.id)) {
        return prev;
      }
      return [...prev, scheduleItem];
    });
  };

  const removeFromSchedule = (examId: number) => {
    setCurrentSchedule(prev => prev.filter(item => item.id !== examId));
  };

  const clearSchedule = () => {
    setCurrentSchedule([]);
  };

  const isInSchedule = (examId: number) => {
    return currentSchedule.some(item => item.id === examId);
  };

  const saveCurrentSchedule = (name: string, semester: string, year: number) => {
    if (currentSchedule.length === 0) return;

    const historyItem: ScheduleHistory = {
      id: Date.now().toString(),
      name,
      semester,
      year,
      exams: [...currentSchedule],
      createdAt: new Date().toISOString(),
    };

    setScheduleHistory(prev => [historyItem, ...prev]);
  };

  const deleteScheduleHistory = (historyId: string) => {
    setScheduleHistory(prev => prev.filter(item => item.id !== historyId));
  };

  const loadScheduleFromHistory = (historyId: string) => {
    const historyItem = scheduleHistory.find(item => item.id === historyId);
    if (historyItem) {
      setCurrentSchedule(historyItem.exams);
    }
  };

  // Helper function to extract semester from exam date
  const extractSemesterFromDate = (startTime: string): string => {
    const date = new Date(startTime);
    const month = date.getMonth() + 1; // getMonth() is 0-based
    const year = date.getFullYear();
    
    // UBC semester mapping (approximate)
    if (month >= 9 && month <= 12) {
      return `${year}W1`; // Fall term
    } else if (month >= 1 && month <= 4) {
      return `${year}W2`; // Winter term  
    } else if (month >= 5 && month <= 8) {
      return `${year}S`; // Summer term
    }
    
    return `${year}W1`; // Default to fall
  };

  const value: ScheduleContextType = {
    currentSchedule,
    addToSchedule,
    removeFromSchedule,
    clearSchedule,
    isInSchedule,
    scheduleHistory,
    saveCurrentSchedule,
    deleteScheduleHistory,
    loadScheduleFromHistory,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
