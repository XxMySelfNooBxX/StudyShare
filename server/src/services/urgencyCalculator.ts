export enum TaskUrgency {
  SAFE = 'safe',      // >7 days away
  WARNING = 'warning', // 3-7 days away
  CRITICAL = 'critical' // <3 days away or overdue
}

export function calculateUrgency(dueDate: Date | null | string | undefined): TaskUrgency {
  if (!dueDate) return TaskUrgency.SAFE;
  
  const due = new Date(dueDate);
  const now = new Date();
  
  // Ignore time for date comparison to be fair
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return TaskUrgency.CRITICAL; // Overdue
  if (daysUntilDue <= 3) return TaskUrgency.CRITICAL;
  if (daysUntilDue <= 7) return TaskUrgency.WARNING;
  
  return TaskUrgency.SAFE;
}

export function getDaysUntilDue(dueDate: Date | null | string | undefined): number | null {
  if (!dueDate) return null;
  
  const due = new Date(dueDate);
  const now = new Date();
  
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
