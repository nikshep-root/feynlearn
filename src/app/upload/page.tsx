'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Brain,
    Upload,
    FileText,
    Youtube,
    Link as LinkIcon,
    X,
    CheckCircle,
    Loader2,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    FileType,
    File
} from 'lucide-react';

interface ExtractedTopic {
    id: string;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    selected: boolean;
}

export default function UploadPage() {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'upload' | 'extracting' | 'select'>('upload');
    const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
    const [selectedPersona, setSelectedPersona] = useState('curious');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
            setUploadedFile(file);
        } else {
            alert('Please upload a PDF, TXT, or DOCX file');
        }
    };

    const handleExtractTopics = async () => {
        setStep('extracting');
        setIsProcessing(true);

        try {
            const formData = new FormData();
            
            if (uploadedFile) {
                formData.append('file', uploadedFile);
            } else if (urlInput) {
                formData.append('url', urlInput);
            }

            const response = await fetch('/api/extract-topics', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract topics');
            }

            setExtractedTopics(data.topics);
            setStep('select');
        } catch (error) {
            console.error('Error extracting topics:', error);
            alert(error instanceof Error ? error.message : 'Failed to extract topics. Please try again.');
            setStep('upload');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleTopic = (id: string) => {
        setExtractedTopics(prev =>
            prev.map(topic =>
                topic.id === id ? { ...topic, selected: !topic.selected } : topic
            )
        );
    };

    const selectedCount = extractedTopics.filter(t => t.selected).length;

    const getFileIcon = (fileName: string) => {
        if (fileName.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-400" />;
        if (fileName.endsWith('.docx')) return <FileType className="w-8 h-8 text-blue-400" />;
        return <File className="w-8 h-8 text-gray-400" />;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-400 bg-green-400/20';
            case 'medium': return 'text-amber-400 bg-amber-400/20';
            case 'hard': return 'text-red-400 bg-red-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    return (
        <div className="min-h-screen p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex-center">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Talk Through</h1>
                        <p className="text-secondary">Upload your notes and teach an AI student to master the concepts</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    {[
                        { num: 1, label: 'Upload', active: step === 'upload' },
                        { num: 2, label: 'Extract Topics', active: step === 'extracting' },
                        { num: 3, label: 'Select & Start', active: step === 'select' },
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center gap-3 ${s.active ? 'text-white' : 'text-secondary'}`}>
                                <div className={`w-10 h-10 rounded-full flex-center font-semibold ${s.active ? 'bg-gradient-to-br from-purple-500 to-cyan-500' :
                                        step === 'select' && s.num < 3 ? 'bg-green-500' : 'bg-white/10'
                                    }`}>
                                    {step === 'select' && s.num < 3 ? <CheckCircle className="w-5 h-5" /> : s.num}
                                </div>
                                <span className="hidden sm:block font-medium">{s.label}</span>
                            </div>
                            {i < 2 && (
                                <div className="w-16 sm:w-32 h-0.5 mx-4 bg-white/10 rounded">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded transition-all"
                                        style={{
                                            width: step === 'upload' ? '0%' :
                                                step === 'extracting' && i === 0 ? '100%' :
                                                    step === 'select' ? '100%' : '0%'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                {step === 'upload' && (
                    <div className="space-y-6">
                        {/* Upload Zone */}
                        <div
                            className={`card p-12 border-2 border-dashed transition-all cursor-pointer ${dragActive
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-white/20 hover:border-purple-500/50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <input
                                type="file"
                                id="file-input"
                                className="hidden"
                                accept=".pdf,.txt,.docx"
                                onChange={handleFileInput}
                            />

                            {uploadedFile ? (
                                <div className="flex items-center justify-center gap-4">
                                    {getFileIcon(uploadedFile.name)}
                                    <div>
                                        <div className="font-semibold">{uploadedFile.name}</div>
                                        <div className="text-sm text-secondary">
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUploadedFile(null);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                                    <p className="text-lg font-semibold mb-2">
                                        Drop your file here, or click to browse
                                    </p>
                                    <p className="text-secondary">
                                        Supports PDF, TXT, and DOCX files
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Or Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-secondary">or paste a link</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* URL Input */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex-center">
                                        <Youtube className="w-5 h-5 text-red-400" />
                                    </div>
                                    <span className="font-semibold">YouTube Video</span>
                                </div>
                                <input
                                    type="url"
                                    placeholder="Paste YouTube URL..."
                                    className="input"
                                    value={urlInput.includes('youtube') || urlInput.includes('youtu.be') ? urlInput : ''}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex-center">
                                        <LinkIcon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="font-semibold">Web Article</span>
                                </div>
                                <input
                                    type="url"
                                    placeholder="Paste article URL..."
                                    className="input"
                                    value={!urlInput.includes('youtube') && !urlInput.includes('youtu.be') ? urlInput : ''}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleExtractTopics}
                            disabled={!uploadedFile && !urlInput}
                            className="btn btn-primary btn-lg w-full glow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className="w-5 h-5" />
                            Extract Topics with AI
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 'extracting' && (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-center mx-auto mb-6 animate-pulse">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Analyzing Your Content...</h2>
                        <p className="text-secondary mb-6">
                            Our AI is reading through your material and extracting key topics for you to teach.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-purple-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            This usually takes 5-10 seconds
                        </div>
                    </div>
                )}

                {step === 'select' && (
                    <div className="space-y-6">
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Select Topics to Teach</h2>
                                    <p className="text-secondary">
                                        Choose which topics you want to teach. The AI will quiz you on them.
                                    </p>
                                </div>
                                <div className="badge badge-primary">
                                    {selectedCount} selected
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {extractedTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => toggleTopic(topic.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${topic.selected
                                                ? 'bg-purple-500/20 border border-purple-500/50'
                                                : 'bg-white/5 border border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex-center transition-all ${topic.selected
                                                    ? 'bg-purple-500 border-purple-500'
                                                    : 'border-white/30'
                                                }`}>
                                                {topic.selected && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="font-medium">{topic.name}</span>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getDifficultyColor(topic.difficulty)}`}>
                                            {topic.difficulty}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Persona Selection */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Choose AI Persona</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {[
                                    { id: 'curious', name: 'Curious Freshman', desc: 'Asks basic but insightful questions', level: 'Easy' },
                                    { id: 'skeptical', name: 'Skeptical Senior', desc: 'Challenges your explanations', level: 'Medium' },
                                    { id: 'devil', name: "Devil's Advocate", desc: 'Argues against everything', level: 'Hard' },
                                ].map((persona) => (
                                    <div
                                        key={persona.id}
                                        onClick={() => setSelectedPersona(persona.id)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${selectedPersona === persona.id
                                                ? 'bg-purple-500/20 border-2 border-purple-500'
                                                : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">{persona.name}</div>
                                        <div className="text-sm text-secondary mb-2">{persona.desc}</div>
                                        <div className={`text-xs inline-block px-2 py-1 rounded ${getDifficultyColor(persona.level.toLowerCase())}`}>
                                            {persona.level}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Session Button */}
                        <Link
                            href={`/session/new?topics=${encodeURIComponent(JSON.stringify(extractedTopics.filter(t => t.selected)))}&persona=${selectedPersona}`}
                            className="btn btn-primary btn-lg w-full glow"
                        >
                            Start Teaching Session
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
