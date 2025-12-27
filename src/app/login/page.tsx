'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Brain, Chrome, ArrowRight, Sparkles, BookOpen, Trophy, Target, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    // Check for error in URL params (from NextAuth)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            switch (errorParam) {
                case 'OAuthSignin':
                    setError('Error starting the sign-in process. Please try again.');
                    break;
                case 'OAuthCallback':
                    setError('Error during sign-in callback. Please try again.');
                    break;
                case 'OAuthCreateAccount':
                    setError('Could not create account. Please try again.');
                    break;
                case 'Callback':
                    setError('Sign-in was interrupted. Please try again.');
                    break;
                case 'AccessDenied':
                    setError('Access denied. You may not have permission to sign in.');
                    break;
                default:
                    setError('An error occurred during sign-in. Please try again.');
            }
        }
    }, [searchParams]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await signIn('google', { 
                callbackUrl: '/dashboard',
                redirect: true,
            });
            
            // If we get here without redirect, something went wrong
            if (result?.error) {
                setError('Sign-in failed. Please try again.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Login Form */}
            <div className="flex-1 flex-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold">TeachMaster AI</span>
                    </Link>

                    {/* Welcome Text */}
                    <h1 className="text-4xl font-bold mb-3">
                        Welcome Back
                    </h1>
                    <p className="text-secondary mb-6">
                        Continue your learning journey by teaching what you know.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                        ) : (
                            <>
                                <Chrome className="w-5 h-5" />
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-sm text-secondary">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Demo Mode */}
                    <Link
                        href="/dashboard"
                        className="w-full btn btn-secondary justify-center"
                    >
                        Try Demo Mode
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* Terms */}
                    <p className="text-sm text-secondary text-center mt-8">
                        By continuing, you agree to our{' '}
                        <Link href="#" className="text-purple-400 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="#" className="text-purple-400 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>

            {/* Right Panel - Decorative */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-cyan-900/50" />

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

                {/* Content */}
                <div className="relative z-10 flex-center flex-1 p-12">
                    <div className="max-w-md">
                        {/* Feature Highlights */}
                        <div className="space-y-6">
                            {[
                                {
                                    icon: Sparkles,
                                    title: 'AI-Powered Learning',
                                    description: 'Our AI adapts to challenge your understanding at every level.',
                                },
                                {
                                    icon: BookOpen,
                                    title: 'Learn Any Subject',
                                    description: 'Upload notes, PDFs, or paste links—start teaching instantly.',
                                },
                                {
                                    icon: Trophy,
                                    title: 'Track Your Progress',
                                    description: 'Earn XP, unlock badges, and compete on global leaderboards.',
                                },
                                {
                                    icon: Target,
                                    title: 'Master Retention',
                                    description: 'Spaced repetition ensures you remember what you teach.',
                                },
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex-center shrink-0">
                                        <feature.icon className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-sm text-secondary">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Testimonial */}
                        <div className="mt-12 p-6 glass rounded-2xl">
                            <p className="italic text-secondary mb-4">
                                &quot;TeachMaster AI helped me ace my biochemistry exam. Teaching concepts to the AI made me realize gaps I didn&apos;t know I had.&quot;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="avatar">SC</div>
                                <div>
                                    <div className="font-semibold">Sarah Chen</div>
                                    <div className="text-sm text-secondary">Medical Student</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
