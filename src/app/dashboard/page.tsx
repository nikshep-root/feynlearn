'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useUserProfile, useSessions, useNotifications } from '@/hooks/useUserData';
import {
    Brain,
    Upload,
    Trophy,
    Flame,
    Target,
    BookOpen,
    ChevronRight,
    Plus,
    Clock,
    Star,
    TrendingUp,
    Settings,
    LogOut,
    Bell,
    Search,
    Zap,
    Loader2,
    Award,
    CheckCircle,
    BarChart3,
    Sparkles,
    Menu,
    X,
    GraduationCap,
    MessageSquare,
    BookMarked,
    Lightbulb
} from 'lucide-react';

// Mock Learn First sessions - In production, this would come from a hook
interface LearnFirstSession {
    id: string;
    title: string;
    createdAt: string;
    flashcardsCount: number;
    sectionsCount: number;
    studyDuration: number;
    startedTeaching: boolean;
}

export default function DashboardPage() {
    const { profile, loading: profileLoading } = useUserProfile();
    const { sessions, loading: sessionsLoading } = useSessions(true, 5);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Mock Learn First sessions - Replace with real data from Firestore
    const [learnFirstSessions] = useState<LearnFirstSession[]>([]);

    const isLoading = profileLoading || sessionsLoading;

    // Calculate user stats
    const nextLevelXp = ((profile?.level || 1) + 1) * 500;
    const xpProgress = profile?.xp ? (profile.xp % 500) / 500 * 100 : 0;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgScore = completedSessions.length > 0 
        ? Math.round(completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length)
        : 0;

    // Learn First stats
    const totalLearnFirstSessions = learnFirstSessions.length;
    const totalFlashcards = learnFirstSessions.reduce((sum, s) => sum + s.flashcardsCount, 0);
    const totalStudyTime = learnFirstSessions.reduce((sum, s) => sum + s.studyDuration, 0);
    const learnFirstToTeaching = learnFirstSessions.filter(s => s.startedTeaching).length;

    // Talk Through stats
    const totalTalkThroughSessions = sessions.length;

    // Weekly activity data (actual current week)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the start of the current week (Monday)
    const startOfWeek = new Date(today);
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyActivity = weekDays.map((_, i) => {
        // Calculate the date for this day of the week
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + i);
        const targetDateStr = targetDate.toDateString();
        
        const daysSessions = sessions.filter(s => {
            const sessionDate = new Date(s.createdAt);
            return sessionDate.toDateString() === targetDateStr;
        });
        const daysLearnFirst = learnFirstSessions.filter(s => {
            const sessionDate = new Date(s.createdAt);
            return sessionDate.toDateString() === targetDateStr;
        });
        return Math.min(100, (daysSessions.length + daysLearnFirst.length) * 25);
    });

    // Achievements
    const achievements = [
        { id: 1, name: 'First Steps', icon: '🎯', desc: 'Complete your first session', unlocked: (profile?.totalSessions || 0) >= 1 },
        { id: 2, name: 'On Fire', icon: '🔥', desc: '3 day streak', unlocked: (profile?.streak || 0) >= 3 },
        { id: 3, name: 'Scholar', icon: '📚', desc: 'Complete 10 sessions', unlocked: (profile?.totalSessions || 0) >= 10 },
        { id: 4, name: 'Master', icon: '👑', desc: 'Reach Level 5', unlocked: (profile?.level || 1) >= 5 },
    ];

    // Daily goal (2 sessions per day - both types combined)
    const todayStr = today.toDateString();
    const todayTalkThrough = sessions.filter(s => {
        const sessionDate = new Date(s.createdAt);
        return sessionDate.toDateString() === todayStr;
    }).length;
    const todayLearnFirst = learnFirstSessions.filter(s => {
        const sessionDate = new Date(s.createdAt);
        return sessionDate.toDateString() === todayStr;
    }).length;
    const todaySessions = todayTalkThrough + todayLearnFirst;
    const dailyGoal = 2;
    const goalProgress = Math.min(100, (todaySessions / dailyGoal) * 100);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-secondary">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative w-64 h-full glass border-r border-white/10 p-6 flex flex-col z-50 transition-transform lg:translate-x-0 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Mobile Close Button */}
                <button onClick={() => setShowMobileMenu(false)} className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold">FeynLearn</span>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {[
                        { icon: Target, label: 'Dashboard', href: '/dashboard', active: true },
                        { icon: GraduationCap, label: 'Learn First', href: '/learn' },
                        { icon: Upload, label: 'Talk Through', href: '/upload' },
                        { icon: BookOpen, label: 'My Sessions', href: '/sessions' },
                        { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setShowMobileMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'text-secondary hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User Menu */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-white/5 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                    <button 
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-white/5 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto lg:ml-0">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button onClick={() => setShowMobileMenu(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                                Welcome back, {profile?.name?.split(' ')[0] || 'there'}! 👋
                            </h1>
                            <p className="text-secondary">Ready to teach and master new concepts?</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search - Hidden on mobile */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-10 w-48 lg:w-64"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-3 rounded-xl glass glass-hover"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-14 w-80 card p-0 z-50 shadow-xl">
                                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                                        <h3 className="font-semibold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={markAllAsRead}
                                                className="text-sm text-purple-400 hover:text-purple-300"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-secondary">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.slice(0, 5).map((notif) => (
                                                <div 
                                                    key={notif.id}
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 ${!notif.read ? 'bg-purple-500/10' : ''}`}
                                                >
                                                    <div className="font-medium text-sm">{notif.title}</div>
                                                    <div className="text-xs text-secondary mt-1">{notif.message}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Avatar */}
                        <Link href="/settings" className="avatar">
                            {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </Link>
                    </div>
                </header>

                {/* Daily Goal Banner */}
                <div className="card mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Daily Goal</h3>
                                <p className="text-sm text-secondary">{todaySessions}/{dailyGoal} sessions today</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 lg:w-48">
                                <div className="progress h-3">
                                    <div className="progress-bar" style={{ width: `${goalProgress}%` }} />
                                </div>
                            </div>
                            {goalProgress >= 100 ? (
                                <span className="badge badge-success flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Complete!
                                </span>
                            ) : (
                                <Link href="/upload" className="btn btn-primary btn-sm">
                                    <Sparkles className="w-4 h-4" />
                                    Start Session
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* XP & Level */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex-center">
                                <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="badge badge-primary text-xs">Lvl {profile?.level || 1}</div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{(profile?.xp || 0).toLocaleString()}</div>
                        <div className="text-xs text-secondary mb-2">Experience Points</div>
                        <div className="progress h-1.5">
                            <div className="progress-bar" style={{ width: `${xpProgress}%` }} />
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex-center">
                                <Flame className="w-5 h-5 text-orange-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{profile?.streak || 0}</div>
                        <div className="text-xs text-secondary">Day Streak 🔥</div>
                    </div>

                    {/* Learn First Sessions */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex-center">
                                <GraduationCap className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{totalLearnFirstSessions}</div>
                        <div className="text-xs text-secondary">Learn First Sessions</div>
                    </div>

                    {/* Talk Through Sessions */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex-center">
                                <MessageSquare className="w-5 h-5 text-cyan-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{totalTalkThroughSessions}</div>
                        <div className="text-xs text-secondary">Talk Through Sessions</div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Sessions */}
                    <div className="card bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex-center">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold">{(profile?.totalSessions || 0) + totalLearnFirstSessions}</div>
                                <div className="text-xs text-secondary">Total Sessions</div>
                            </div>
                        </div>
                    </div>

                    {/* Average Score */}
                    <div className="card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex-center">
                                <Star className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold">{avgScore}%</div>
                                <div className="text-xs text-secondary">Avg. Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Flashcards Created */}
                    <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex-center">
                                <BookMarked className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold">{totalFlashcards}</div>
                                <div className="text-xs text-secondary">Flashcards</div>
                            </div>
                        </div>
                    </div>

                    {/* Study Time */}
                    <div className="card bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex-center">
                                <Clock className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold">{totalStudyTime}</div>
                                <div className="text-xs text-secondary">Mins Studied</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    {/* Weekly Activity */}
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                Weekly Activity
                            </h3>
                            <span className="text-sm text-secondary">This Week</span>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-32">
                            {weekDays.map((day, i) => (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-white/10 rounded-t-lg relative" style={{ height: '100%' }}>
                                        <div 
                                            className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t-lg transition-all"
                                            style={{ height: `${weeklyActivity[i]}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-secondary">{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                Achievements
                            </h3>
                            <span className="text-sm text-secondary">
                                {achievements.filter(a => a.unlocked).length}/{achievements.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((achievement) => (
                                <div 
                                    key={achievement.id}
                                    className={`p-3 rounded-xl text-center transition-all ${
                                        achievement.unlocked 
                                            ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30' 
                                            : 'bg-white/5 opacity-50'
                                    }`}
                                    title={achievement.desc}
                                >
                                    <div className="text-2xl mb-1">{achievement.icon}</div>
                                    <div className="text-xs font-medium truncate">{achievement.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Learn First CTA */}
                    <Link href="/learn" className="card group cursor-pointer p-6 lg:p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold">Learn First</h2>
                                <p className="text-sm text-secondary">Study with AI-generated notes & flashcards</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-secondary">
                                <span className="flex items-center gap-1">
                                    <BookMarked className="w-4 h-4" />
                                    Notes
                                </span>
                                <span className="flex items-center gap-1">
                                    <Lightbulb className="w-4 h-4" />
                                    Flashcards
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400 font-semibold">
                                Start Learning
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Talk Through CTA */}
                    <Link href="/upload" className="card gradient-border group cursor-pointer p-6 lg:p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold">Talk Through</h2>
                                <p className="text-sm text-secondary">Teach an AI student to master concepts</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-secondary">
                                <span className="flex items-center gap-1">
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </span>
                                <span className="flex items-center gap-1">
                                    <Brain className="w-4 h-4" />
                                    Teach
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                Start Teaching
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Topics to Review */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                            Topics to Review
                        </h3>
                        <Link href="/sessions" className="text-sm text-purple-400 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {sessions.filter(s => s.score < 70).length === 0 ? (
                            <div className="text-center py-4 text-secondary">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                                <p className="text-sm">Great job! No topics need review.</p>
                            </div>
                        ) : (
                            sessions.filter(s => s.score < 70).slice(0, 3).map((session) => (
                                <Link href={`/session/${session.id}`} key={session.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="font-medium text-sm">{session.topic}</div>
                                        <div className="text-xs text-secondary">Score: {session.score}%</div>
                                    </div>
                                    <Zap className="w-5 h-5 text-amber-500" />
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Learn First */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-green-400" />
                                Recent Learn First
                            </h3>
                            <Link href="/sessions" className="text-sm text-green-400 hover:underline">View All</Link>
                        </div>
                        {learnFirstSessions.length === 0 ? (
                            <div className="text-center py-6 text-secondary">
                                <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm mb-3">No study sessions yet</p>
                                <Link href="/learn" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                    <GraduationCap className="w-4 h-4" />
                                    Start Learning
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {learnFirstSessions.slice(0, 3).map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex-center">
                                                <BookMarked className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{session.title}</div>
                                                <div className="text-xs text-secondary">
                                                    {session.flashcardsCount} flashcards • {session.studyDuration} min
                                                </div>
                                            </div>
                                        </div>
                                        {session.startedTeaching ? (
                                            <span className="badge bg-green-500/20 text-green-400 text-xs">Teaching</span>
                                        ) : (
                                            <span className="badge bg-amber-500/20 text-amber-400 text-xs">Studying</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Talk Through */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                Recent Talk Through
                            </h3>
                            <Link href="/sessions" className="text-sm text-purple-400 hover:underline">View All</Link>
                        </div>
                        {sessions.length === 0 ? (
                            <div className="text-center py-6 text-secondary">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm mb-3">No teaching sessions yet</p>
                                <Link href="/upload" className="btn btn-primary btn-sm">
                                    <Plus className="w-4 h-4" />
                                    Start Teaching
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.slice(0, 3).map((session) => (
                                    <Link href={`/session/${session.id}`} key={session.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex-center">
                                                <Brain className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{session.topic}</div>
                                                <div className="text-xs text-secondary">
                                                    <span className="badge text-xs mr-2">{session.subject}</span>
                                                    {new Date(session.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${session.score >= 80 ? 'text-green-400' : session.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {session.score}%
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
