'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Trophy,
    Medal,
    Crown,
    Flame,
    ChevronLeft,
    ChevronRight,
    Search,
    TrendingUp,
    Star,
    Users,
    Target,
    Loader2,
    Award,
    Zap
} from 'lucide-react';
import { useLeaderboard, useUserProfile } from '@/hooks/useUserData';
import { useSession } from 'next-auth/react';

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const { leaderboard, loading } = useLeaderboard();
    const { profile: currentUser } = useUserProfile();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Filter by search
    const filteredLeaderboard = useMemo(() => {
        if (!searchQuery) return leaderboard;
        return leaderboard.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [leaderboard, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredLeaderboard.length / usersPerPage);
    const paginatedLeaderboard = filteredLeaderboard.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    // Get top 3 for podium
    const top3 = leaderboard.slice(0, 3);

    // Find current user's rank
    const currentUserRank = leaderboard.findIndex(u => u.uid === session?.user?.id) + 1;

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-br from-amber-400 to-orange-500 text-black';
            case 2: return 'bg-gradient-to-br from-gray-300 to-gray-400 text-black';
            case 3: return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
            default: return 'bg-white/10 text-white';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-5 h-5" />;
            case 2: return <Medal className="w-5 h-5" />;
            case 3: return <Medal className="w-5 h-5" />;
            default: return rank;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getLevelTitle = (level: number) => {
        if (level >= 50) return 'Master Teacher';
        if (level >= 30) return 'Expert';
        if (level >= 20) return 'Advanced';
        if (level >= 10) return 'Intermediate';
        if (level >= 5) return 'Apprentice';
        return 'Beginner';
    };

    // Calculate some stats
    const totalTeachers = leaderboard.length;
    const totalXP = leaderboard.reduce((sum, u) => sum + u.xp, 0);
    const avgXP = totalTeachers > 0 ? Math.round(totalXP / totalTeachers) : 0;
    const activeStreaks = leaderboard.filter(u => u.streak > 0).length;

    if (loading) {
        return (
            <div className="min-h-screen flex-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-secondary">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-4 sm:mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex-center">
                            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard</h1>
                            <p className="text-secondary text-sm sm:text-base">Compete with teachers worldwide</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input pl-10 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            {top3.length >= 3 && (
                <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
                        {/* 2nd Place */}
                        <div className="card text-center p-3 sm:p-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex-center overflow-hidden">
                                {top3[1].avatar ? (
                                    <Image src={top3[1].avatar} alt={top3[1].name} width={64} height={64} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg sm:text-2xl font-bold text-black">{getInitials(top3[1].name)}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                                <span className="font-bold text-sm sm:text-base">2nd</span>
                            </div>
                            <div className="font-semibold text-sm sm:text-base truncate">{top3[1].name}</div>
                            <div className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2">Level {top3[1].level}</div>
                            <div className="text-lg sm:text-xl font-bold gradient-text">{top3[1].xp.toLocaleString()} XP</div>
                        </div>

                        {/* 1st Place */}
                        <div className="card text-center p-4 sm:p-8 gradient-border relative">
                            <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2">
                                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                            </div>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-center overflow-hidden">
                                {top3[0].avatar ? (
                                    <Image src={top3[0].avatar} alt={top3[0].name} width={80} height={80} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-black">{getInitials(top3[0].name)}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                                <span className="font-bold text-amber-400 text-sm sm:text-base">1st</span>
                            </div>
                            <div className="font-semibold text-base sm:text-lg truncate">{top3[0].name}</div>
                            <div className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2">Level {top3[0].level}</div>
                            <div className="text-xl sm:text-2xl font-bold gradient-text">{top3[0].xp.toLocaleString()} XP</div>
                            {top3[0].streak > 0 && (
                                <div className="mt-2 sm:mt-4 flex items-center justify-center gap-2">
                                    <span className="badge badge-primary text-xs sm:text-sm">
                                        <Flame className="w-3 h-3" />
                                        {top3[0].streak} day streak
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 3rd Place */}
                        <div className="card text-center p-3 sm:p-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex-center overflow-hidden">
                                {top3[2].avatar ? (
                                    <Image src={top3[2].avatar} alt={top3[2].name} width={64} height={64} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg sm:text-2xl font-bold text-white">{getInitials(top3[2].name)}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                                <span className="font-bold text-sm sm:text-base">3rd</span>
                            </div>
                            <div className="font-semibold text-sm sm:text-base truncate">{top3[2].name}</div>
                            <div className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2">Level {top3[2].level}</div>
                            <div className="text-lg sm:text-xl font-bold gradient-text">{top3[2].xp.toLocaleString()} XP</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                    { label: 'Total Teachers', value: totalTeachers.toLocaleString(), icon: Users, color: 'text-purple-400' },
                    { label: 'Total XP Earned', value: totalXP.toLocaleString(), icon: Zap, color: 'text-amber-400' },
                    { label: 'Average XP', value: avgXP.toLocaleString(), icon: Star, color: 'text-cyan-400' },
                    { label: 'Active Streaks', value: activeStreaks.toLocaleString(), icon: Flame, color: 'text-orange-400' },
                ].map((stat) => (
                    <div key={stat.label} className="card p-3 sm:p-4 text-center">
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${stat.color}`} />
                        <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-secondary">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredLeaderboard.length === 0 ? (
                <div className="max-w-5xl mx-auto card p-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary" />
                    <h3 className="text-xl font-semibold mb-2">
                        {searchQuery ? 'No teachers found' : 'No teachers yet'}
                    </h3>
                    <p className="text-secondary mb-6">
                        {searchQuery 
                            ? 'Try a different search term'
                            : 'Be the first to climb the leaderboard!'}
                    </p>
                    <Link href="/upload" className="btn btn-primary">
                        <TrendingUp className="w-4 h-4" />
                        Start Teaching
                    </Link>
                </div>
            ) : (
                /* Full Leaderboard */
                <div className="max-w-5xl mx-auto card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-secondary text-xs sm:text-sm border-b border-white/10">
                                    <th className="pb-3 sm:pb-4 pl-3 sm:pl-4">Rank</th>
                                    <th className="pb-3 sm:pb-4">Teacher</th>
                                    <th className="pb-3 sm:pb-4 text-center">XP</th>
                                    <th className="pb-3 sm:pb-4 text-center hidden sm:table-cell">Level</th>
                                    <th className="pb-3 sm:pb-4 text-center hidden md:table-cell">Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLeaderboard.map((user, index) => {
                                    const rank = (currentPage - 1) * usersPerPage + index + 1;
                                    const isCurrentUser = user.uid === session?.user?.id;
                                    return (
                                        <tr
                                            key={user.uid}
                                            className={`border-b border-white/5 transition-colors ${
                                                isCurrentUser 
                                                    ? 'bg-purple-500/10 hover:bg-purple-500/20' 
                                                    : 'hover:bg-white/5'
                                            }`}
                                        >
                                            <td className="py-3 sm:py-4 pl-3 sm:pl-4">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-center font-bold text-sm sm:text-base ${getRankStyle(rank)}`}>
                                                    {getRankIcon(rank)}
                                                </div>
                                            </td>
                                            <td className="py-3 sm:py-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-center overflow-hidden shrink-0">
                                                        {user.avatar ? (
                                                            <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs sm:text-sm font-semibold text-white">{getInitials(user.name)}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-sm sm:text-base flex items-center gap-2 truncate">
                                                            {user.name}
                                                            {isCurrentUser && (
                                                                <span className="badge text-xs">You</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-secondary sm:hidden">
                                                            Lvl {user.level}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 sm:py-4 text-center">
                                                <span className="font-bold text-purple-400 text-sm sm:text-base">{user.xp.toLocaleString()}</span>
                                            </td>
                                            <td className="py-3 sm:py-4 text-center hidden sm:table-cell">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Award className="w-4 h-4 text-cyan-400" />
                                                    <span className="text-sm">{user.level}</span>
                                                </div>
                                                <div className="text-xs text-secondary">{getLevelTitle(user.level)}</div>
                                            </td>
                                            <td className="py-3 sm:py-4 text-center hidden md:table-cell">
                                                {user.streak > 0 ? (
                                                    <span className="flex items-center justify-center gap-1">
                                                        <Flame className="w-4 h-4 text-orange-500" />
                                                        <span>{user.streak}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-secondary">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 px-4">
                            <span className="text-secondary text-xs sm:text-sm">
                                Showing {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, filteredLeaderboard.length)} of {filteredLeaderboard.length} teachers
                            </span>
                            <div className="flex gap-1 sm:gap-2">
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
            )}

            {/* Your Position */}
            {currentUser && currentUserRank > 0 && currentUserRank > 10 && (
                <div className="max-w-5xl mx-auto mt-6">
                    <div className="card gradient-border p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-center overflow-hidden shrink-0">
                                    {currentUser.avatar ? (
                                        <Image src={currentUser.avatar} alt={currentUser.name} width={48} height={48} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-white">{getInitials(currentUser.name)}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Your Position</span>
                                        <span className="badge">#{currentUserRank}</span>
                                    </div>
                                    <div className="text-sm text-secondary">
                                        {currentUser.xp.toLocaleString()} XP • Level {currentUser.level}
                                        {currentUser.streak > 0 && ` • ${currentUser.streak} day streak`}
                                    </div>
                                </div>
                            </div>
                            <Link href="/upload" className="btn btn-primary w-full sm:w-auto justify-center">
                                <TrendingUp className="w-4 h-4" />
                                Climb the Ranks
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty Position CTA */}
            {currentUser && currentUserRank === 0 && (
                <div className="max-w-5xl mx-auto mt-6">
                    <div className="card gradient-border p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex-center">
                                    <Target className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <div className="font-semibold">Join the Leaderboard!</div>
                                    <div className="text-sm text-secondary">
                                        Complete teaching sessions to earn XP and climb the ranks
                                    </div>
                                </div>
                            </div>
                            <Link href="/upload" className="btn btn-primary w-full sm:w-auto justify-center">
                                <TrendingUp className="w-4 h-4" />
                                Start Teaching
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
