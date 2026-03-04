import { create } from "zustand";
import { db, today } from "@/lib/db";
import { triggerSync } from "@/lib/triggerSync";
import type { Goal, GoalDailyCheck } from "@/types";

interface GoalState {
  lifeGoals: Goal[];
  workGoals: Goal[];
  todayChecks: Record<string, GoalDailyCheck>; // goalId → check

  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateProgress: (id: string, currentValue: number) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Daily check-in
  toggleDailyCheck: (goalId: string) => Promise<void>;
  addDailyValue: (goalId: string, value: number) => Promise<void>;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const levelOrder = { yearly: 0, quarterly: 1, weekly: 2 };

function sortGoals(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (levelOrder[a.level] ?? 9) - (levelOrder[b.level] ?? 9);
  });
}

function checkId(goalId: string, date: string) {
  return `${goalId}_${date}`;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  lifeGoals: [],
  workGoals: [],
  todayChecks: {},

  loadGoals: async () => {
    const todayStr = today();
    const all = await db.goals.toArray();

    // Load today's checks for all goals
    const checks = await db.goalDailyChecks
      .where("date")
      .equals(todayStr)
      .toArray();

    const checksMap: Record<string, GoalDailyCheck> = {};
    for (const c of checks) {
      checksMap[c.goalId] = c;
    }

    set({
      lifeGoals: sortGoals(all.filter((g) => g.dimension === "life")),
      workGoals: sortGoals(all.filter((g) => g.dimension === "work")),
      todayChecks: checksMap,
    });
  },

  addGoal: async (goal) => {
    const full: Goal = { ...goal, id: genId() };
    await db.goals.add(full);
    triggerSync();
    await get().loadGoals();
  },

  updateProgress: async (id, currentValue) => {
    await db.goals.update(id, { currentValue });
    triggerSync();
    await get().loadGoals();
  },

  toggleComplete: async (id) => {
    const goal = await db.goals.get(id);
    if (!goal) return;
    await db.goals.update(id, { completed: !goal.completed });
    triggerSync();
    await get().loadGoals();
  },

  deleteGoal: async (id) => {
    // Also clean up daily checks
    await db.goalDailyChecks.where("goalId").equals(id).delete();
    triggerSync();
    await db.goals.delete(id);
    triggerSync();
    await get().loadGoals();
  },

  toggleDailyCheck: async (goalId: string) => {
    const todayStr = today();
    const id = checkId(goalId, todayStr);
    const existing = await db.goalDailyChecks.get(id);

    if (existing) {
      await db.goalDailyChecks.update(id, { checked: !existing.checked });
    } else {
      const check: GoalDailyCheck = {
        id,
        goalId,
        date: todayStr,
        checked: true,
        addedValue: 0,
      };
      await db.goalDailyChecks.add(check);
    }
    triggerSync();
    await get().loadGoals();
  },

  addDailyValue: async (goalId: string, value: number) => {
    const todayStr = today();
    const id = checkId(goalId, todayStr);
    const existing = await db.goalDailyChecks.get(id);

    if (existing) {
      // Update today's added value
      const diff = value - existing.addedValue;
      await db.goalDailyChecks.update(id, {
        addedValue: value,
        checked: value > 0,
      });
      triggerSync();
      // Update goal's cumulative currentValue
      const goal = await db.goals.get(goalId);
      if (goal) {
        await db.goals.update(goalId, {
          currentValue: (goal.currentValue ?? 0) + diff,
        });
        triggerSync();
      }
    } else {
      // New check for today
      const check: GoalDailyCheck = {
        id,
        goalId,
        date: todayStr,
        checked: value > 0,
        addedValue: value,
      };
      await db.goalDailyChecks.add(check);
      triggerSync();
      // Add to goal's cumulative
      const goal = await db.goals.get(goalId);
      if (goal) {
        await db.goals.update(goalId, {
          currentValue: (goal.currentValue ?? 0) + value,
        });
        triggerSync();
      }
    }
    await get().loadGoals();
  },
}));
