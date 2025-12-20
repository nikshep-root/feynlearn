'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Brain,
    Upload,
    FileText,
    Link as LinkIcon,
    X,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    FileType,
    File,
    BookOpen,
    Loader2,
    GraduationCap,
    Lightbulb,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    BookMarked,
    Zap,
    RotateCcw,
    Star
} from 'lucide-react';

interface KeyConcept {
    term: string;
    definition: string;
}

interface Section {
    heading: string;
    content: string;
    keyPoints: string[];
}

interface Flashcard {
    question: string;
    answer: string;
}

interface PracticeQuestion {
    question: string;
    hint: string;
}

interface Notes {
    title: string;
    summary: string;
    keyConcepts: KeyConcept[];
    sections: Section[];
    flashcards: Flashcard[];
    practiceQuestions: PracticeQuestion[];
    mnemonics: string[];
    realWorldExamples: string[];
    originalTitle: string;
    generatedAt: string;
}

export default function LearnFirstPage() {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'upload' | 'generating' | 'study'>('upload');
    const [notes, setNotes] = useState<Notes | null>(null);
    const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'practice'>('notes');
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
    const [currentFlashcard, setCurrentFlashcard] = useState(0);
    const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
    const [copiedConcept, setCopiedConcept] = useState<string | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    const handleGenerateNotes = async () => {
        setStep('generating');
        setIsProcessing(true);

        try {
            const formData = new FormData();
            
            if (uploadedFile) {
                formData.append('file', uploadedFile);
            } else if (urlInput) {
                formData.append('url', urlInput);
            }

            const response = await fetch('/api/generate-notes', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate notes');
            }

            setNotes(data.notes);
            setStep('study');
        } catch (error) {
            console.error('Error generating notes:', error);
            alert(error instanceof Error ? error.message : 'Failed to generate notes. Please try again.');
            setStep('upload');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleSection = (index: number) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const copyToClipboard = (text: string, term: string) => {
        navigator.clipboard.writeText(text);
        setCopiedConcept(term);
        setTimeout(() => setCopiedConcept(null), 2000);
    };

    const getFileIcon = (fileName: string) => {
        if (fileName.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-400" />;
        if (fileName.endsWith('.docx')) return <FileType className="w-8 h-8 text-blue-400" />;
        return <File className="w-8 h-8 text-gray-400" />;
    };

    const startTeaching = () => {
        if (!notes) return;
        
        // Create topics from key concepts for teaching session
        const topics = notes.keyConcepts.slice(0, 4).map((concept, i) => ({
            id: String(i + 1),
            name: concept.term,
            difficulty: i < 2 ? 'easy' : 'medium',
            selected: true
        }));
        
        const encodedTopics = encodeURIComponent(JSON.stringify(topics));
        window.location.href = `/session/new?topics=${encodedTopics}&persona=curious`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
            {/* Header */}
            <div className="glass border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Learn First</h1>
                                <p className="text-sm text-secondary">Study before you teach</p>
                            </div>
                        </div>
                    </div>

                    {step === 'study' && (
                        <button onClick={startTeaching} className="btn btn-primary">
                            <GraduationCap className="w-4 h-4" />
                            Start Teaching
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Steps */}
            {step !== 'study' && (
                <div className="max-w-4xl mx-auto p-6">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {[
                            { num: 1, label: 'Upload Material', active: step === 'upload' },
                            { num: 2, label: 'Generate Notes', active: step === 'generating' },
                            { num: 3, label: 'Study & Learn', active: false },
                        ].map((s, i) => (
                            <div key={s.num} className="flex items-center">
                                <div className={`flex items-center gap-2 ${s.active ? 'text-white' : 'text-secondary'}`}>
                                    <div className={`w-8 h-8 rounded-full flex-center text-sm font-semibold ${
                                        s.active ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                        (step === 'generating' && s.num === 1) ? 'bg-green-500' : 'bg-white/10'
                                    }`}>
                                        {s.num}
                                    </div>
                                    <span className="hidden sm:block text-sm">{s.label}</span>
                                </div>
                                {i < 2 && <div className="w-12 sm:w-20 h-0.5 mx-2 bg-white/10" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Step */}
            {step === 'upload' && (
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    {/* Info Card */}
                    <div className="card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex-center shrink-0">
                                <Lightbulb className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">How Learn First Works</h3>
                                <p className="text-secondary text-sm">
                                    Upload your study material and our AI will create comprehensive notes, flashcards, and practice questions.
                                    Study at your own pace, then test your understanding by teaching an AI student!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Zone */}
                    <div
                        className={`card p-12 border-2 border-dashed transition-all cursor-pointer ${
                            dragActive ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-green-500/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('learn-file-input')?.click()}
                    >
                        <input
                            type="file"
                            id="learn-file-input"
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
                                <Upload className="w-12 h-12 mx-auto mb-4 text-green-400" />
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
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex-center">
                                <LinkIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="font-semibold">Web Article or Resource</span>
                        </div>
                        <input
                            type="url"
                            placeholder="Paste any URL to learn from..."
                            className="input w-full"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerateNotes}
                        disabled={!uploadedFile && !urlInput}
                        className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                        <Sparkles className="w-5 h-5" />
                        Generate Study Notes
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Generating Step */}
            {step === 'generating' && (
                <div className="max-w-4xl mx-auto p-6">
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex-center mx-auto mb-6 animate-pulse">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Creating Your Study Notes...</h2>
                        <p className="text-secondary mb-6">
                            Our AI is analyzing your content and generating comprehensive notes, flashcards, and practice questions.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-green-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            This usually takes 10-15 seconds
                        </div>
                    </div>
                </div>
            )}

            {/* Study Step */}
            {step === 'study' && notes && (
                <div className="max-w-6xl mx-auto p-4 sm:p-6">
                    {/* Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{notes.title}</h2>
                        <p className="text-secondary">{notes.summary}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {[
                            { id: 'notes', label: 'Study Notes', icon: BookOpen },
                            { id: 'flashcards', label: 'Flashcards', icon: Zap },
                            { id: 'practice', label: 'Practice', icon: HelpCircle },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/5 text-secondary hover:bg-white/10'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Sections */}
                                {notes.sections.map((section, index) => (
                                    <div key={index} className="card">
                                        <button
                                            onClick={() => toggleSection(index)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <h3 className="font-semibold text-left">{section.heading}</h3>
                                            {expandedSections.has(index) ? (
                                                <ChevronUp className="w-5 h-5 text-secondary" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-secondary" />
                                            )}
                                        </button>
                                        
                                        {expandedSections.has(index) && (
                                            <div className="px-4 pb-4 space-y-4">
                                                <p className="text-secondary leading-relaxed">{section.content}</p>
                                                
                                                {section.keyPoints.length > 0 && (
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <h4 className="text-sm font-medium text-green-400 mb-2">Key Points</h4>
                                                        <ul className="space-y-2">
                                                            {section.keyPoints.map((point, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                                    <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                                                    {point}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Real World Examples */}
                                {notes.realWorldExamples.length > 0 && (
                                    <div className="card p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-amber-400" />
                                            Real World Examples
                                        </h3>
                                        <ul className="space-y-2">
                                            {notes.realWorldExamples.map((example, i) => (
                                                <li key={i} className="text-secondary text-sm bg-white/5 rounded-lg p-3">
                                                    {example}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">
                                {/* Key Concepts */}
                                <div className="card p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <BookMarked className="w-5 h-5 text-purple-400" />
                                        Key Concepts
                                    </h3>
                                    <div className="space-y-3">
                                        {notes.keyConcepts.map((concept, i) => (
                                            <div key={i} className="bg-white/5 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm text-green-400">{concept.term}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(`${concept.term}: ${concept.definition}`, concept.term)}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                    >
                                                        {copiedConcept === concept.term ? (
                                                            <Check className="w-3 h-3 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-secondary" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-secondary">{concept.definition}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mnemonics */}
                                {notes.mnemonics.length > 0 && (
                                    <div className="card p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-cyan-400" />
                                            Memory Aids
                                        </h3>
                                        <ul className="space-y-2">
                                            {notes.mnemonics.map((mnemonic, i) => (
                                                <li key={i} className="text-sm text-secondary bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                                                    💡 {mnemonic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Flashcards Tab */}
                    {activeTab === 'flashcards' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-4 text-secondary">
                                Card {currentFlashcard + 1} of {notes.flashcards.length}
                            </div>
                            
                            <div 
                                className="card p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
                                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                            >
                                {!showFlashcardAnswer ? (
                                    <>
                                        <HelpCircle className="w-12 h-12 text-purple-400 mb-4" />
                                        <p className="text-xl text-center">{notes.flashcards[currentFlashcard].question}</p>
                                        <p className="text-sm text-secondary mt-4">Click to reveal answer</p>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-12 h-12 text-green-400 mb-4" />
                                        <p className="text-xl text-center text-green-400">{notes.flashcards[currentFlashcard].answer}</p>
                                        <p className="text-sm text-secondary mt-4">Click to hide</p>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setCurrentFlashcard(prev => Math.max(0, prev - 1));
                                        setShowFlashcardAnswer(false);
                                    }}
                                    disabled={currentFlashcard === 0}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentFlashcard(0);
                                        setShowFlashcardAnswer(false);
                                    }}
                                    className="btn btn-ghost"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restart
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentFlashcard(prev => Math.min(notes.flashcards.length - 1, prev + 1));
                                        setShowFlashcardAnswer(false);
                                    }}
                                    disabled={currentFlashcard === notes.flashcards.length - 1}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Practice Tab */}
                    {activeTab === 'practice' && (
                        <div className="max-w-2xl mx-auto space-y-4">
                            <p className="text-secondary text-center mb-6">
                                Try to answer these questions before teaching. Click on a question to reveal the hint.
                            </p>
                            
                            {notes.practiceQuestions.map((pq, index) => (
                                <div key={index} className="card p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex-center shrink-0">
                                            <span className="text-sm font-semibold text-purple-400">{index + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium mb-2">{pq.question}</p>
                                            <details className="group">
                                                <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                                                    Show hint
                                                </summary>
                                                <p className="text-sm text-secondary mt-2 bg-white/5 rounded-lg p-3">
                                                    💡 {pq.hint}
                                                </p>
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="text-center pt-6">
                                <button onClick={startTeaching} className="btn btn-primary btn-lg">
                                    <GraduationCap className="w-5 h-5" />
                                    I&apos;m Ready to Teach!
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
