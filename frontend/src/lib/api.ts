// API configuration and service functions
const API_BASE_URL = 'http://localhost:8080/api';

// Types to match your backend API responses
export interface Subject {
  code?: string;
  name?: string;
}

export interface Course {
  code?: string;
  name?: string;
  subject?: string;
}

export interface Section {
  code?: string;
  name?: string;
  subject?: string;
  course?: string;
}

export interface Exam {
  id: number;
  campus: string;
  subject: string;
  course: string;
  section: string;
  startTime: string; // ISO string
  durationMin: number | null;
  building?: string | null;
  room?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ExamSearchParams {
  campus?: string;
  subject?: string;
  course?: string;
  section?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// API service functions
export class ApiService {
  // Fetch subjects for a given campus
  static async getSubjects(campus: string = 'V'): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/meta/subjects?campus=${campus}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.statusText}`);
    }
    return response.json();
  }

  // Fetch courses for a given campus and subject
  static async getCourses(campus: string = 'V', subject: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/meta/courses?campus=${campus}&subject=${subject}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    return response.json();
  }

  // Fetch sections for a given campus, subject, and course
  static async getSections(campus: string = 'V', subject: string, course: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/meta/sections?campus=${campus}&subject=${subject}&course=${course}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sections: ${response.statusText}`);
    }
    return response.json();
  }

  // Search for exams with filters
  static async searchExams(params: ExamSearchParams): Promise<PageResponse<Exam>> {
    const searchParams = new URLSearchParams();
    
    if (params.campus) searchParams.append('campus', params.campus);
    if (params.subject) searchParams.append('subject', params.subject);
    if (params.course) searchParams.append('course', params.course);
    if (params.section) searchParams.append('section', params.section);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/exams/search?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to search exams: ${response.statusText}`);
    }
    return response.json();
  }

  // Generate ICS download URL for selected exam IDs
  static getIcsDownloadUrlByIds(ids: number[], filename?: string): string {
    const searchParams = new URLSearchParams();
    searchParams.append('ids', ids.join(','));
    if (filename) searchParams.append('filename', filename);
    
    return `${API_BASE_URL}/exams/ics?${searchParams.toString()}`;
  }

  // Generate ICS download URL for filtered exams
  static getIcsDownloadUrlByFilter(params: ExamSearchParams, filename?: string): string {
    const searchParams = new URLSearchParams();
    
    if (params.campus) searchParams.append('campus', params.campus);
    if (params.subject) searchParams.append('subject', params.subject);
    if (params.course) searchParams.append('course', params.course);
    if (params.section) searchParams.append('section', params.section);
    if (filename) searchParams.append('filename', filename);

    return `${API_BASE_URL}/exams/ics?${searchParams.toString()}`;
  }

  // Trigger file download
  static downloadFile(url: string, filename?: string): void {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
