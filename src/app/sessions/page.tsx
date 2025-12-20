'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Brain,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Search,
    Clock,
    Star,
    TrendingUp,
    Calendar,
    Play,
    MoreVertical,
    Trash2,
    Share2,
    Loader2,
    FolderOpen,
    GraduationCap,
    MessageSquare,
    BookMarked,
    Zap
} from 'lucide-react';
import { useSessions } from '@/hooks/useUserData';

// For Learn First sessions - in production, this would come from database
interface LearnFirstSession {
    id: string;
    title: string;
    topic: string;
    createdAt: string;
    flashcardsCount: number;
    sectionsCount: number;
    practiceQuestionsCount: number;
    studyDuration: number;
    startedTeaching: boolean;
}

export default function SessionsPage() {
    const { sessions, loading } = useSessions(false, 100);
    const [activeTab, setActiveTab] = useState<'learn-first' | 'talk-through'>('talk-through');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const sessionsPerPage = 10;

    // Mock Learn First sessions - in production, fetch from database
    const [learnFirstSessions] = useState<LearnFirstSession[]>([]);

    // Get unique subjects from sessions
    const subjects = useMemo(() => {
        const uniqueSubjects = new Set(sessions.map(s => s.subject || 'General'));
        return ['All', ...Array.from(uniqueSubjects)];
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const matchesSearch = session.topic.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubject = selectedSubject === 'All' || (session.subject || 'General') === selectedSubject;
            return matchesSearch && matchesSubject;
        });
    }, [sessions, searchQuery, selectedSubject]);

    const filteredLearnFirst = useMemo(() => {
        return learnFirstSessions.filter(session => {
            return session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   session.topic.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [learnFirstSessions, searchQuery]);

    // Pagination
    const currentSessionsList = activeTab === 'talk-through' ? filteredSessions : filteredLearnFirst;
    const totalPages = Math.ceil(currentSessionsList.length / sessionsPerPage);
    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * sessionsPerPage,
        currentPage * sessionsPerPage
    );
    const paginatedLearnFirst = filteredLearnFirst.slice(
        (currentPage - 1) * sessionsPerPage,
        currentPage * sessionsPerPage
    );

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-amber-400';
        if (score >= 60) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreGrade = (score: number) => {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'C+';
        if (score >= 60) return 'C';
        return 'D';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Stats for Talk Through
    const talkThroughStats = {
        total: sessions.length,
        avgScore: sessions.filter(s => s.status === 'completed').length > 0 
            ? Math.round(sessions.filter(s => s.status === 'completed').reduce((a, b) => a + (b.score || 0), 0) / sessions.filter(s => s.status === 'completed').length) 
            : 0,
        totalTime: sessions.reduce((a, b) => a + (b.duration || 0), 0),
        bestScore: sessions.length > 0 ? Math.max(...sessions.map(s => s.score || 0)) : 0
    };

    // Stats for Learn First
    const learnFirstStats = {
        total: learnFirstSessions.length,
        flashcards: learnFirstSessions.reduce((a, b) => a + b.flashcardsCount, 0),
        studyTime: learnFirstSessions.reduce((a, b) => a + b.studyDuration, 0),
        startedTeaching: learnFirstSessions.filter(s => s.startedTeaching).length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-secondary">Loading your sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-4 sm:mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">My Sessions</h1>
                            <p className="text-secondary text-sm sm:text-base">Review your learning and teaching history</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href="/learn" className="btn btn-secondary">
                            <GraduationCap className="w-4 h-4" />
                            Learn First
                        </Link>
                        <Link href="/upload" className="btn btn-primary">
                            <Play className="w-4 h-4" />
                            Talk Through
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                    <button
                        onClick={() => {
                            setActiveTab('learn-first');
                            setCurrentPage(1);
                            setSelectedSession(null);
                        }}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all ${
                            activeTab === 'learn-first'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'text-secondary hover:text-white'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Learn First</span>
                        {learnFirstSessions.length > 0 && (
                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{learnFirstSessions.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('talk-through');
                            setCurrentPage(1);
                            setSelectedSession(null);
                        }}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all ${
                            activeTab === 'talk-through'
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'text-secondary hover:text-white'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Talk Through</span>
                        {sessions.length > 0 && (
                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{sessions.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {activeTab === 'talk-through' ? (
                    <>
                        {[
                            { label: 'Total Sessions', value: talkThroughStats.total, icon: MessageSquare, color: 'text-purple-400' },
                            { label: 'Average Score', value: talkThroughStats.avgScore > 0 ? `${talkThroughStats.avgScore}%` : '-', icon: Star, color: 'text-amber-400' },
                            { label: 'Total Time', value: `${talkThroughStats.totalTime} min`, icon: Clock, color: 'text-cyan-400' },
                            { label: 'Best Score', value: talkThroughStats.bestScore > 0 ? `${talkThroughStats.bestScore}%` : '-', icon: TrendingUp, color: 'text-green-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="card p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                                    <span className="text-xs sm:text-sm text-secondary">{stat.label}</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {[
                            { label: 'Study Sessions', value: learnFirstStats.total, icon: BookMarked, color: 'text-green-400' },
                            { label: 'Flashcards', value: learnFirstStats.flashcards, icon: Zap, color: 'text-amber-400' },
                            { label: 'Study Time', value: `${learnFirstStats.studyTime} min`, icon: Clock, color: 'text-cyan-400' },
                            { label: 'Started Teaching', value: learnFirstStats.startedTeaching, icon: GraduationCap, color: 'text-purple-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="card p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                                    <span className="text-xs sm:text-sm text-secondary">{stat.label}</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                    <input
                        type="text"
                        placeholder={activeTab === 'talk-through' ? "Search teaching sessions..." : "Search study sessions..."}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input pl-10 w-full"
                    />
                </div>

                {activeTab === 'talk-through' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {subjects.map((subject) => (
                            <button
                                key={subject}
                                onClick={() => {
                                    setSelectedSubject(subject);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedSubject === subject
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-secondary hover:bg-white/10'
                                    }`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sessions Grid */}
            <div className="max-w-6xl mx-auto">
                {/* Talk Through Tab */}
                {activeTab === 'talk-through' && (
                    <>
                        {filteredSessions.length === 0 ? (
                            <div className="card p-12 text-center">
                                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-secondary" />
                                <h3 className="text-xl font-semibold mb-2">No teaching sessions found</h3>
                                <p className="text-secondary mb-6">
                                    {sessions.length === 0 
                                        ? "You haven't completed any teaching sessions yet. Start by uploading your notes!"
                                        : "No sessions match your search criteria."}
                                </p>
                                <Link href="/upload" className="btn btn-primary">
                                    <Play className="w-4 h-4" />
                                    Start Talk Through
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:gap-4">
                                {paginatedSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="card hover:border-purple-500/50 cursor-pointer transition-all"
                                        onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id!)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Main Info */}
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex-center shrink-0">
                                                    <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{session.topic}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-secondary">
                                                        <span className="badge">{session.subject || 'General'}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            {formatDate(session.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            {session.duration || 0} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                                                <div className="text-center sm:text-right">
                                                    {session.status === 'completed' ? (
                                                        <>
                                                            <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(session.score || 0)}`}>
                                                                {session.score || 0}%
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-secondary">
                                                                Grade: <span className={getScoreColor(session.score || 0)}>{getScoreGrade(session.score || 0)}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="badge bg-amber-500/20 text-amber-400">
                                                            {session.status === 'in-progress' ? 'In Progress' : 'Abandoned'}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="w-5 h-5 text-secondary" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {selectedSession === session.id && session.status === 'completed' && (
                                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                                                {/* Score Breakdown */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                                    {[
                                                        { label: 'Questions', value: session.questionsAnswered || 0, max: 7 },
                                                        { label: 'XP Earned', value: session.xpEarned || 0, max: 140 },
                                                        { label: 'Duration', value: session.duration || 0, max: 30, suffix: 'min' },
                                                        { label: 'Score', value: session.score || 0, max: 100, suffix: '%' },
                                                    ].map((score) => (
                                                        <div key={score.label} className="bg-white/5 rounded-xl p-3 sm:p-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs sm:text-sm text-secondary">{score.label}</span>
                                                                <span className="font-semibold text-sm sm:text-base">
                                                                    {score.value}{score.suffix || ''}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                                                                    style={{ width: `${Math.min((score.value / score.max) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Session Time */}
                                                <p className="text-sm text-secondary mb-4">
                                                    Completed on {formatDate(session.completedAt || session.createdAt)} at {formatTime(session.completedAt || session.createdAt)}
                                                </p>

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                                    <Link 
                                                        href={`/upload?reteach=${encodeURIComponent(session.topic)}`}
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Play className="w-4 h-4" />
                                                        Reteach
                                                    </Link>
                                                    <button className="btn btn-secondary btn-sm">
                                                        <Share2 className="w-4 h-4" />
                                                        Share
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm text-red-400 hover:bg-red-500/20">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Learn First Tab */}
                {activeTab === 'learn-first' && (
                    <>
                        {filteredLearnFirst.length === 0 ? (
                            <div className="card p-12 text-center">
                                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-secondary" />
                                <h3 className="text-xl font-semibold mb-2">No study sessions yet</h3>
                                <p className="text-secondary mb-6">
                                    Start learning with AI-generated notes, flashcards, and practice questions!
                                </p>
                                <Link href="/learn" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                    <GraduationCap className="w-4 h-4" />
                                    Start Learn First
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:gap-4">
                                {paginatedLearnFirst.map((session) => (
                                    <div
                                        key={session.id}
                                        className="card hover:border-green-500/50 cursor-pointer transition-all"
                                        onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex-center shrink-0">
                                                    <BookMarked className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{session.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-secondary">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            {formatDate(session.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            {session.flashcardsCount} flashcards
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            {session.studyDuration} min studied
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {session.startedTeaching ? (
                                                    <span className="badge bg-green-500/20 text-green-400">
                                                        Started Teaching
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-amber-500/20 text-amber-400">
                                                        Studying
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {selectedSession === session.id && (
                                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                                                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                                        <div className="text-2xl font-bold text-green-400">{session.sectionsCount}</div>
                                                        <div className="text-xs text-secondary">Sections</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                                        <div className="text-2xl font-bold text-amber-400">{session.flashcardsCount}</div>
                                                        <div className="text-xs text-secondary">Flashcards</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                                        <div className="text-2xl font-bold text-purple-400">{session.practiceQuestionsCount}</div>
                                                        <div className="text-xs text-secondary">Questions</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                                    <button className="btn btn-secondary btn-sm">
                                                        <BookOpen className="w-4 h-4" />
                                                        Continue Studying
                                                    </button>
                                                    <button className="btn btn-primary btn-sm">
                                                        <Play className="w-4 h-4" />
                                                        Start Teaching
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm text-red-400 hover:bg-red-500/20">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {currentSessionsList.length > sessionsPerPage && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                        <span className="text-secondary text-sm">
                            Showing {(currentPage - 1) * sessionsPerPage + 1}-{Math.min(currentPage * sessionsPerPage, currentSessionsList.length)} of {currentSessionsList.length} sessions
                        </span>
                        <div className="flex gap-2">
                            <button 
                                className="btn btn-ghost btn-sm" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button 
                                className="btn btn-ghost btn-sm" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
