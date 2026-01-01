'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Brain,
    Upload,
    FileText,
    X,
    CheckCircle,
    Loader2,
    ArrowLeft,
    ArrowRight,
    Sparkles,
} from 'lucide-react';

interface ExtractedTopic {
    id: string;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    selected: boolean;
}

export default function UploadPage() {
    const router = useRouter();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'upload' | 'extracting' | 'select'>('upload');
    const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
    const [selectedPersona, setSelectedPersona] = useState('curious');
    const [error, setError] = useState<string>('');
    const [extractedContent, setExtractedContent] = useState<string>(''); // Store content for session

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
            setUploadedFile(file);
            setError('');
        } else {
            setError('Please upload a PDF, TXT, or DOCX file');
        }
    };

    const handleExtractTopics = async () => {
        if (!uploadedFile) {
            setError('Please select a file first');
            return;
        }

        setStep('extracting');
        setIsProcessing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            console.log('Uploading file:', uploadedFile.name);

            const response = await fetch('/api/extract-topics-simple', {
                method: 'POST',
                body: formData,
            });

            console.log('Response status:', response.status);
            console.log('Response content-type:', response.headers.get('content-type'));

            const text = await response.text();
            console.log('Raw response:', text.substring(0, 500));

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                throw new Error('Server returned invalid data. Check console for details.');
            }

            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            if (!data.topics || !Array.isArray(data.topics)) {
                throw new Error('Invalid response format from server');
            }

            setExtractedTopics(data.topics);
            setExtractedContent(data.content || ''); // Store the content
            setStep('select');
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process file');
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

    const handleStartSession = async () => {
        const selectedTopics = extractedTopics.filter(t => t.selected);
        if (selectedTopics.length === 0) return;

        setIsProcessing(true);
        try {
            // Create session with selected topics
            const response = await fetch('/api/session/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topics: selectedTopics.map(t => t.name),
                    persona: selectedPersona,
                    fileName: uploadedFile?.name || 'Uploaded content',
                    content: extractedContent // Pass the actual content
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create session');
            }

            // Redirect to the session page with topics AND content
            const topicsParam = encodeURIComponent(JSON.stringify(selectedTopics));
            const contentParam = encodeURIComponent(extractedContent.substring(0, 3000)); // Limit URL size
            router.push(`/session/${data.sessionId}?topics=${topicsParam}&persona=${selectedPersona}&content=${contentParam}`);
        } catch (err) {
            console.error('Session creation error:', err);
            alert(err instanceof Error ? err.message : 'Failed to create session');
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedCount = extractedTopics.filter(t => t.selected).length;

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
                        <h1 className="text-3xl font-bold">Upload & Learn</h1>
                        <p className="text-secondary">Upload your notes and extract topics to teach</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                {step === 'upload' && (
                    <div className="space-y-6">
                        <div className="card p-12 text-center">
                            <input
                                type="file"
                                id="file-input"
                                className="hidden"
                                accept=".pdf,.txt,.docx"
                                onChange={handleFileInput}
                            />

                            {uploadedFile ? (
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <FileText className="w-8 h-8 text-blue-400" />
                                    <div className="text-left">
                                        <div className="font-semibold">{uploadedFile.name}</div>
                                        <div className="text-sm text-secondary">
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUploadedFile(null)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => document.getElementById('file-input')?.click()}
                                    className="cursor-pointer"
                                >
                                    <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                                    <p className="text-xl font-semibold mb-2">
                                        Click to upload a file
                                    </p>
                                    <p className="text-secondary">
                                        Supports PDF, TXT, and DOCX files (max 10MB)
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleExtractTopics}
                            disabled={!uploadedFile || isProcessing}
                            className="btn btn-primary btn-lg w-full glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            Our AI is reading through your material and extracting key topics.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-purple-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            This usually takes 5-15 seconds
                        </div>
                    </div>
                )}

                {step === 'select' && (
                    <div className="space-y-6">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Select Topics to Teach</h2>
                                    <p className="text-secondary text-sm">
                                        Choose which topics you want to teach
                                    </p>
                                </div>
                                <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                                    {selectedCount} selected
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {extractedTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => toggleTopic(topic.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${topic.selected
                                                ? 'bg-purple-500/20 border-2 border-purple-500/50'
                                                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded border-2 flex-center transition-all ${topic.selected
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

                        <div className="card p-6">
                            <h3 className="text-lg font-semibold mb-4">Choose AI Persona</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {[
                                    { id: 'curious', name: 'Curious', desc: 'Asks basic questions' },
                                    { id: 'challenging', name: 'Challenging', desc: 'Tests your knowledge' },
                                    { id: 'supportive', name: 'Supportive', desc: 'Encourages learning' },
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
                                        <div className="text-sm text-secondary">{persona.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleStartSession}
                            disabled={selectedCount === 0}
                            className="btn btn-primary btn-lg w-full glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Start Teaching Session
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
