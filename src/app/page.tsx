'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  Trophy,
  Sparkles,
  Upload,
  MessageSquare,
  ChevronRight,
  Play,
  Star,
  Zap,
  ArrowRight,
  Menu,
  X,
  FileText,
  GraduationCap,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container flex-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">FeynLearn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-secondary hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-secondary hover:text-white transition-colors">How It Works</Link>
            <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get Started</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass p-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="p-2 hover:bg-white/5 rounded-lg">Features</Link>
              <Link href="#how-it-works" className="p-2 hover:bg-white/5 rounded-lg">How It Works</Link>
              <Link href="/login" className="btn btn-primary w-full">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powered by the Feynman Technique</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Anything by{' '}
            <span className="gradient-text">Teaching</span>
          </h1>

          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10">
            Upload your study materials, learn with AI-generated notes and flashcards, 
            then solidify your knowledge by teaching an AI student.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/login" className="btn btn-primary btn-lg glow">
              <Play className="w-5 h-5" />
              Start Learning Free
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Two Learning Modes Section */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Two Powerful <span className="gradient-text">Learning Modes</span>
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              FeynLearn combines passive learning with active teaching for maximum retention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Learn First Mode */}
            <div className="card card-gradient p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Learn First</h3>
              <p className="text-secondary mb-6">
                Upload your materials and get AI-generated study resources tailored to your content.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex-center">
                    <FileText className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Comprehensive Study Notes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex-center">
                    <Lightbulb className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Interactive Flashcards</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex-center">
                    <HelpCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Practice Questions</span>
                </li>
              </ul>
            </div>

            {/* Talk Through Mode */}
            <div className="card card-gradient p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Talk Through</h3>
              <p className="text-secondary mb-6">
                Teach concepts to an AI student that asks questions and challenges your understanding.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <span>Adaptive AI Student Personas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex-center">
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <span>Real-time Scoring & Feedback</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <span>XP & Streak Tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="section bg-white/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Upload <span className="gradient-text">Any Format</span>
            </h2>
            <p className="text-secondary">
              We support multiple file types and even web URLs
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {[
              { name: 'PDF', icon: '📄' },
              { name: 'DOCX', icon: '📝' },
              { name: 'TXT', icon: '📃' },
              { name: 'URLs', icon: '🔗' },
            ].map((format) => (
              <div key={format.name} className="card px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">{format.icon}</span>
                <span className="font-semibold">{format.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How <span className="gradient-text">FeynLearn</span> Works
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              A simple three-step process to master any subject.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Your Material',
                description: 'Drop your PDF, DOCX, TXT files or paste a URL. Our AI extracts key topics automatically.',
              },
              {
                step: '02',
                icon: BookOpen,
                title: 'Learn First',
                description: 'Review AI-generated notes, flashcards, and practice questions to build foundational knowledge.',
              },
              {
                step: '03',
                icon: GraduationCap,
                title: 'Talk Through',
                description: 'Teach the concepts to an AI student. Explaining deepens your understanding and reveals gaps.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
                )}
                <div className="card text-center">
                  <div className="text-6xl font-bold text-white/5 absolute top-4 right-6">{item.step}</div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-secondary">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Topics',
                description: 'Our AI automatically extracts key topics from your uploaded materials.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: Trophy,
                title: 'Global Leaderboard',
                description: 'Compete with learners worldwide and see how you rank.',
                color: 'from-amber-500 to-amber-600',
              },
              {
                icon: Zap,
                title: 'XP & Streaks',
                description: 'Earn XP for teaching sessions and maintain your learning streaks.',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: Star,
                title: 'Session Scoring',
                description: 'Get scored on clarity, accuracy, and depth of your explanations.',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: BookOpen,
                title: 'Session History',
                description: 'Track all your Learn First and Talk Through sessions in one place.',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                icon: MessageSquare,
                title: 'AI Personas',
                description: 'Choose from Curious, Challenging, or Supportive AI student personas.',
                color: 'from-blue-500 to-blue-600',
              },
            ].map((feature, i) => (
              <div key={i} className="card card-gradient group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="card gradient-border text-center py-16">
            <h2 className="text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Learn Smarter</span>?
            </h2>
            <p className="text-secondary max-w-xl mx-auto mb-8">
              Join FeynLearn and discover the power of learning by teaching.
              Upload your first material in under a minute.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg glow inline-flex">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">FeynLearn</span>
            </div>
            <div className="text-sm text-secondary">
              © 2024 FeynLearn. Built with the Feynman Technique in mind.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
