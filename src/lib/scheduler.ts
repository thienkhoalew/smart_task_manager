import { Task } from './db';

export interface ScheduledTask extends Task {
  remainingDays: number;
  schedulingScore: number;
}

export function getSmartSchedule(tasks: Task[]): ScheduledTask[] {
  const now = new Date();
  const activeTasks = tasks.filter(t => t.status !== 'done');

  const scheduled: ScheduledTask[] = activeTasks.map(task => {
    const deadlineDate = new Date(task.deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const remainingDays = timeDiff / (1000 * 60 * 60 * 24);
    const effectiveDays = remainingDays <= 0 ? 0.05 : remainingDays;
    const schedulingScore = task.priority / effectiveDays;

    return {
      ...task,
      remainingDays: Math.round(remainingDays * 100) / 100,
      schedulingScore: Math.round(schedulingScore * 100) / 100,
    };
  });

  return scheduled.sort((a, b) => {
    if (b.schedulingScore !== a.schedulingScore) {
      return b.schedulingScore - a.schedulingScore;
    }

    const aTime = new Date(a.deadline).getTime();
    const bTime = new Date(b.deadline).getTime();
    if (aTime !== bTime) {
      return aTime - bTime;
    }

    return b.priority - a.priority;
  });
}
