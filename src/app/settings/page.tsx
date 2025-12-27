'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserData';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Brain,
    ChevronLeft,
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Volume2,
    Moon,
    Sun,
    Smartphone,
    Mail,
    Clock,
    Target,
    Save,
    LogOut,
    Trash2,
    ChevronRight,
    Check,
    Loader2,
    Camera,
    Upload
} from 'lucide-react';

export default function SettingsPage() {
    const { profile, loading, updateProfile } = useUserProfile();
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for form fields
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
    });
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        reviewReminders: true,
        streakReminders: true,
        weeklyDigest: false,
    });
    const [preferences, setPreferences] = useState({
        defaultPersona: 'curious' as 'curious' | 'challenging' | 'supportive',
        questionsPerSession: 7,
        autoPlayNext: true,
        showHints: true,
        darkMode: true,
        language: 'en',
    });

    // Update local state when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                bio: profile.bio || '',
            });
            setNotifications(profile.notifications || notifications);
            setPreferences({
                defaultPersona: profile.preferences?.defaultPersona || 'curious',
                questionsPerSession: profile.preferences?.questionsPerSession || 7,
                autoPlayNext: profile.preferences?.autoPlayNext ?? true,
                showHints: profile.preferences?.showHints ?? true,
                darkMode: profile.preferences?.darkMode ?? true,
                language: profile.preferences?.language || 'en',
            });
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile({
                name: formData.name,
                bio: formData.bio,
            });
            setSaveMessage('Profile saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        setSaving(true);
        try {
            await updateProfile({ notifications });
            setSaveMessage('Notifications saved!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            await updateProfile({ preferences });
            setSaveMessage('Preferences saved!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setSaveMessage('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setSaveMessage('Image must be less than 2MB');
            return;
        }

        setUploadingAvatar(true);
        try {
            // Convert to base64 for simple storage (in production, use Firebase Storage)
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                await updateProfile({ avatar: base64 });
                setSaveMessage('Avatar updated successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
                setUploadingAvatar(false);
            };
            reader.onerror = () => {
                setSaveMessage('Failed to read image');
                setUploadingAvatar(false);
            };
            reader.readAsDataURL(file);
        } catch {
            setSaveMessage('Failed to update avatar');
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setSaving(true);
        try {
            await updateProfile({ avatar: '' });
            setSaveMessage('Avatar removed');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('Failed to remove avatar');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                        <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-secondary">Manage your account and preferences</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="card p-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === section.id
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'text-secondary hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <section.icon className="w-5 h-5" />
                                {section.label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1">
                    {/* Save Message */}
                    {saveMessage && (
                        <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">
                            {saveMessage}
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center text-4xl font-bold overflow-hidden">
                                        {profile?.avatar ? (
                                            <Image 
                                                src={profile.avatar} 
                                                alt={profile.name || 'Avatar'} 
                                                width={96} 
                                                height={96} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    {/* Overlay on hover */}
                                    <div 
                                        className="absolute inset-0 bg-black/50 rounded-2xl flex-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-white" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="btn btn-secondary btn-sm mb-2"
                                    >
                                        {uploadingAvatar ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Change Avatar
                                            </>
                                        )}
                                    </button>
                                    {profile?.avatar && (
                                        <button 
                                            onClick={handleRemoveAvatar}
                                            className="btn btn-ghost btn-sm text-red-400 hover:bg-red-500/20 ml-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remove
                                        </button>
                                    )}
                                    <p className="text-sm text-secondary mt-2">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="input" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        value={profile?.email || ''} 
                                        className="input" 
                                        disabled 
                                    />
                                    <p className="text-sm text-secondary mt-1">Email is linked to your Google account</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    <textarea
                                        rows={3}
                                        className="input resize-none"
                                        placeholder="Tell us about yourself..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{profile?.level || 1}</div>
                                        <div className="text-sm text-secondary">Level</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyan-400">{profile?.xp || 0}</div>
                                        <div className="text-sm text-secondary">Total XP</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-400">{profile?.streak || 0}</div>
                                        <div className="text-sm text-secondary">Day Streak</div>
                                    </div>
                                </div>

                                <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>

                            <div className="space-y-6">
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                                    { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile notifications', icon: Smartphone },
                                    { key: 'reviewReminders', label: 'Review Reminders', desc: 'Get reminded when topics need review', icon: Clock },
                                    { key: 'streakReminders', label: 'Streak Reminders', desc: 'Don\'t lose your teaching streak', icon: Target },
                                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your learning progress', icon: Mail },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex-center">
                                                <item.icon className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-sm text-secondary">{item.desc}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                            className={`w-12 h-6 rounded-full transition-all ${notifications[item.key as keyof typeof notifications]
                                                    ? 'bg-purple-500'
                                                    : 'bg-white/20'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications]
                                                    ? 'translate-x-6'
                                                    : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleSaveNotifications} disabled={saving} className="btn btn-primary mt-6">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Notifications
                            </button>
                        </div>
                    )}

                    {/* Preferences Section */}
                    {activeSection === 'preferences' && (
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-6">Learning Preferences</h2>

                            <div className="space-y-6">
                                {/* Default Persona */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">Default AI Persona</label>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        {[
                                            { id: 'curious' as const, name: 'Curious Freshman', desc: 'Easy questions' },
                                            { id: 'challenging' as const, name: 'Skeptical Senior', desc: 'Medium difficulty' },
                                            { id: 'supportive' as const, name: "Supportive Guide", desc: 'Encouraging feedback' },
                                        ].map((persona) => (
                                            <button
                                                key={persona.id}
                                                onClick={() => setPreferences(prev => ({ ...prev, defaultPersona: persona.id }))}
                                                className={`p-4 rounded-xl text-left transition-all ${preferences.defaultPersona === persona.id
                                                        ? 'bg-purple-500/20 border-2 border-purple-500'
                                                        : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="font-medium">{persona.name}</div>
                                                <div className="text-sm text-secondary">{persona.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Questions per session */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">Questions per Session</label>
                                    <div className="flex gap-2">
                                        {[5, 7, 10, 15].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setPreferences(prev => ({ ...prev, questionsPerSession: num }))}
                                                className={`px-6 py-3 rounded-xl font-medium transition-all ${preferences.questionsPerSession === num
                                                        ? 'bg-purple-500 text-white'
                                                        : 'bg-white/5 text-secondary hover:bg-white/10'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggles */}
                                {[
                                    { key: 'autoPlayNext', label: 'Auto-play Next Topic', desc: 'Automatically start next topic after completion' },
                                    { key: 'showHints', label: 'Show Teaching Hints', desc: 'Display helpful tips during sessions' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-sm text-secondary">{item.desc}</div>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                            className={`w-12 h-6 rounded-full transition-all ${preferences[item.key as keyof typeof preferences]
                                                    ? 'bg-purple-500'
                                                    : 'bg-white/20'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences[item.key as keyof typeof preferences]
                                                    ? 'translate-x-6'
                                                    : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                ))}

                                <button onClick={handleSavePreferences} disabled={saving} className="btn btn-primary">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-6">Appearance</h2>

                            <div className="space-y-6">
                                {/* Theme */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">Theme</label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 rounded-xl flex items-center gap-4 transition-all ${theme === 'dark'
                                                    ? 'bg-purple-500/20 border-2 border-purple-500'
                                                    : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-900 flex-center">
                                                <Moon className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">Dark Mode</div>
                                                <div className="text-sm text-secondary">Easy on the eyes</div>
                                            </div>
                                            {theme === 'dark' && <Check className="w-5 h-5 text-purple-400 ml-auto" />}
                                        </button>

                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 rounded-xl flex items-center gap-4 transition-all ${theme === 'light'
                                                    ? 'bg-purple-500/20 border-2 border-purple-500'
                                                    : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white flex-center">
                                                <Sun className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">Light Mode</div>
                                                <div className="text-sm text-secondary">Classic look</div>
                                            </div>
                                            {theme === 'light' && <Check className="w-5 h-5 text-purple-400 ml-auto" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">Language</label>
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <Globe className="w-5 h-5 text-purple-400" />
                                        <span>English (US)</span>
                                        <ChevronRight className="w-5 h-5 text-secondary ml-auto" />
                                    </div>
                                </div>

                                {/* Sound */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">Sound Effects</label>
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                                        <Volume2 className="w-5 h-5 text-purple-400" />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            defaultValue="70"
                                            className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
                                        />
                                        <span className="text-secondary">70%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Section */}
                    {activeSection === 'privacy' && (
                        <div className="space-y-6">
                            <div className="card">
                                <h2 className="text-xl font-semibold mb-6">Privacy & Security</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Shield className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <div className="font-medium">Change Password</div>
                                                <div className="text-sm text-secondary">Update your password</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Smartphone className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <div className="font-medium">Two-Factor Authentication</div>
                                                <div className="text-sm text-secondary">Add an extra layer of security</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Globe className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <div className="font-medium">Profile Visibility</div>
                                                <div className="text-sm text-secondary">Public on leaderboard</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="card border-red-500/30">
                                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                                <div className="space-y-4">
                                    <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors" onClick={() => signOut({ callbackUrl: '/login' })}>
                                        <LogOut className="w-5 h-5" />
                                        Sign Out of All Devices
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>

                            {/* Sync Stats */}
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">Data Sync</h3>
                                <p className="text-sm text-secondary mb-4">
                                    If your XP or stats seem incorrect, you can recalculate them from your completed sessions.
                                </p>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={async () => {
                                        setSaving(true);
                                        try {
                                            const res = await fetch('/api/user/profile', {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ recalculate: true }),
                                            });
                                            if (res.ok) {
                                                setSaveMessage('Stats recalculated successfully!');
                                                window.location.reload();
                                            } else {
                                                setSaveMessage('Failed to recalculate stats');
                                            }
                                        } catch {
                                            setSaveMessage('Failed to recalculate stats');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                                    Recalculate XP & Stats
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
