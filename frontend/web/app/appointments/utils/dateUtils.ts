// Get start of week (Monday)
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

// Get all days in the week
export const getWeekDays = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

// Format time for display
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Format time for calendar grid (short format without minutes)
export const formatTimeShort = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
};

// Format date for day header - returns object with parts for better styling
export const formatDayHeader = (date: Date): { weekday: string; day: string; month: string } => {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase();
  const day = date.getDate().toString();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).toUpperCase();
  
  return { weekday, day, month };
};

// Format month and year for navigation
export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};
