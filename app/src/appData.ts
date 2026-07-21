// DreamAvian Studios — Application Data and Type Definitions
// No mock/fake data. Arrays start empty and are filled by real users at runtime.

export interface UserCredential {
  email: string;
  password: string;
  role: string;
  name: string;
  roleTitle: string;
  avatar?: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'Pre-Production' | 'Production' | 'Post-Production' | 'Delivered';
  budget: string;
  completion: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'QA Review' | 'Director Review' | 'Client Review' | 'Approved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  projectName: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
  projectName: string;
}

export interface Course {
  id: string;
  title: string;
  trainer: string;
  studentsCount: number;
  progress: number;
  duration: string;
  price: string;
}

export interface AttendanceRecord {
  id: string;
  userName: string;
  time: string;
  status: 'Present' | 'Late' | 'Absent';
  method: 'QR Code' | 'Biometric' | 'Remote';
}

export interface IDCard {
  cardId: string;
  userName: string;
  role: string;
  qrHash: string;
  status: 'Active' | 'Suspended' | 'Expired';
  zones: string[];
  bloodGroup?: string;
  expiryDate?: string;
  department?: string;
  clearanceLevel?: string;
  image?: string;
  phone?: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  status: 'Applied' | 'Screened' | 'Interview' | 'Offered';
  score: number;
  email: string;
  appliedRole: string;
  assessmentScore: number;
  resumeFile: string;
  stage: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// User store — localStorage backed, seeded with the studio owner on first run
const USERS_KEY = 'das-users-v2';

const SEED_OWNER: UserCredential = {
  email: 'dreamavianstudios@gmail.com',
  password: 'Dr3@mAv!an$2026#',
  role: 'studio_owner',
  name: 'Studio Owner',
  roleTitle: 'Studio Owner',
};

function loadUsers(): UserCredential[] {
  try {
    const s = localStorage.getItem(USERS_KEY);
    if (s) return JSON.parse(s) as UserCredential[];
  } catch (_) {}
  const initial = [SEED_OWNER];
  try { localStorage.setItem(USERS_KEY, JSON.stringify(initial)); } catch (_) {}
  return initial;
}

function saveUsers(users: UserCredential[]): void {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (_) {}
}

export const DEMO_CREDENTIALS: UserCredential[] = loadUsers();

export function registerUser(newUser: UserCredential): void {
  DEMO_CREDENTIALS.push(newUser);
  saveUsers(DEMO_CREDENTIALS);
}

// Empty runtime arrays
export const MOCK_PROJECTS: Project[] = [];
export const MOCK_TASKS: Task[] = [];
export const MOCK_INVOICES: Invoice[] = [];
export const MOCK_COURSES: Course[] = [];
export const MOCK_ATTENDANCE: AttendanceRecord[] = [];
export const MOCK_CANDIDATES: Candidate[] = [];
export const MOCK_ID_CARDS: IDCard[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];

// AI contextual hints per role (not fake data)
export const AI_MOCK_RESPONSES: Record<string, string> = {
  default: 'I am your DreamAvian Studios AI Assistant. How can I help you today?',
  super_admin: 'All systems operational. Ask me about system health, users, or analytics.',
  studio_owner: 'Welcome back! Ask me about projects, revenue, or team utilization.',
  director: 'Ready to help with shot reviews, animation notes, or schedules.',
  producer: 'I can assist with budgets, milestones, or workload balancing.',
  project_manager: 'Ask me about velocity, sprint blockers, or timeline risks.',
  animator: 'Need a Maya/Blender script, rigging help, or render fix? Just ask.',

  student: 'Ask me about your course progress, assignments, or learning resources.',
  client: 'Your milestones, deliverables, and review approvals are a message away.',
};
