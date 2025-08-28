// frontend/src/lib/api.ts
// Configurable API base with safe coercion

function resolveApiBase(): string {
  // Pull from Vite or CRA-style envs if present
  const vite = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL);
  const cra  = (typeof process !== "undefined" && (process as any).env?.REACT_APP_API_BASE_URL);

  // Coerce to string safely (guards against number/object/bool)
  const raw = vite ?? cra ?? "/api";
  const base = typeof raw === "string" ? raw : String(raw);

  const trimmed = base.trim();
  if (!trimmed) return "/api";

  // Strip trailing slashes so we can concat paths consistently
  return trimmed.replace(/\/+$/, "");
}

const API_BASE = resolveApiBase();

// ---- Types (match backend DTOs) ----
export interface Subject { code?: string; name?: string; }
export interface Course  { code?: string; name?: string; subject?: string; }
export interface Section { code?: string; name?: string; subject?: string; course?: string; }

export interface Exam {
  id: number;
  campus: string;
  subject: string;
  course: string;
  section: string;
  startTime: string;        // ISO (UTC from backend)
  durationMin: number | null;
  building?: string | null;
  room?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;           // page index (0-based)
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
  sort?: string;            // e.g. "startTime,asc"
  // (future) year?: number;
  // (future) semester?: string;
}

// ---- Helpers ----
type Dict = Record<string, unknown>;

function qs(obj: Dict): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    sp.append(k, String(v));
  }
  return sp.toString();
}

function withTimeout(ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

async function getJson<T>(path: string, params?: Dict): Promise<T> {
  const q = params && Object.keys(params).length ? `?${qs(params)}` : "";
  const url = `${API_BASE}${path}${q}`;
  const t = withTimeout();

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: t.signal,
      credentials: "include", // safe default; remove if not using cookies
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  } finally {
    t.clear();
  }
}

// ---- API service ----
export class ApiService {
  // Meta
  static async getSubjects(campus: string = "V"): Promise<string[]> {
    return getJson<string[]>("/meta/subjects", { campus });
  }
  static async getCourses(campus: string = "V", subject: string): Promise<string[]> {
    return getJson<string[]>("/meta/courses", { campus, subject });
  }
  static async getSections(campus: string = "V", subject: string, course: string): Promise<string[]> {
    return getJson<string[]>("/meta/sections", { campus, subject, course });
  }

  // Search
  static async searchExams(params: ExamSearchParams): Promise<PageResponse<Exam>> {
    const query: ExamSearchParams = {
      campus: "V",
      page: 0,
      size: 20,
      sort: "startTime,asc",
      ...params,
    };
    return getJson<PageResponse<Exam>>("/exams/search", query as Dict);
  }

  // ICS URLs
  static getIcsDownloadUrlByIds(ids: number[], filename?: string): string {
    const query: Dict = { ids: ids.join(",") };
    if (filename && filename.trim()) query.filename = filename.trim();
    return `${API_BASE}/exams/ics?${qs(query)}`;
  }

  static getIcsDownloadUrlByFilter(params: ExamSearchParams, filename?: string): string {
    const query: Dict = {
      campus: params.campus ?? "V",
      subject: params.subject,
      course: params.course,
      section: params.section,
    };
    if (filename && filename.trim()) query.filename = filename.trim();
    return `${API_BASE}/exams/ics?${qs(query)}`;
  }

  // Trigger download
  static downloadFile(url: string, filename?: string): void {
    const a = document.createElement("a");
    a.href = url;
    if (filename && filename.trim()) a.download = filename.trim();
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Exported for debugging/custom clients
export const API_BASE_URL = API_BASE;
