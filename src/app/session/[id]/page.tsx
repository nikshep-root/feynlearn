'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    Brain,
    Send,
    ArrowLeft,
    Sparkles,
    Star,
    Target,
    CheckCircle,
    Clock,
    Lightbulb,
    ThumbsUp,
    RotateCcw,
    Trophy,
    Loader2,
    Zap,
    Award,
    BookOpen,
    Timer,
    MessageCircle,
    ChevronRight,
    Flame,
    GraduationCap
} from 'lucide-react';

interface Message {
    id: string;
    role: 'ai' | 'user';
    content: string;
    score?: number;
    feedback?: string;
    timestamp?: Date;
}

interface SessionScore {
    clarity: number;
    accuracy: number;
    depth: number;
    patience: number;
}

function SessionContent() {
    const searchParams = useSearchParams();
    const topicsParam = searchParams.get('topics');
    const personaParam = searchParams.get('persona') || 'curious';
    
    // Parse topics from URL or use default
    const topics = topicsParam ? JSON.parse(decodeURIComponent(topicsParam)) : [];
    const topicNames = topics.map((t: { name: string }) => t.name).join(', ') || 'the topic';
    const mainTopic = topics[0]?.name || 'this topic';

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [totalQuestions] = useState(7);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [scores, setScores] = useState<SessionScore>({
        clarity: 0,
        accuracy: 0,
        depth: 0,
        patience: 0,
    });
    const [totalScore, setTotalScore] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showTips, setShowTips] = useState(false);
    const [dbSessionId, setDbSessionId] = useState<string | null>(null);
    const [sessionSaved, setSessionSaved] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const personaConfig: Record<string, { name: string; emoji: string; color: string }> = {
        curious: { name: 'Curious Freshman', emoji: '🧐', color: 'from-blue-500 to-cyan-500' },
        skeptical: { name: 'Skeptical Senior', emoji: '🤨', color: 'from-orange-500 to-red-500' },
        devil: { name: "Devil's Advocate", emoji: '😈', color: 'from-purple-500 to-pink-500' }
    };

    const currentPersona = personaConfig[personaParam] || personaConfig.curious;

    // Session timer
    useEffect(() => {
        if (!sessionComplete && !isLoading) {
            const timer = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [sessionComplete, isLoading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Save session when completed
    useEffect(() => {
        const saveCompletedSession = async () => {
            if (sessionComplete && dbSessionId && !sessionSaved) {
                setSessionSaved(true);
                const xpEarned = totalScore * 2;
                try {
                    await fetch(`/api/user/sessions/${dbSessionId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            complete: true,
                            score: totalScore,
                            xpEarned: xpEarned
                        }),
                    });
                    console.log('Session saved successfully');
                } catch (error) {
                    console.error('Failed to save session:', error);
                }
            }
        };
        
        saveCompletedSession();
    }, [sessionComplete, dbSessionId, totalScore, sessionSaved]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize session with first AI message
    useEffect(() => {
        const initSession = async () => {
            setIsLoading(true);
            try {
                // Create a session in the database first
                const createRes = await fetch('/api/user/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: mainTopic,
                        subject: topicNames,
                        content: `Teaching session for: ${topicNames}`
                    }),
                });
                
                if (createRes.ok) {
                    const createData = await createRes.json();
                    setDbSessionId(createData.sessionId);
                }

                const response = await fetch('/api/session/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: `Start the conversation. You want to learn about: ${topicNames}. Ask your first question to begin.` }],
                        topic: topicNames,
                        persona: personaParam,
                    }),
                });

                const data = await response.json();
                if (data.message) {
                    setMessages([{
                        id: '1',
                        role: 'ai',
                        content: data.message,
                        timestamp: new Date(),
                    }]);
                }
            } catch (error) {
                console.error('Failed to initialize session:', error);
                setMessages([{
                    id: '1',
                    role: 'ai',
                    content: `Hey! I'm trying to learn about ${mainTopic}. Can you explain it to me? What's the most important thing I should know? 🤔`,
                    timestamp: new Date(),
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();
    }, [topicNames, mainTopic, personaParam]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const allMessages = [...messages, userMessage]
                .filter(m => m.score === undefined)
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            const response = await fetch('/api/session/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: allMessages,
                    topic: topicNames,
                    persona: personaParam
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const earnedScore = data.score || 12;

            // Update streak
            if (earnedScore >= 15) {
                setStreak(prev => prev + 1);
            } else {
                setStreak(0);
            }

            // Update scores
            setScores(prev => ({
                clarity: prev.clarity + Math.floor(earnedScore * 0.25),
                accuracy: prev.accuracy + Math.floor(earnedScore * 0.30),
                depth: prev.depth + Math.floor(earnedScore * 0.25),
                patience: prev.patience + Math.floor(earnedScore * 0.20),
            }));
            setTotalScore(prev => prev + earnedScore);

            // Show score feedback
            const feedbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: '',
                score: earnedScore,
                feedback: data.feedback || 'Good explanation!',
            };
            setMessages(prev => [...prev, feedbackMessage]);

            if (currentQuestion >= totalQuestions) {
                setSessionComplete(true);
            } else {
                // Add AI response
                const aiMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'ai',
                    content: data.message,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
                setCurrentQuestion(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error in chat:', error);
            const aiMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'ai',
                content: "Hmm, that's interesting! Can you explain that in a different way? I want to make sure I understand correctly. 🤔",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getFinalGrade = () => {
        const avgScore = totalScore / totalQuestions;
        if (avgScore >= 18) return { grade: 'A+', color: 'text-green-400', bgColor: 'from-green-500/20 to-emerald-500/20', message: 'Outstanding Teacher!', stars: 5 };
        if (avgScore >= 15) return { grade: 'A', color: 'text-green-400', bgColor: 'from-green-500/20 to-emerald-500/20', message: 'Excellent Work!', stars: 4 };
        if (avgScore >= 12) return { grade: 'B', color: 'text-amber-400', bgColor: 'from-amber-500/20 to-yellow-500/20', message: 'Good Job!', stars: 3 };
        if (avgScore >= 8) return { grade: 'C', color: 'text-orange-400', bgColor: 'from-orange-500/20 to-red-500/20', message: 'Keep Practicing!', stars: 2 };
        return { grade: 'D', color: 'text-red-400', bgColor: 'from-red-500/20 to-pink-500/20', message: 'Needs Improvement', stars: 1 };
    };

    const getScoreColor = (score: number) => {
        if (score >= 18) return 'text-green-400';
        if (score >= 15) return 'text-cyan-400';
        if (score >= 10) return 'text-amber-400';
        return 'text-red-400';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-center mx-auto mb-6 animate-pulse">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Preparing Your Session</h2>
                    <p className="text-secondary">Your AI student is getting ready to learn...</p>
                </div>
            </div>
        );
    }

    if (sessionComplete) {
        const finalGrade = getFinalGrade();
        const xpEarned = totalScore * 2;
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 sm:p-6">
                <div className="max-w-2xl mx-auto pt-8">
                    {/* Confetti effect placeholder */}
                    <div className="card overflow-hidden">
                        {/* Header Banner */}
                        <div className={`bg-gradient-to-r ${finalGrade.bgColor} p-8 text-center relative`}>
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-center shadow-lg shadow-amber-500/30">
                                    <Trophy className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Session Complete! 🎉</h1>
                                <p className="text-secondary">You finished teaching {mainTopic}</p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Stars Rating */}
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-8 h-8 ${i < finalGrade.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                    />
                                ))}
                            </div>

                            {/* Main Score */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-baseline gap-2">
                                    <span className={`text-7xl font-bold ${finalGrade.color}`}>{finalGrade.grade}</span>
                                </div>
                                <p className="text-xl text-secondary mt-2">{finalGrade.message}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <Star className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{totalScore}</div>
                                    <div className="text-xs text-secondary">Total Points</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <Timer className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{formatTime(sessionTime)}</div>
                                    <div className="text-xs text-secondary">Time</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <MessageCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{totalQuestions}</div>
                                    <div className="text-xs text-secondary">Questions</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{Math.round(totalScore / totalQuestions)}</div>
                                    <div className="text-xs text-secondary">Avg Score</div>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="bg-white/5 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    Skills Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Clarity', value: scores.clarity, max: Math.floor(totalQuestions * 5), icon: Lightbulb, color: 'bg-cyan-500' },
                                        { label: 'Accuracy', value: scores.accuracy, max: Math.floor(totalQuestions * 6), icon: Target, color: 'bg-green-500' },
                                        { label: 'Depth', value: scores.depth, max: Math.floor(totalQuestions * 5), icon: BookOpen, color: 'bg-purple-500' },
                                        { label: 'Patience', value: scores.patience, max: Math.floor(totalQuestions * 4), icon: ThumbsUp, color: 'bg-amber-500' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="flex items-center gap-3">
                                            <stat.icon className="w-4 h-4 text-secondary" />
                                            <span className="text-sm w-20">{stat.label}</span>
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${stat.color} transition-all duration-500`}
                                                    style={{ width: `${(stat.value / stat.max) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">{stat.value}/{stat.max}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* XP Earned */}
                            <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl p-4 mb-6 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">+{xpEarned} XP</div>
                                        <div className="text-sm text-secondary">Experience Earned</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/upload" className="btn btn-secondary flex-1 justify-center">
                                    <RotateCcw className="w-4 h-4" />
                                    New Topic
                                </Link>
                                <Link href="/dashboard" className="btn btn-primary flex-1 justify-center glow">
                                    <CheckCircle className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
            {/* Header */}
            <header className="glass border-b border-white/10 sticky top-0 z-50">
                <div className="container py-3 px-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Back + Topic */}
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentPersona.color} flex-center`}>
                                    <span className="text-lg">{currentPersona.emoji}</span>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-semibold">{currentPersona.name}</div>
                                    <div className="text-xs text-secondary truncate max-w-[150px]">{mainTopic}</div>
                                </div>
                            </div>
                        </div>

                        {/* Center: Progress (Desktop) */}
                        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs mx-6">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs text-secondary mb-1">
                                    <span>Question {currentQuestion}/{totalQuestions}</span>
                                    <span>{Math.round((currentQuestion / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                                        style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Timer */}
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-sm">
                                <Timer className="w-4 h-4 text-secondary" />
                                <span className="font-mono">{formatTime(sessionTime)}</span>
                            </div>

                            {/* Streak */}
                            {streak > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 rounded-full text-sm">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                    <span className="font-semibold text-orange-400">{streak}</span>
                                </div>
                            )}

                            {/* Score */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 rounded-full">
                                <Star className="w-4 h-4 text-purple-400" />
                                <span className="font-semibold">{totalScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Progress */}
                    <div className="md:hidden mt-3">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="container max-w-3xl py-4 px-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id}>
                                {message.score !== undefined ? (
                                    // Score feedback
                                    <div className="flex items-center justify-center gap-2 py-2">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                                            message.score >= 15 ? 'bg-green-500/20 text-green-400' : 
                                            message.score >= 10 ? 'bg-amber-500/20 text-amber-400' : 
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            <Star className="w-4 h-4" />
                                            <span className="font-semibold">+{message.score} pts</span>
                                            <span className="text-sm opacity-80">• {message.feedback}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] sm:max-w-[75%] ${
                                            message.role === 'ai' 
                                                ? 'bg-white/5 rounded-2xl rounded-tl-md' 
                                                : 'bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl rounded-tr-md'
                                        } p-4`}>
                                            {message.role === 'ai' && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentPersona.color} flex-center`}>
                                                        <span className="text-xs">{currentPersona.emoji}</span>
                                                    </div>
                                                    <span className="text-xs text-secondary font-medium">{currentPersona.name}</span>
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 rounded-2xl rounded-tl-md p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentPersona.color} flex-center`}>
                                            <span className="text-xs">{currentPersona.emoji}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* Teaching Tips Button (Mobile) */}
            <button
                onClick={() => setShowTips(!showTips)}
                className="fixed bottom-24 right-4 xl:hidden w-12 h-12 rounded-full bg-amber-500/20 flex-center shadow-lg border border-amber-500/30 z-40"
            >
                <Lightbulb className="w-5 h-5 text-amber-400" />
            </button>

            {/* Teaching Tips Modal (Mobile) */}
            {showTips && (
                <div className="fixed inset-0 bg-black/50 z-50 xl:hidden flex items-end" onClick={() => setShowTips(false)}>
                    <div className="bg-gray-900 w-full rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-400" />
                                <span className="font-semibold">Teaching Tips</span>
                            </div>
                            <button onClick={() => setShowTips(false)} className="text-secondary">Close</button>
                        </div>
                        <ul className="space-y-3 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                <span>Use simple analogies to explain complex concepts</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                <span>Break down processes into clear steps</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                <span>Correct misconceptions patiently</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                <span>Connect concepts to real-world examples</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Teaching Tips Sidebar (Desktop) */}
            <aside className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 w-72">
                <div className="card p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <span className="font-semibold">Teaching Tips</span>
                    </div>
                    <ul className="space-y-3 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span>Use simple analogies to explain complex concepts</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span>Break down processes into clear steps</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span>Correct misconceptions patiently</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span>Connect concepts to real-world examples</span>
                        </li>
                    </ul>

                    {/* Session Stats */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-secondary mb-2">Session Stats</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                                <div className="font-semibold">{currentQuestion}</div>
                                <div className="text-xs text-secondary">Questions</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                                <div className="font-semibold">{formatTime(sessionTime)}</div>
                                <div className="text-xs text-secondary">Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Input Area */}
            <footer className="glass border-t border-white/10 sticky bottom-0">
                <div className="container max-w-3xl py-3 px-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Explain the concept to your student..."
                                rows={1}
                                className="input pr-20 resize-none min-h-[48px] max-h-32 text-sm sm:text-base"
                                style={{ height: 'auto' }}
                                disabled={isTyping}
                            />
                            <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-secondary">
                                <span className="hidden sm:inline">{totalQuestions - currentQuestion + 1} left</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="btn btn-primary px-4 sm:px-6 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function SessionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-secondary">Loading session...</p>
                </div>
            </div>
        }>
            <SessionContent />
        </Suspense>
    );
}
