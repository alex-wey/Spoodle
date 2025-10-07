import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";

/**
 * Combines class names using clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, formatStr = "MMM dd, yyyy") {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date to a relative time string
 */
export function formatRelativeDate(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, "h:mm a")}`;
  }
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, "h:mm a")}`;
  }
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, "h:mm a")}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a time string (HH:MM) to 12-hour format
 */
export function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string) {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get a greeting based on the time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Get pet age string with proper pluralization
 */
export function getPetAgeString(age: number) {
  if (age === 0) return "Less than 1 year old";
  if (age === 1) return "1 year old";
  return `${age} years old`;
}

/**
 * Get gender icon
 */
export function getGenderSymbol(gender: "male" | "female") {
  return gender === "male" ? "♂" : "♀";
}

/**
 * Get status color for appointments
 */
export function getAppointmentStatusColor(status: string) {
  const colors = {
    scheduled: "#3B82F6", // blue
    confirmed: "#10B981", // green
    in_progress: "#F59E0B", // amber
    completed: "#6B7280", // gray
    cancelled: "#EF4444", // red
    no_show: "#DC2626", // red
  };
  
  return colors[status as keyof typeof colors] || "#6B7280";
}

/**
 * Get priority color for tasks
 */
export function getTaskPriorityColor(priority: string) {
  const colors = {
    low: "#10B981", // green
    medium: "#F59E0B", // amber
    high: "#EF4444", // red
  };
  
  return colors[priority as keyof typeof colors] || "#6B7280";
}


