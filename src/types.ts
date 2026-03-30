export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  photoURL?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Animation' | 'Video Production' | 'Authoring Tools' | 'Audio Production';
  teacherId: string;
  teacherName: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  content: string;
  type: 'video' | 'audio' | 'document' | 'text';
  fileUrl?: string;
  order: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  progress: number; // 0 to 100
}

export interface Progress {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}
