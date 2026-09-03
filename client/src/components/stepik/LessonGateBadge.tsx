import React from 'react';
import { getLessonLabel, LESSON_LABELS } from '../../../../shared/constants/stepikLessons';

export { LESSON_LABELS, getLessonLabel };

interface LessonGateBadgeProps {
  requiredLessons: string[];
  completedLessons: string[];
  lessonUrls?: Record<string, string>;
}

export const LessonGateBadge: React.FC<LessonGateBadgeProps> = ({
  requiredLessons,
  completedLessons,
  lessonUrls = {},
}) => {
  const missing = requiredLessons.filter((l) => !completedLessons.includes(l));
  if (missing.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {missing.map((lesson) => {
        const label = getLessonLabel(lesson);
        const url = lessonUrls[lesson];
        return (
          <span
            key={lesson}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30"
          >
            🔒{' '}
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 underline">
                {label}
              </a>
            ) : (
              label
            )}
          </span>
        );
      })}
    </div>
  );
};
