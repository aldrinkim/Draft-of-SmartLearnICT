/**
 * Mock Firebase implementation for SmartLearnICT.
 * This can be swapped with real Firebase when provisioning is successful.
 */

import { UserRole, UserProfile, Course, Module, Lesson, Enrollment, Progress } from './types';

// Mock Auth State
let currentUser: UserProfile | null = null;
const authListeners: ((user: UserProfile | null) => void)[] = [];

// Mock Database (using localStorage)
const DB_KEY = 'smartlearn_ict_db';
const getDB = () => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : {
    users: [],
    courses: [],
    modules: [],
    lessons: [],
    enrollments: [],
    progress: []
  };
};

const saveDB = (db: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Seed initial data if empty
const seedData = () => {
  const db = getDB();
  if (db.courses.length === 0) {
    db.courses = [
      {
        id: 'c1',
        title: 'Introduction to 2D Animation',
        description: 'Learn the principles of animation and create your first 2D character.',
        category: 'Animation',
        teacherId: 't1',
        teacherName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'c2',
        title: 'Professional Video Editing',
        description: 'Master Premiere Pro and DaVinci Resolve for high-end video production.',
        category: 'Video Production',
        teacherId: 't1',
        teacherName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    db.modules = [
      { id: 'm1', courseId: 'c1', title: 'The 12 Principles of Animation', order: 1 },
      { id: 'm2', courseId: 'c1', title: 'Character Design Basics', order: 2 }
    ];
    db.lessons = [
      { id: 'l1', moduleId: 'm1', courseId: 'c1', title: 'Squash and Stretch', content: 'Lesson content here...', type: 'video', order: 1 },
      { id: 'l2', moduleId: 'm1', courseId: 'c1', title: 'Anticipation', content: 'Lesson content here...', type: 'video', order: 2 }
    ];
    saveDB(db);
  }
};

seedData();

export const auth = {
  get currentUser() { return currentUser; },
  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => {
    authListeners.push(callback);
    callback(currentUser);
    return () => {
      const index = authListeners.indexOf(callback);
      if (index > -1) authListeners.splice(index, 1);
    };
  },
  signIn: async (email: string, password: string): Promise<UserProfile> => {
    const db = getDB();
    const user = db.users.find((u: any) => u.email === email);
    if (!user) throw new Error('User not found');
    currentUser = user;
    authListeners.forEach(cb => cb(currentUser));
    return user;
  },
  signUp: async (email: string, password: string, displayName: string, role: UserRole): Promise<UserProfile> => {
    const db = getDB();
    if (db.users.find((u: any) => u.email === email)) throw new Error('Email already exists');
    const newUser: UserProfile = {
      uid: Math.random().toString(36).substr(2, 9),
      email,
      displayName,
      role,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);
    currentUser = newUser;
    authListeners.forEach(cb => cb(currentUser));
    return newUser;
  },
  signOut: async () => {
    currentUser = null;
    authListeners.forEach(cb => cb(currentUser));
  },
  signInAdmin: async (username: string, password: string): Promise<UserProfile> => {
    if (username === 'adminsmartlearnict' && password === 'smartlearnict_admin') {
      const adminUser: UserProfile = {
        uid: 'admin-123',
        email: 'admin@smartlearnict.com',
        displayName: 'System Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      currentUser = adminUser;
      authListeners.forEach(cb => cb(currentUser));
      return adminUser;
    }
    throw new Error('Invalid admin credentials');
  }
};

export const db = {
  users: {
    getAll: async () => getDB().users,
    update: async (uid: string, data: Partial<UserProfile>) => {
      const db = getDB();
      const index = db.users.findIndex((u: any) => u.uid === uid);
      if (index > -1) {
        db.users[index] = { ...db.users[index], ...data };
        saveDB(db);
      }
    },
    delete: async (uid: string) => {
      const db = getDB();
      db.users = db.users.filter((u: any) => u.uid !== uid);
      saveDB(db);
    }
  },
  courses: {
    getAll: async () => getDB().courses,
    getById: async (id: string) => getDB().courses.find((c: any) => c.id === id),
    create: async (data: Omit<Course, 'id'>) => {
      const db = getDB();
      const newCourse = { ...data, id: Math.random().toString(36).substr(2, 9) };
      db.courses.push(newCourse);
      saveDB(db);
      return newCourse;
    },
    update: async (id: string, data: Partial<Course>) => {
      const db = getDB();
      const index = db.courses.findIndex((c: any) => c.id === id);
      if (index > -1) {
        db.courses[index] = { ...db.courses[index], ...data };
        saveDB(db);
      }
    },
    delete: async (id: string) => {
      const db = getDB();
      db.courses = db.courses.filter((c: any) => c.id !== id);
      saveDB(db);
    }
  },
  modules: {
    getByCourseId: async (courseId: string) => getDB().modules.filter((m: any) => m.courseId === courseId),
    create: async (data: Omit<Module, 'id'>) => {
      const db = getDB();
      const newModule = { ...data, id: Math.random().toString(36).substr(2, 9) };
      db.modules.push(newModule);
      saveDB(db);
      return newModule;
    }
  },
  lessons: {
    getByModuleId: async (moduleId: string) => getDB().lessons.filter((l: any) => l.moduleId === moduleId),
    create: async (data: Omit<Lesson, 'id'>) => {
      const db = getDB();
      const newLesson = { ...data, id: Math.random().toString(36).substr(2, 9) };
      db.lessons.push(newLesson);
      saveDB(db);
      return newLesson;
    }
  },
  enrollments: {
    getByStudentId: async (studentId: string) => getDB().enrollments.filter((e: any) => e.studentId === studentId),
    enroll: async (studentId: string, courseId: string) => {
      const db = getDB();
      if (db.enrollments.find((e: any) => e.studentId === studentId && e.courseId === courseId)) return;
      const newEnrollment: Enrollment = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0
      };
      db.enrollments.push(newEnrollment);
      saveDB(db);
      return newEnrollment;
    }
  }
};
