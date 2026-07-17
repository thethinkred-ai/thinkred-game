export interface StepikUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  level: string;
  join_date: string;
  last_login: string;
  city: string;
  country: string;
}

export interface StepikCourse {
  id: number;
  title: string;
  summary: string;
  workload: string;
  certificate: string;
  certificate_distinction: string;
  is_certificate_auto_issued: boolean;
  is_active: boolean;
  is_contest: boolean;
  progress: string;
  learners_count: number;
  readiness: number;
  sections_count: number;
  lessons_count: number;
  steps_count: number;
}

export interface StepikLesson {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_url: string;
  is_public: boolean;
  is_featured: boolean;
  progress: string;
  steps_count: number;
  course: number;
  position: number;
  create_date: string;
  update_date: string;
}

export interface StepikStep {
  id: number;
  lesson: number;
  position: number;
  status: string;
  block: StepBlock;
  create_date: string;
  update_date: string;
  discussions_count: number;
  has_submissions: boolean;
  review: string;
}

export interface StepBlock {
  name: string;
  text: string;
  video?: VideoBlock;
  options?: OptionsBlock;
}

export interface VideoBlock {
  url: string;
  thumbnail: string;
  duration: number;
}

export interface OptionsBlock {
  options: string[];
  is_multiple_choice: boolean;
  is_text_enabled: boolean;
}

export interface StepikProgress {
  id: number;
  user: number;
  course: number;
  last_viewed: string;
  score: number;
  cost: number;
  is_passed: boolean;
  is_enrolled: boolean;
  certificate: string;
}

export interface GameProgress {
  userId: number;
  stepikProgress: {
    completedLessons: string[];
    completedSteps: number[];
    currentLesson: number;
    totalScore: number;
  };
  gameProgress: {
    currentPeriod: string;
    unlockedFeatures: string[];
    enterprises: string[];
    decisions: string[];
    achievements: string[];
    level: number;
    experience: number;
  };
  economicUnderstanding: {
    concepts: Record<string, number>;
    practicalSkills: Record<string, number>;
    criticalThinking: number;
  };
}

export interface StepikIntegration {
  authenticate(code: string): Promise<StepikUser>;
  getProgress(userId: number): Promise<StepikProgress>;
  updateProgress(userId: number, progress: GameProgress): Promise<void>;
  checkLessonAccess(userId: number, lessonId: number): Promise<boolean>;
  getCourseStructure(courseId: number): Promise<StepikCourse>;
  getLessons(courseId: number): Promise<StepikLesson[]>;
  getSteps(lessonId: number): Promise<StepikStep[]>;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  lessons: number[];
  requiredGameLevel: number;
  unlocksGameFeatures: string[];
  estimatedDuration: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'learning' | 'economic' | 'social' | 'political';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
}

export interface AchievementRequirement {
  type: 'lesson_complete' | 'step_complete' | 'decision_correct' | 'enterprise_profit' | 'crisis_avoided';
  value: number;
  target: string;
}

export interface AchievementReward {
  type: 'experience' | 'feature_unlock' | 'enterprise_type' | 'economic_model';
  value: number | string;
}
