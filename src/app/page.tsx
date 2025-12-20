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
  Target,
  ChevronRight,
  Play,
  Star,
  Zap,
  Users,
  ArrowRight,
  Menu,
  X
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
            <span className="text-xl font-bold">TeachMaster AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-secondary hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-secondary hover:text-white transition-colors">How It Works</Link>
            <Link href="#leaderboard" className="text-secondary hover:text-white transition-colors">Leaderboard</Link>
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
              <Link href="#leaderboard" className="p-2 hover:bg-white/5 rounded-lg">Leaderboard</Link>
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
            <span className="text-sm text-purple-300">Based on the Feynman Technique</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Learn by{' '}
            <span className="gradient-text">Teaching</span>
            <br />
            an AI Student
          </h1>

          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10">
            Upload your notes, teach a curious AI, and master any subject.
            The best way to learn is to teach—and our AI makes the perfect student.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/login" className="btn btn-primary btn-lg glow">
              <Play className="w-5 h-5" />
              Start Teaching Free
            </Link>
            <Link href="#demo" className="btn btn-secondary btn-lg">
              Watch Demo
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Active Teachers' },
              { value: '50K+', label: 'Sessions Completed' },
              { value: '94%', label: 'Retention Rate' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why <span className="gradient-text">TeachMaster AI</span>?
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Our AI student is designed to challenge your understanding,
              not just nod along. Real learning happens when you explain concepts thoroughly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Adaptive AI Personas',
                description: 'From confused freshman to skeptical expert—our AI adapts its challenge level to push your understanding.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: Upload,
                title: 'Multi-Format Upload',
                description: 'Upload PDFs, notes, or paste YouTube links. Our AI extracts key topics automatically.',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                icon: Target,
                title: 'Multi-Dimensional Scoring',
                description: 'Get scored on clarity, accuracy, depth, and patience. Know exactly where to improve.',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: Trophy,
                title: 'Gamified Learning',
                description: 'Earn XP, unlock badges, climb leaderboards, and maintain teaching streaks.',
                color: 'from-amber-500 to-amber-600',
              },
              {
                icon: Zap,
                title: 'Spaced Repetition',
                description: 'Weak topics come back for review. Build long-term retention with smart scheduling.',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: Users,
                title: 'Study Groups',
                description: 'Challenge friends, share notes, and compete in group leaderboards.',
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

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Three simple steps to master any subject through teaching.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Your Material',
                description: 'Drop your PDF notes, paste a YouTube link, or type key topics you want to master.',
              },
              {
                step: '02',
                icon: MessageSquare,
                title: 'Teach the AI',
                description: 'Our AI plays a curious student, asking questions and challenging your explanations.',
              },
              {
                step: '03',
                icon: Star,
                title: 'Track & Improve',
                description: 'Get detailed scores, identify weak areas, and watch your mastery grow over time.',
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

          {/* Demo Chat Preview */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">AI Student</div>
                  <div className="text-sm text-secondary">Curious Freshman Mode</div>
                </div>
                <div className="ml-auto badge badge-primary">
                  <Zap className="w-3 h-3" />
                  Live Session
                </div>
              </div>

              <div className="space-y-4">
                <div className="chat-bubble chat-bubble-ai">
                  <p>So wait, photosynthesis is just plants eating sunlight, right? Like they literally consume light as food? 🤔</p>
                </div>
                <div className="chat-bubble chat-bubble-user">
                  <p>Not quite! Photosynthesis is actually a biochemical process where plants use light energy to convert CO₂ and water into glucose and oxygen. The light provides energy, but it&apos;s not &quot;eaten&quot;—it powers a chemical reaction.</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="badge badge-success">
                    <Star className="w-3 h-3" />
                    +15 pts
                  </span>
                  <span className="text-secondary">Great explanation! Clear and accurate.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Top <span className="gradient-text">Teachers</span>
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Compete with learners worldwide and climb the ranks.
            </p>
          </div>

          <div className="max-w-2xl mx-auto card">
            {[
              { rank: 1, name: 'Sarah Chen', score: 12450, streak: 45, avatar: 'SC' },
              { rank: 2, name: 'Alex Rivera', score: 11280, streak: 32, avatar: 'AR' },
              { rank: 3, name: 'Priya Patel', score: 10890, streak: 28, avatar: 'PP' },
              { rank: 4, name: 'Marcus Johnson', score: 9750, streak: 21, avatar: 'MJ' },
              { rank: 5, name: 'Emma Wilson', score: 9120, streak: 19, avatar: 'EW' },
            ].map((user) => (
              <div key={user.rank} className="leaderboard-item">
                <div className={`leaderboard-rank ${user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : user.rank === 3 ? 'bronze' : 'bg-white/10'}`}>
                  {user.rank}
                </div>
                <div className="avatar">{user.avatar}</div>
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-secondary">🔥 {user.streak} day streak</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-400">{user.score.toLocaleString()}</div>
                  <div className="text-sm text-secondary">XP</div>
                </div>
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
              Ready to <span className="gradient-text">Master</span> Any Subject?
            </h2>
            <p className="text-secondary max-w-xl mx-auto mb-8">
              Join thousands of learners who&apos;ve discovered the power of teaching.
              Start your first session in under 2 minutes.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg glow inline-flex">
              Start Teaching Now
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
              <span className="font-semibold">TeachMaster AI</span>
            </div>
            <div className="flex gap-8 text-sm text-secondary">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-secondary">
              © 2024 TeachMaster AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
