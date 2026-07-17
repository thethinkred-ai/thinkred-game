import React from 'react';

const LESSON_LABELS: Record<string, string> = {
  lesson_1: 'Урок 1: Товар и стоимость',
  lesson_2: 'Урок 2: Торговый капитал',
  lesson_3: 'Урок 3: Фабричное производство',
  lesson_4: 'Урок 4: Добыча сырья',
  lesson_5: 'Урок 5: Машинное производство',
  lesson_6: 'Урок 6: Монополии',
  lesson_7: 'Урок 7: Империализм',
  lesson_8: 'Урок 8: Глобализация',
};

interface LessonGateBadgeProps {
  requiredLessons: string[];
  completedLessons: string[];
}

export const LessonGateBadge: React.FC<LessonGateBadgeProps> = ({
  requiredLessons,
  completedLessons,
}) => {
  const missing = requiredLessons.filter((l) => !completedLessons.includes(l));
  if (missing.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {missing.map((lesson) => (
        <span
          key={lesson}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30"
        >
          🔒 {LESSON_LABELS[lesson] || lesson}
        </span>
      ))}
    </div>
  );
};

export { LESSON_LABELS };
