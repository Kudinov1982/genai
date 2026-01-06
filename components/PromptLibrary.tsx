import React, { useState } from 'react';
import { PROMPT_LIBRARY } from '../constants';
import { CategoryType } from '../types';
import { Copy, Check, Play, ArrowLeft, Bookmark, ThumbsUp, ThumbsDown, ArrowDownWideNarrow } from 'lucide-react';
import { Tooltip } from './ModernUI';

interface PromptLibraryProps {
    onUsePrompt: (prompt: string) => void;
    onBack: () => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onUsePrompt, onBack }) => {
    const [filterCategory, setFilterCategory] = useState<CategoryType | 'All'>('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    
    // Sort State
    const [sortBy, setSortBy] = useState<'default' | 'helpful'>('default');

    // Mock Voting State (Since we don't have a backend)
    const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleVote = (id: string, type: 'up' | 'down') => {
        setUserVotes(prev => {
            const currentVote = prev[id];
            // Toggle off if clicking the same vote again
            if (currentVote === type) {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            }
            // Otherwise set new vote
            return { ...prev, [id]: type };
        });
    };

    const sortedPrompts = [...PROMPT_LIBRARY].sort((a, b) => {
        if (sortBy === 'helpful') {
            const scoreA = (a.helpful + (userVotes[a.id] === 'up' ? 1 : 0)) - (a.notHelpful + (userVotes[a.id] === 'down' ? 1 : 0));
            const scoreB = (b.helpful + (userVotes[b.id] === 'up' ? 1 : 0)) - (b.notHelpful + (userVotes[b.id] === 'down' ? 1 : 0));
            return scoreB - scoreA;
        }
        // Default sort (by ID/Definition order roughly)
        return 0;
    });

    const filteredPrompts = sortedPrompts.filter(p => 
        filterCategory === 'All' || p.category === filterCategory
    );

    return (
        <div className="animate-fade-in">
             <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
                 <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-900 tracking-tight">Архив Промтов</h2>
                    <p className="text-ink-500 mt-2 font-serif text-lg">Коллекция проверенных шаблонов для запросов к ИИ.</p>
                 </div>
                 
                 <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    {/* Sort Control */}
                    <button 
                        onClick={() => setSortBy(sortBy === 'default' ? 'helpful' : 'default')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-lg border transition-colors ${
                            sortBy === 'helpful' 
                            ? 'bg-accent-50 text-accent-700 border-accent-200' 
                            : 'bg-white text-ink-500 border-paper-200 hover:border-ink-300'
                        }`}
                    >
                        <ArrowDownWideNarrow className="w-4 h-4" />
                        {sortBy === 'helpful' ? 'Сортировка: По пользе' : 'Сортировка: По умолчанию'}
                    </button>

                    <div className="flex gap-2 flex-wrap justify-end">
                        <button
                            onClick={() => setFilterCategory('All')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors border ${filterCategory === 'All' ? 'bg-ink-800 text-white border-ink-800 shadow-md' : 'bg-white text-ink-600 border-paper-300 hover:bg-paper-50'}`}
                        >
                            Все
                        </button>
                        {Object.values(CategoryType).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors border ${filterCategory === cat ? 'bg-ink-800 text-white border-ink-800 shadow-md' : 'bg-white text-ink-600 border-paper-300 hover:bg-paper-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => {
                    const userVote = userVotes[prompt.id];
                    const currentHelpful = prompt.helpful + (userVote === 'up' ? 1 : 0);
                    const currentNotHelpful = prompt.notHelpful + (userVote === 'down' ? 1 : 0);

                    return (
                        <div key={prompt.id} className="bg-white p-6 border border-paper-300 rounded-xl shadow-sm relative group hover:border-accent-400 hover:shadow-md transition-all flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4 mt-1">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-ink-400 font-sans">{prompt.category}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border font-sans ${
                                    prompt.difficulty === 'Новичок' ? 'border-green-200 text-green-700 bg-green-50' :
                                    prompt.difficulty === 'Продвинутый' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                    'border-red-200 text-red-700 bg-red-50'
                                }`}>
                                    {prompt.difficulty}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-display font-bold text-ink-900 mb-3 leading-tight group-hover:text-accent-700 transition-colors">{prompt.title}</h3>
                            
                            <div className="flex-1 mb-4">
                                <div className="bg-paper-50 p-4 border border-paper-200 rounded-lg h-64 overflow-y-auto">
                                    <p className="text-xs font-mono text-ink-600 leading-relaxed whitespace-pre-wrap">
                                        {prompt.text}
                                    </p>
                                </div>
                            </div>

                            {/* Voting Section */}
                            <div className="flex items-center gap-4 mb-4 border-t border-b border-paper-100 py-2">
                                <span className="text-[10px] uppercase font-bold text-ink-400">Полезно?</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleVote(prompt.id, 'up')}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                            userVote === 'up' ? 'text-green-600' : 'text-ink-500 hover:text-green-600'
                                        }`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-current' : ''}`} />
                                        <span>{currentHelpful}</span>
                                    </button>
                                    
                                    <div className="w-px h-4 bg-paper-300"></div>

                                    <button 
                                        onClick={() => handleVote(prompt.id, 'down')}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                            userVote === 'down' ? 'text-red-500' : 'text-ink-400 hover:text-red-500'
                                        }`}
                                    >
                                        <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
                                        <span>{currentNotHelpful}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto pt-2">
                                <Tooltip content={copiedId === prompt.id ? "Скопировано!" : "Копировать текст"} className="w-full">
                                    <button 
                                        onClick={() => handleCopy(prompt.text, prompt.id)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm group/btn ${
                                            copiedId === prompt.id 
                                            ? 'bg-green-50 border-green-200 text-green-700' 
                                            : 'bg-white border-paper-300 text-ink-700 hover:border-ink-400 hover:bg-paper-50'
                                        }`}
                                    >
                                        {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-ink-400 group-hover/btn:text-ink-700 transition-colors" />}
                                        <span className="text-xs font-bold uppercase tracking-wide">{copiedId === prompt.id ? 'Скопировано' : 'Копировать промт'}</span>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PromptLibrary;