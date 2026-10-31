import { z } from 'zod';

export const ADHDSubtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false)
});

export type ADHDSubtask = z.infer<typeof ADHDSubtaskSchema>;

export const ADHDTaskItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  durationMinutes: z.number().min(1).max(120).default(5),
  completed: z.boolean().default(false),
  skipped: z.boolean().default(false),
  subtasks: z.array(ADHDSubtaskSchema).default([])
});

export type ADHDTaskItem = z.infer<typeof ADHDTaskItemSchema>;

export const ADHDStudyPlanSchema = z.object({
  goal: z.string().min(1),
  conceptId: z.string().optional(),
  createdAt: z.number().default(() => Date.now()),
  tasks: z.array(ADHDTaskItemSchema).min(1),
  activeTaskIndex: z.number().default(0)
});

export type ADHDStudyPlan = z.infer<typeof ADHDStudyPlanSchema>;

export const ADHDStudyPlanRequestSchema = z.object({
  goal: z.string().min(2, 'Goal must be at least 2 characters'),
  conceptId: z.string().optional(),
  targetDurationMinutes: z.number().min(5).max(120).optional().default(20)
});

export type ADHDStudyPlanRequest = z.infer<typeof ADHDStudyPlanRequestSchema>;

/**
 * Deterministic fallback generator for manageable bite-sized micro-tasks.
 * Fully usable offline or when external AI services are unavailable.
 */
export function generateDeterministicStudyPlan(goal: string, conceptId?: string): ADHDStudyPlan {
  const cleanGoal = goal.trim();
  const lowerGoal = cleanGoal.toLowerCase();

  let tasks: ADHDTaskItem[] = [];

  if (lowerGoal.includes('cell') || conceptId === 'human_cell') {
    tasks = [
      {
        id: 'task_1',
        title: 'Identify the outer boundary (Plasma Membrane & Cytoplasm)',
        durationMinutes: 3,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_1', title: 'Find the plasma membrane in the model', completed: false },
          { id: 'sub_2', title: 'Note how the fluid mosaic model acts like a gatekeeper', completed: false }
        ]
      },
      {
        id: 'task_2',
        title: 'Explore the Nucleus & genetic command center',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_3', title: 'Inspect the nuclear envelope pores', completed: false },
          { id: 'sub_4', title: 'Locate the nucleolus where ribosomes are made', completed: false }
        ]
      },
      {
        id: 'task_3',
        title: 'Understand Mitochondria and ATP cellular energy',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_5', title: 'Observe the folded cristae inner membranes', completed: false },
          { id: 'sub_6', title: 'Connect cellular respiration to glucose and oxygen', completed: false }
        ]
      },
      {
        id: 'task_4',
        title: 'Compare Endoplasmic Reticulum and Golgi packaging',
        durationMinutes: 5,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_7', title: 'Contrast rough ER (ribosome studded) vs smooth ER', completed: false },
          { id: 'sub_8', title: 'Trace how secretory vesicles bud from the Golgi', completed: false }
        ]
      },
      {
        id: 'task_5',
        title: 'Quick 3-question active recall practice',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_9', title: 'Answer question 1 without looking at notes', completed: false },
          { id: 'sub_10', title: 'Review any missed question explanation', completed: false }
        ]
      }
    ];
  } else if (lowerGoal.includes('heart') || lowerGoal.includes('cardio') || conceptId === 'human_heart') {
    tasks = [
      {
        id: 'task_1',
        title: 'Trace right atrium and vena cava blood return',
        durationMinutes: 3,
        completed: false,
        skipped: false,
        subtasks: [{ id: 'sub_1', title: 'Locate deoxygenated intake chambers', completed: false }]
      },
      {
        id: 'task_2',
        title: 'Follow pulmonary circulation through the lungs',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [{ id: 'sub_2', title: 'Observe pulmonary artery to alveolar capillaries', completed: false }]
      },
      {
        id: 'task_3',
        title: 'Examine left ventricle muscular wall and aorta',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [{ id: 'sub_3', title: 'Notice why left ventricle has thicker myocardium', completed: false }]
      },
      {
        id: 'task_4',
        title: 'Review the 4 cardiac valves and prevent backflow',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [{ id: 'sub_4', title: 'Identify tricuspid, bicuspid, and semilunar valves', completed: false }]
      },
      {
        id: 'task_5',
        title: 'Complete 3-question cardiac circuit recall',
        durationMinutes: 3,
        completed: false,
        skipped: false,
        subtasks: [{ id: 'sub_5', title: 'Test systemic vs pulmonary pressures', completed: false }]
      }
    ];
  } else {
    // Universal structured template
    tasks = [
      {
        id: 'task_1',
        title: `Define the core idea of "${cleanGoal}" in one plain sentence`,
        durationMinutes: 3,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_1', title: 'Read the summary overview', completed: false },
          { id: 'sub_2', title: 'Write down what problem this concept solves', completed: false }
        ]
      },
      {
        id: 'task_2',
        title: 'Inspect the primary structure or key rule',
        durationMinutes: 5,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_3', title: 'Examine the first interactive diagram or example', completed: false },
          { id: 'sub_4', title: 'Identify the 2 most important parts', completed: false }
        ]
      },
      {
        id: 'task_3',
        title: 'Connect the idea to a real-world analogy or example',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_5', title: 'Read the everyday analogy', completed: false },
          { id: 'sub_6', title: 'Describe how it compares to something familiar', completed: false }
        ]
      },
      {
        id: 'task_4',
        title: 'Test yourself with 2 quick practice questions',
        durationMinutes: 4,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_7', title: 'Attempt active recall without looking at answers', completed: false }
        ]
      },
      {
        id: 'task_5',
        title: 'Teach it back in 30 seconds',
        durationMinutes: 3,
        completed: false,
        skipped: false,
        subtasks: [
          { id: 'sub_8', title: 'Explain the concept simply in your own words', completed: false }
        ]
      }
    ];
  }

  return {
    goal: cleanGoal,
    conceptId,
    createdAt: Date.now(),
    tasks,
    activeTaskIndex: 0
  };
}

