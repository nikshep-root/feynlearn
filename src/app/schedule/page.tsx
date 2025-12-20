'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Brain,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Bell,
    BellOff,
    Play,
    AlertTriangle,
    CheckCircle,
    Zap,
    TrendingUp,
    Target,
    Flame,
    Settings
} from 'lucide-react';

// Mock review schedule data
const mockSchedule = {
    today: [
        { id: '1', topic: 'Cellular Respiration', subject: 'Biology', mastery: 35, lastReviewed: '5 days ago', priority: 'high', scheduledTime: '10:00 AM' },
        { id: '2', topic: 'Thermodynamics', subject: 'Physics', mastery: 42, lastReviewed: '1 week ago', priority: 'high', scheduledTime: '2:00 PM' },
    ],
    tomorrow: [
        { id: '3', topic: 'Calculus Integration', subject: 'Mathematics', mastery: 28, lastReviewed: '3 days ago', priority: 'high', scheduledTime: '9:00 AM' },
        { id: '4', topic: 'Organic Chemistry', subject: 'Chemistry', mastery: 55, lastReviewed: '4 days ago', priority: 'medium', scheduledTime: '3:00 PM' },
    ],
    thisWeek: [
        { id: '5', topic: 'French Revolution', subject: 'History', mastery: 72, lastReviewed: '2 weeks ago', priority: 'low', scheduledTime: 'Dec 22' },
        { id: '6', topic: 'DNA Replication', subject: 'Biology', mastery: 65, lastReviewed: '10 days ago', priority: 'medium', scheduledTime: 'Dec 23' },
        { id: '7', topic: 'Electric Circuits', subject: 'Physics', mastery: 48, lastReviewed: '1 week ago', priority: 'medium', scheduledTime: 'Dec 24' },
        { id: '8', topic: 'World War I', subject: 'History', mastery: 80, lastReviewed: '3 weeks ago', priority: 'low', scheduledTime: 'Dec 25' },
    ],
    completed: [
        { id: '9', topic: 'Photosynthesis', subject: 'Biology', mastery: 85, completedAt: 'Today, 10:30 AM' },
        { id: '10', topic: 'Newton\'s Laws', subject: 'Physics', mastery: 78, completedAt: 'Yesterday' },
        { id: '11', topic: 'Quadratic Equations', subject: 'Mathematics', mastery: 88, completedAt: '2 days ago' },
    ]
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
    const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getMasteryColor = (mastery: number) => {
        if (mastery >= 80) return 'text-green-400';
        if (mastery >= 60) return 'text-amber-400';
        if (mastery >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    // Generate calendar days for current week
    const today = new Date();
    const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);
        return {
            day: weekDays[date.getDay()],
            date: date.getDate(),
            isToday: date.toDateString() === today.toDateString(),
            hasReview: i === today.getDay() || i === today.getDay() + 1 || i === today.getDay() + 2,
        };
    });

    const totalDue = mockSchedule.today.length + mockSchedule.tomorrow.length;
    const avgMastery = Math.round(
        [...mockSchedule.today, ...mockSchedule.tomorrow, ...mockSchedule.thisWeek]
            .reduce((a, b) => a + b.mastery, 0) /
        (mockSchedule.today.length + mockSchedule.tomorrow.length + mockSchedule.thisWeek.length)
    );

    return (
        <div className="min-h-screen p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex-center">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Review Schedule</h1>
                            <p className="text-secondary">Spaced repetition for better retention</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`btn btn-secondary btn-sm ${notificationsEnabled ? '' : 'opacity-50'}`}
                        >
                            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            {notificationsEnabled ? 'Reminders On' : 'Reminders Off'}
                        </button>
                        <button className="btn btn-ghost btn-sm">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Week Calendar */}
            <div className="max-w-5xl mx-auto mb-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-semibold">December 2024</h3>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {currentWeekDays.map((day, i) => (
                            <div
                                key={i}
                                className={`text-center p-3 rounded-xl transition-all cursor-pointer ${day.isToday
                                        ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                                        : 'hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-xs text-secondary mb-1">{day.day}</div>
                                <div className="font-semibold">{day.date}</div>
                                {day.hasReview && (
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mx-auto mt-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Due Today', value: mockSchedule.today.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
                    { label: 'Due Tomorrow', value: mockSchedule.tomorrow.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
                    { label: 'Avg Mastery', value: `${avgMastery}%`, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/20' },
                    { label: 'Completed', value: mockSchedule.completed.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
                ].map((stat) => (
                    <div key={stat.label} className="card p-4">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-secondary">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                    {(['upcoming', 'completed'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${selectedTab === tab
                                    ? 'bg-purple-500 text-white'
                                    : 'text-secondary hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto space-y-8">
                {selectedTab === 'upcoming' ? (
                    <>
                        {/* Today's Reviews */}
                        {mockSchedule.today.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-5 h-5 text-red-400" />
                                    <h2 className="text-lg font-semibold">Due Today</h2>
                                    <span className="badge bg-red-500/20 text-red-400 border-red-500/30">
                                        {mockSchedule.today.length} topics
                                    </span>
                                </div>
                                <div className="grid gap-4">
                                    {mockSchedule.today.map((item) => (
                                        <div key={item.id} className="card hover:border-red-500/50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex-center">
                                                        <Brain className="w-6 h-6 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{item.topic}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-secondary">
                                                            <span className="badge">{item.subject}</span>
                                                            <span>Last: {item.lastReviewed}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {item.scheduledTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className={`text-xl font-bold ${getMasteryColor(item.mastery)}`}>
                                                            {item.mastery}%
                                                        </div>
                                                        <div className="text-xs text-secondary">Mastery</div>
                                                    </div>
                                                    <span className={`badge ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                    <Link href={`/session/${item.id}`} className="btn btn-primary btn-sm">
                                                        <Play className="w-4 h-4" />
                                                        Review
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tomorrow's Reviews */}
                        {mockSchedule.tomorrow.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    <h2 className="text-lg font-semibold">Tomorrow</h2>
                                    <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">
                                        {mockSchedule.tomorrow.length} topics
                                    </span>
                                </div>
                                <div className="grid gap-4">
                                    {mockSchedule.tomorrow.map((item) => (
                                        <div key={item.id} className="card hover:border-amber-500/50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex-center">
                                                        <Brain className="w-6 h-6 text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{item.topic}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-secondary">
                                                            <span className="badge">{item.subject}</span>
                                                            <span>Last: {item.lastReviewed}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {item.scheduledTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className={`text-xl font-bold ${getMasteryColor(item.mastery)}`}>
                                                            {item.mastery}%
                                                        </div>
                                                        <div className="text-xs text-secondary">Mastery</div>
                                                    </div>
                                                    <span className={`badge ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                    <button className="btn btn-secondary btn-sm" disabled>
                                                        <Clock className="w-4 h-4" />
                                                        Scheduled
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* This Week */}
                        {mockSchedule.thisWeek.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    <h2 className="text-lg font-semibold">This Week</h2>
                                    <span className="badge badge-primary">
                                        {mockSchedule.thisWeek.length} topics
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    {mockSchedule.thisWeek.map((item) => (
                                        <div key={item.id} className="card p-4 hover:border-purple-500/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Brain className="w-5 h-5 text-purple-400" />
                                                    <div>
                                                        <span className="font-medium">{item.topic}</span>
                                                        <span className="text-secondary mx-2">•</span>
                                                        <span className="text-sm text-secondary">{item.subject}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`font-semibold ${getMasteryColor(item.mastery)}`}>
                                                        {item.mastery}%
                                                    </span>
                                                    <span className="text-sm text-secondary">{item.scheduledTime}</span>
                                                    <span className={`badge ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Completed Reviews */
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <h2 className="text-lg font-semibold">Recently Completed</h2>
                        </div>
                        <div className="grid gap-4">
                            {mockSchedule.completed.map((item) => (
                                <div key={item.id} className="card opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex-center">
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{item.topic}</h3>
                                                <div className="text-sm text-secondary">
                                                    {item.subject} • Completed {item.completedAt}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <div className={`text-xl font-bold ${getMasteryColor(item.mastery)}`}>
                                                    {item.mastery}%
                                                </div>
                                                <div className="text-xs text-secondary">Mastery</div>
                                            </div>
                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Spaced Repetition Info */}
            <div className="max-w-5xl mx-auto mt-8">
                <div className="card bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex-center shrink-0">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">How Spaced Repetition Works</h3>
                            <p className="text-sm text-secondary">
                                Topics you struggle with are scheduled more frequently, while mastered topics appear less often.
                                This scientifically-proven method helps you retain information longer by reviewing at optimal intervals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
