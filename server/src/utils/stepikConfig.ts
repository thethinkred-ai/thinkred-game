export function getStepikCourseId(): number {
  const id = process.env.STEPIK_COURSE_ID;
  return id ? parseInt(id, 10) : 0;
}

export function isStepikConfigured(): boolean {
  return getStepikCourseId() > 0;
}

export function getStepikLessonMap(): Record<string, number> {
  if (!isStepikConfigured()) {
    return {};
  }

  const defaults: Record<string, number> = {
    lesson_1: 0,
    lesson_2: 0,
    lesson_3: 0,
    lesson_4: 0,
    lesson_5: 0,
    lesson_6: 0,
    lesson_7: 0,
    lesson_8: 0,
  };

  if (process.env.STEPIK_LESSON_MAP) {
    try {
      return { ...defaults, ...JSON.parse(process.env.STEPIK_LESSON_MAP) };
    } catch {
      return defaults;
    }
  }

  return defaults;
}

export function getLessonKeyForId(lessonId: number, lessonMap: Record<string, number>): string | undefined {
  return Object.entries(lessonMap).find(([, id]) => id === lessonId)?.[0];
}
