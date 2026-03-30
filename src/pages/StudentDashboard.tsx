import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { Course, Enrollment } from '../types';
import { Home, BookOpen, User, Search, LogOut, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allCourses = await db.courses.getAll();
        const userEnrollments = await db.enrollments.getByStudentId(user?.uid || '');
        setCourses(allCourses);
        setEnrollments(userEnrollments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const enrolledCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id));
  const availableCourses = courses.filter(c => !enrollments.some(e => e.courseId === c.id));

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    await db.enrollments.enroll(user.uid, courseId);
    const userEnrollments = await db.enrollments.getByStudentId(user.uid);
    setEnrollments(userEnrollments);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hello, {user?.displayName.split(' ')[0]}!</h1>
            <p className="text-xs text-gray-500">Ready to learn something new today?</p>
          </div>
          <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {activeTab === 'home' && (
          <>
            {/* Progress Overview */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
                  <p className="text-xs opacity-80 mb-1">Enrolled Courses</p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Completed Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </section>

            {/* Enrolled Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
                <button className="text-sm text-indigo-600 font-medium">View All</button>
              </div>
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <motion.div 
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-indigo-200 transition-all"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${course.id}/200`} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">{course.category}</p>
                        <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{course.title}</h3>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full w-1/3 rounded-full" />
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">You haven't enrolled in any courses yet.</p>
                </div>
              )}
            </section>

            {/* Recommended Courses */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended for You</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {availableCourses.map(course => (
                  <motion.div 
                    key={course.id}
                    whileHover={{ y: -4 }}
                    className="flex-shrink-0 w-64 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      <img src={`https://picsum.photos/seed/${course.id}/400/225`} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-gray-900">
                        {course.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10">{course.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">By {course.teacherName}</span>
                        <button 
                          onClick={() => handleEnroll(course.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'search' && (
          <section>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search courses, topics, or teachers..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Animation', 'Video', 'Audio', 'Authoring'].map(cat => (
                <button key={cat} className="p-4 bg-white rounded-2xl border border-gray-100 text-center hover:border-indigo-200 transition-all">
                  <span className="text-sm font-bold text-gray-900">{cat}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.displayName}</h2>
            <p className="text-sm text-gray-500 mb-8">{user?.email}</p>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Account Settings</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Certificates</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Help & Support</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t px-6 py-3 flex items-center justify-between z-20">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'courses', icon: BookOpen, label: 'My Learning' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === tab.id ? "text-indigo-600" : "text-gray-400"
            )}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
