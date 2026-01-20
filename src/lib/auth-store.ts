"use client";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  pincode: string;
  voterId?: string;
  createdAt: string;
  isVerified: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  category: string;
  subcategory: string;
  description: string;
  address: string;
  area: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  images?: string[];
  createdAt: string;
  updatedAt: string;
  response?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

const USERS_KEY = "kdmc_ward26_users";
const CURRENT_USER_KEY = "kdmc_ward26_current_user";
const COMPLAINTS_KEY = "kdmc_ward26_complaints";

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function findUserByPhone(phone: string): User | undefined {
  return getUsers().find((u) => u.phone === phone);
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getComplaints(): Complaint[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(COMPLAINTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserComplaints(userId: string): Complaint[] {
  return getComplaints().filter((c) => c.userId === userId);
}

export function saveComplaint(complaint: Complaint): void {
  const complaints = getComplaints();
  const existingIndex = complaints.findIndex((c) => c.id === complaint.id);
  if (existingIndex >= 0) {
    complaints[existingIndex] = complaint;
  } else {
    complaints.push(complaint);
  }
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const COMPLAINT_CATEGORIES = {
  "Roads & Infrastructure": [
    "Pothole",
    "Street Light",
    "Road Damage",
    "Footpath Issue",
    "Drainage Block",
    "Speed Breaker"
  ],
  "Water Supply": [
    "No Water Supply",
    "Low Pressure",
    "Contaminated Water",
    "Pipeline Leak",
    "Meter Issue"
  ],
  "Sanitation & Waste": [
    "Garbage Collection",
    "Open Dumping",
    "Drainage Overflow",
    "Public Toilet",
    "Dead Animal Removal"
  ],
  "Electricity": [
    "Power Outage",
    "Street Light",
    "Transformer Issue",
    "Wire Hanging",
    "Meter Problem"
  ],
  "Public Safety": [
    "Encroachment",
    "Illegal Construction",
    "Stray Animals",
    "Noise Pollution",
    "Traffic Issue"
  ],
  "Parks & Gardens": [
    "Park Maintenance",
    "Tree Cutting",
    "Plantation Request",
    "Bench Repair",
    "Garden Light"
  ],
  "Other": [
    "General Complaint",
    "Suggestion",
    "Appreciation",
    "Query"
  ]
};
