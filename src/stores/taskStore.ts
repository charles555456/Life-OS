import { create } from "zustand";
import { db, today, tomorrow } from "@/lib/db";
import { triggerSync } from "@/lib/triggerSync";
import type { Task, TaskPriority, CutoffLine } from "@/types";

interface TaskState {
  // Data
  inboxTasks: Task[];      // collected today → for tomorrow
  todayTasks: Task[];      // today's closed list (above cutoff)
  urgentTasks: Task[];     // today's tasks below cutoff line
  cutoffExists: boolean;   // whether today has a cutoff line

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (text: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setPriority: (id: string, priority: TaskPriority | null) => Promise<void>;
  promoteToToday: (id: string) => Promise<void>;    // move inbox → today (urgent)
  drawCutoffLine: () => Promise<void>;               // seal today's list
  moveToTomorrow: () => Promise<void>;               // end of day: uncompleted → tomorrow
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useTaskStore = create<TaskState>((set, get) => ({
  inboxTasks: [],
  todayTasks: [],
  urgentTasks: [],
  cutoffExists: false,

  loadTasks: async () => {
    const todayStr = today();
    const tomorrowStr = tomorrow();

    // Today's tasks = targetDate is today
    const allToday = await db.tasks
      .where("targetDate")
      .equals(todayStr)
      .toArray();

    const above = allToday
      .filter((t) => !t.isBelowCutoffLine)
      .sort(prioritySort);
    const below = allToday.filter((t) => t.isBelowCutoffLine);

    // Inbox = tasks targeted for tomorrow (collected today)
    const inbox = await db.tasks
      .where("targetDate")
      .equals(tomorrowStr)
      .toArray();

    // Check cutoff line
    const cutoff = await db.cutoffLines.get(todayStr);

    set({
      todayTasks: above,
      urgentTasks: below,
      inboxTasks: inbox.sort((a, b) => a.id.localeCompare(b.id)),
      cutoffExists: !!cutoff,
    });
  },

  addTask: async (text: string) => {
    const tomorrowStr = tomorrow();
    const task: Task = {
      id: genId(),
      text,
      category: "task",
      createdDate: today(),
      targetDate: tomorrowStr,
      priority: null,
      completed: false,
      completedDate: null,
      isBelowCutoffLine: false,
      isRoutine: false,
    };
    await db.tasks.add(task);
    triggerSync();
    await get().loadTasks();
  },

  toggleComplete: async (id: string) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    const nowCompleted = !task.completed;
    await db.tasks.update(id, {
      completed: nowCompleted,
      completedDate: nowCompleted ? today() : null,
    });
    triggerSync();
    await get().loadTasks();
  },

  deleteTask: async (id: string) => {
    await db.tasks.delete(id);
    triggerSync();
    await get().loadTasks();
  },

  setPriority: async (id: string, priority: TaskPriority | null) => {
    await db.tasks.update(id, { priority });
    triggerSync();
    await get().loadTasks();
  },

  promoteToToday: async (id: string) => {
    // Move a task from inbox (tomorrow) → today's urgent (below cutoff)
    const todayStr = today();
    await db.tasks.update(id, {
      targetDate: todayStr,
      isBelowCutoffLine: true,
    });
    triggerSync();
    await get().loadTasks();
  },

  drawCutoffLine: async () => {
    const todayStr = today();
    const existing = await db.cutoffLines.get(todayStr);
    if (!existing) {
      const line: CutoffLine = {
        date: todayStr,
        createdAt: new Date().toISOString(),
      };
      await db.cutoffLines.add(line);
      triggerSync();
    }
    set({ cutoffExists: true });
  },

  moveToTomorrow: async () => {
    // End-of-day: move uncompleted today tasks → tomorrow
    const todayStr = today();
    const tomorrowStr = tomorrow();
    const uncompleted = await db.tasks
      .where("targetDate")
      .equals(todayStr)
      .filter((t) => !t.completed)
      .toArray();

    for (const task of uncompleted) {
      await db.tasks.update(task.id, {
        targetDate: tomorrowStr,
        isBelowCutoffLine: false,
        priority: null, // re-prioritize tomorrow
      });
    }
    triggerSync();
    await get().loadTasks();
  },
}));

// Sort: project → urgent1 → urgent2 → maintain1-3 → null
const priorityOrder: Record<string, number> = {
  project: 0,
  urgent1: 1,
  urgent2: 2,
  maintain1: 3,
  maintain2: 4,
  maintain3: 5,
};

function prioritySort(a: Task, b: Task): number {
  const pa = a.priority ? priorityOrder[a.priority] ?? 99 : 99;
  const pb = b.priority ? priorityOrder[b.priority] ?? 99 : 99;
  if (pa !== pb) return pa - pb;
  // Completed items go to bottom
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  return 0;
}
