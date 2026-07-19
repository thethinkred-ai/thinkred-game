import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { LESSON_LABELS } from './LessonGateBadge';

interface StepikLesson {
  id: number;
  title: string;
  progress?: string;
  sectionId?: number;
  position?: number;
}

interface StepikSection {
  id: number;
  title: string;
  position: number;
}

interface StepikCoursePanelProps {
  completedLessons: string[];
}

export const StepikCoursePanel: React.FC<StepikCoursePanelProps> = ({ completedLessons }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [sections, setSections] = useState<StepikSection[]>([]);
  const [lessons, setLessons] = useState<StepikLesson[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getStepikCourse();
        setCourseTitle(data.course?.title ?? 'Курс ThinkRed');
        setSections(data.sections ?? []);
        setLessons(data.lessons ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить курс Stepik');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Stepik</h2>
        </div>
        <p className="text-sm text-slate-400 px-4 pb-4">
          {error}. Войдите через Stepik OAuth или используйте демо-режим для локальной разработки.
        </p>
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Пройденные уроки (игра)</h3>
          <div className="flex flex-wrap gap-2">
            {completedLessons.length === 0 ? (
              <span className="text-xs text-slate-500">Нет пройденных уроков</span>
            ) : (
              completedLessons.map((key) => (
                <span key={key} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ {LESSON_LABELS[key] || key}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const lessonProgress = (lesson: StepikLesson) => {
    const key = Object.entries(LESSON_LABELS).find(([, label]) =>
      lesson.title.toLowerCase().includes(label.split(':')[1]?.trim().toLowerCase() ?? '')
    )?.[0];
    if (key && completedLessons.includes(key)) return 'passed';
    return lesson.progress ?? 'not_started';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Курс Stepik: {courseTitle}</h2>
        <p className="text-sm text-slate-400">Синхронизация прогресса с обучением</p>
      </div>

      {sections.length === 0 && lessons.length === 0 ? (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-slate-400">
            Настройте STEPIK_COURSE_ID в server/.env для отображения структуры курса.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(LESSON_LABELS).map((key) => (
              <span
                key={key}
                className={`text-xs px-2 py-1 rounded border ${
                  completedLessons.includes(key)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-800/50 text-slate-500 border-slate-700'
                }`}
              >
                {completedLessons.includes(key) ? '✓' : '○'} {LESSON_LABELS[key]}
              </span>
            ))}
          </div>
        </div>
      ) : sections.length === 0 ? (
        <div className="space-y-2 px-4 pb-4">
          {lessons.map((lesson) => {
            const status = lessonProgress(lesson);
            return (
              <div key={lesson.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-slate-300">{lesson.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    status === 'passed' || status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {status === 'passed' || status === 'completed' ? 'Пройден' : 'Не пройден'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 px-4 pb-4">
          {sections
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <div key={section.id} className="border border-slate-800/60 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{section.title}</h3>
                <div className="space-y-1">
                  {lessons
                    .filter((lesson) => lesson.sectionId === section.id)
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((lesson) => {
                      const status = lessonProgress(lesson);
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-slate-300">{lesson.title}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              status === 'passed' || status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {status === 'passed' || status === 'completed' ? 'Пройден' : 'Не пройден'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
