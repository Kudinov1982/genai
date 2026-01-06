import React, { useState, useRef, useEffect } from 'react';
import { CategoryType, Post, ShowcaseItem, Attachment } from '../types';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, PenTool, LayoutTemplate, Code, Terminal, Sparkles, Variable, Type, ChevronDown, FileAudio, FileText, Paperclip, Plus, Wand2, Monitor, Link as LinkIcon, FileType } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useClickOutside, FormSelect, Tooltip } from './ModernUI';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadPost: (newPost: Post) => void;
  onUploadShowcase: (newItem: ShowcaseItem) => void;
  initialPrompt?: string;
}

const POPULAR_MODELS = [
    "Gemini 1.5 Pro",
    "Gemini 1.5 Flash",
    "Gemini 2.5 Flash",
    "GPT-4o",
    "GPT-4o mini",
    "Claude 3.5 Sonnet",
    "Claude 3 Opus",
    "Midjourney v6",
    "Stable Diffusion XL",
    "Flux.1",
    "Whisper v3",
    "DeepL",
    "YandexGPT 3"
];

// --- Helper Components ---

const RichMediaInput = ({ 
    label, 
    textValue, 
    onTextChange, 
    attachments, 
    onAttachmentsChange, 
    placeholder,
    minHeight = "min-h-[80px]"
}: { 
    label: string, 
    textValue: string, 
    onTextChange: (val: string) => void, 
    attachments: Attachment[],
    onAttachmentsChange: (vals: Attachment[]) => void,
    placeholder: string,
    minHeight?: string
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length === 0) return;

        const newAttachments: Attachment[] = [];
        let processedCount = 0;

        files.forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                let type: Attachment['type'] = 'document';
                if (file.type.startsWith('image/')) type = 'image';
                else if (file.type.startsWith('audio/')) type = 'audio';

                newAttachments.push({
                    id: Date.now().toString() + Math.random().toString(),
                    type,
                    url: reader.result as string,
                    name: file.name,
                    size: file.size
                });

                processedCount++;
                if (processedCount === files.length) {
                    onAttachmentsChange([...attachments, ...newAttachments]);
                }
            };
            reader.readAsDataURL(file);
        });
        
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (id: string) => {
        onAttachmentsChange(attachments.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-2 group">
            <div className="flex justify-between items-center">
                 <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">{label}</label>
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-accent-600 hover:text-accent-700 uppercase tracking-wide flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                    <Paperclip className="w-3 h-3"/> Прикрепить файл
                 </button>
            </div>
            
            <div className={`
                border border-paper-300 bg-white rounded-xl transition-all duration-200
                focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/10 focus-within:shadow-md hover:border-ink-300
                flex flex-col
            `}>
                
                {/* Text Input Area */}
                <textarea
                    value={textValue}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-transparent border-none text-sm p-4 focus:ring-0 outline-none font-serif resize-none text-ink-800 placeholder:text-ink-300 ${minHeight}`}
                />

                {/* Attachments Area */}
                {(attachments.length > 0) && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {attachments.map((att) => (
                            <div key={att.id} className="relative group/att flex items-center gap-2 bg-paper-50 border border-paper-200 pl-1.5 pr-8 py-1.5 rounded-lg shadow-sm">
                                {att.type === 'image' && (
                                    <div className="w-8 h-8 rounded-md bg-paper-200 overflow-hidden flex-shrink-0 border border-paper-300">
                                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {att.type === 'audio' && (
                                    <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
                                        <FileAudio className="w-4 h-4 text-purple-600" />
                                    </div>
                                )}
                                {att.type === 'document' && (
                                     <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                                
                                <div className="flex flex-col overflow-hidden max-w-[140px]">
                                    <span className="text-xs font-bold text-ink-700 truncate font-sans">{att.name}</span>
                                    <span className="text-[9px] text-ink-400 uppercase font-sans tracking-wide">{att.type}</span>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => removeAttachment(att.id)}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*,audio/mpeg,audio/ogg,audio/wav,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain" 
                    onChange={handleFileChange} 
                />
            </div>
        </div>
    );
};

const PromptEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Simple syntax highlighter logic
    const getHighlightedText = (text: string) => {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Highlight XML tags <...>
            .replace(/(&lt;\/?[a-zA-Z0-9_]+&gt;)/g, '<span class="text-blue-600 font-bold">$1</span>')
            // Highlight Variables {{...}}
            .replace(/(\{\{[^}]+\}\})/g, '<span class="text-green-600 font-bold">$1</span>')
            // Highlight Markdown Bold **...**
            .replace(/(\*\*[^*]+\*\*)/g, '<span class="text-accent-600 font-bold">$1</span>')
            // Highlight Markdown Headers # ...
            .replace(/(^|\n)(#+\s.*)/g, '$1<span class="text-purple-700 font-bold">$2</span>');
    };

    const insertText = (textToInsert: string) => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const newValue = value.substring(0, start) + textToInsert + value.substring(end);
            onChange(newValue);
            
            // Restore focus and cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + textToInsert.length;
                }
            }, 0);
        }
    };

    return (
        <div className="border border-paper-300 bg-white rounded-xl overflow-hidden focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/10 transition-all shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-paper-50 border-b border-paper-200 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase text-ink-400 tracking-widest mr-2 select-none">Вставка:</span>
                <Tooltip content="Вставить блок изображения">
                    <button type="button" onClick={() => insertText('<image>\n{{IMAGE}}\n</image>')} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-white border border-paper-200 hover:border-blue-400 text-blue-700 rounded-lg whitespace-nowrap transition-colors shadow-sm">
                        <Code className="w-3 h-3" /> Image Block
                    </button>
                </Tooltip>
                <Tooltip content="Вставить блок для анализа">
                    <button type="button" onClick={() => insertText('<scratchpad>\n\n</scratchpad>')} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-white border border-paper-200 hover:border-purple-400 text-purple-700 rounded-lg whitespace-nowrap transition-colors shadow-sm">
                        <Terminal className="w-3 h-3" /> Scratchpad
                    </button>
                </Tooltip>
                 <Tooltip content="Вставить переменную">
                     <button type="button" onClick={() => insertText('{{VARIABLE}}')} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-white border border-paper-200 hover:border-green-400 text-green-700 rounded-lg whitespace-nowrap transition-colors shadow-sm">
                        <Variable className="w-3 h-3" /> Variable
                    </button>
                 </Tooltip>
                <Tooltip content="Жирный шрифт">
                    <button type="button" onClick={() => insertText('**Important**')} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-white border border-paper-200 hover:border-accent-400 text-accent-700 rounded-lg whitespace-nowrap transition-colors shadow-sm">
                        <Type className="w-3 h-3" /> Bold
                    </button>
                </Tooltip>
            </div>

            {/* Editor Area */}
            <div className="relative min-h-[200px] w-full font-mono text-sm leading-relaxed">
                {/* Backdrop for highlighting */}
                <pre 
                    className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words text-transparent bg-transparent z-0 overflow-hidden"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: getHighlightedText(value) + '<br/>' }} 
                />
                
                {/* Actual Input */}
                <textarea
                    ref={textareaRef}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="relative z-10 w-full h-full min-h-[200px] p-4 bg-transparent text-ink-900 caret-ink-900 focus:outline-none resize-y whitespace-pre-wrap break-words placeholder:text-ink-300"
                    style={{ backgroundColor: 'transparent' }} /* Ensure transparency so backdrop shows */
                    placeholder="Введите системный промт..."
                    spellCheck={false}
                />
            </div>
             <div className="px-3 py-1.5 bg-paper-50 border-t border-paper-200 text-[10px] text-ink-400 flex justify-between font-mono">
                <span>Markdown & XML supported</span>
                <span>{value.length} chars</span>
            </div>
        </div>
    );
};

// --- Main Modal Component ---

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadPost, onUploadShowcase, initialPrompt = '' }) => {
  const [activeTab, setActiveTab] = useState<'post' | 'showcase'>('post');
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.TRANSCRIPTION);
  
  // Model Combo Box State
  const [modelName, setModelName] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelInputRef = useRef<HTMLDivElement>(null);
  useClickOutside(modelInputRef, () => setIsModelDropdownOpen(false));

  const [prompt, setPrompt] = useState(initialPrompt);
  
  // Updated Inputs for Attachments
  const [inputContent, setInputContent] = useState('');
  const [inputAttachments, setInputAttachments] = useState<Attachment[]>([]);
  
  const [outputContent, setOutputContent] = useState('');
  // We can add outputAttachments later if needed, but for now reuse simple logic for output text
  
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Showcase
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [projectTags, setProjectTags] = useState('');

  useEffect(() => {
    if (isOpen && initialPrompt) {
        setPrompt(initialPrompt);
        setActiveTab('post');
    }
  }, [isOpen, initialPrompt]);

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    if (!process.env.API_KEY) {
        alert("API Key не установлен.");
        return;
    }
    setIsEnhancing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Improve this genealogy prompt (keep it concise, russian): "${prompt}"`,
        });
        if (response.text) setPrompt(response.text.trim());
    } catch (e) {
        console.error(e);
    } finally {
        setIsEnhancing(false);
    }
  };

  const filteredModels = POPULAR_MODELS.filter(m => 
      m.toLowerCase().includes(modelName.toLowerCase())
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'post') {
        onUploadPost({
            id: Date.now().toString(),
            title,
            author: 'CurrentUser',
            category,
            modelName,
            prompt,
            inputContent,
            inputAttachments, // Pass the attachments
            outputContent,
            reviews: [],
            createdAt: new Date().toISOString()
        });
    } else {
        onUploadShowcase({
            id: Date.now().toString(),
            title: projectTitle,
            description: projectDesc,
            url: projectUrl,
            imageUrl: projectImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            author: 'CurrentUser',
            tags: projectTags.split(',').map(t => t.trim()).filter(Boolean),
            createdAt: new Date().toISOString()
        });
    }
    onClose();
  };

  const categoryOptions = Object.values(CategoryType).map(c => ({
      label: c,
      value: c
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-50 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border border-white/20 ring-1 ring-black/5">
        
        {/* Header with decorative top bar */}
        <div className="relative bg-white z-10 shrink-0">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ink-800 via-accent-600 to-ink-800"></div>
          <div className="flex justify-between items-center px-8 py-5 border-b border-paper-200">
            <div>
              <h2 className="text-2xl font-display font-bold text-ink-900">Новая запись</h2>
              <p className="text-sm text-ink-500 font-serif">Поделитесь своим открытием или инструментом</p>
            </div>
            <Tooltip content="Закрыть (Esc)">
              <button onClick={onClose} className="p-2 hover:bg-paper-100 rounded-full transition-colors text-ink-400 hover:text-ink-900">
                  <X className="w-6 h-6" />
              </button>
            </Tooltip>
          </div>

          {/* Styled Segmented Tabs */}
          <div className="px-8 pb-0 mt-4">
              <div className="flex bg-paper-100/80 p-1.5 rounded-xl gap-1">
                  <button
                      onClick={() => setActiveTab('post')}
                      className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${activeTab === 'post' ? 'bg-white text-ink-900 shadow-sm ring-1 ring-black/5' : 'text-ink-500 hover:text-ink-700 hover:bg-white/50'}`}
                  >
                      <Wand2 className="w-4 h-4"/>
                      Результат ИИ
                  </button>
                  <button
                      onClick={() => setActiveTab('showcase')}
                      className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${activeTab === 'showcase' ? 'bg-white text-ink-900 shadow-sm ring-1 ring-black/5' : 'text-ink-500 hover:text-ink-700 hover:bg-white/50'}`}
                  >
                      <LayoutTemplate className="w-4 h-4"/>
                      Проект / Инструмент
                  </button>
              </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-8 py-6 space-y-8 bg-paper-50 scrollbar-thin">
          {activeTab === 'post' ? (
              <div className="space-y-8">
                {/* Section 1: Main Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-paper-200/60 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Заголовок</label>
                            <input 
                                required 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                className="w-full px-4 py-3 border border-paper-300 rounded-xl bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all placeholder:text-ink-300 text-ink-900 font-display font-bold" 
                                placeholder="Название эксперимента..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Категория</label>
                            <FormSelect 
                                options={categoryOptions}
                                value={category}
                                onChange={(val) => setCategory(val as CategoryType)}
                                className="h-[50px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2" ref={modelInputRef}>
                        <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">ИИ Модель</label>
                        <div className="relative">
                            <input 
                                required 
                                type="text" 
                                value={modelName} 
                                onChange={(e) => {
                                    setModelName(e.target.value);
                                    setIsModelDropdownOpen(true);
                                }}
                                onFocus={() => setIsModelDropdownOpen(true)}
                                className={`w-full px-4 py-3 border rounded-xl outline-none pr-10 transition-all font-sans ${isModelDropdownOpen ? 'bg-white border-accent-500 ring-4 ring-accent-500/10' : 'bg-white border-paper-300 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10'}`}
                                placeholder="Выберите модель или впишите свою..."
                            />
                            <ChevronDown className={`w-4 h-4 text-ink-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                            
                            {/* Autocomplete Dropdown */}
                            {isModelDropdownOpen && (
                                <div className="absolute z-20 w-full mt-2 bg-white border border-paper-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-slide-up scrollbar-thin">
                                    {filteredModels.length > 0 ? (
                                        <ul className="py-2">
                                            {filteredModels.map((m) => (
                                                <li 
                                                    key={m}
                                                    onClick={() => {
                                                        setModelName(m);
                                                        setIsModelDropdownOpen(false);
                                                    }}
                                                    className="px-4 py-2.5 hover:bg-paper-50 cursor-pointer text-sm text-ink-700 flex items-center justify-between group"
                                                >
                                                    <span className="group-hover:text-ink-900 font-medium">{m}</span>
                                                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-accent-500"/>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-3 text-xs text-ink-400 italic">
                                            Нажмите Enter, чтобы добавить новую модель
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Prompt */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Системный Промт</label>
                        <button type="button" onClick={enhancePrompt} disabled={isEnhancing || !prompt} className="text-[10px] bg-white border border-paper-200 px-3 py-1.5 rounded-full text-accent-600 hover:text-accent-700 hover:border-accent-200 hover:bg-accent-50 flex items-center font-bold uppercase disabled:opacity-50 transition-all shadow-sm">
                            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin mr-1.5"/> : <Sparkles className="w-3 h-3 mr-1.5"/>}
                            Улучшить с AI
                        </button>
                    </div>
                    <PromptEditor value={prompt} onChange={setPrompt} />
                </div>

                {/* Section 3: Content (Input/Output) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1 px-1">
                             <div className="bg-paper-200 text-ink-600 p-1 rounded">
                                 <Monitor className="w-3 h-3" />
                             </div>
                             <span className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Input</span>
                        </div>
                        <RichMediaInput 
                            label=""
                            textValue={inputContent} 
                            onTextChange={setInputContent} 
                            attachments={inputAttachments}
                            onAttachmentsChange={setInputAttachments}
                            placeholder="Вставьте исходный текст или загрузите файлы..."
                            minHeight="min-h-[140px]"
                        />
                    </div>
                    
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 mb-1 px-1">
                             <div className="bg-accent-100 text-accent-700 p-1 rounded">
                                 <FileType className="w-3 h-3" />
                             </div>
                             <span className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Output</span>
                        </div>
                         <textarea
                            value={outputContent}
                            onChange={(e) => setOutputContent(e.target.value)}
                            placeholder="Результат работы модели..."
                            className="w-full px-4 py-4 bg-white border border-paper-300 rounded-xl text-sm focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none h-full min-h-[140px] font-serif resize-none text-ink-800 placeholder:text-ink-300 shadow-sm transition-all hover:border-ink-300"
                        />
                    </div>
                </div>
              </div>
          ) : (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-paper-200/60 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Название проекта</label>
                    <input required type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="w-full px-4 py-3 border border-paper-300 rounded-xl bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all placeholder:text-ink-300 font-display font-bold text-lg" placeholder="Например: RetroScan AI"/>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Описание</label>
                    <textarea required value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} rows={4} className="w-full px-4 py-3 border border-paper-300 rounded-xl bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all placeholder:text-ink-300 font-serif resize-none" placeholder="Краткое описание функционала и пользы..."/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Ссылка на проект</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                            <input required type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-paper-300 rounded-xl bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all placeholder:text-ink-300 font-mono text-sm" placeholder="https://..."/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Обложка (URL)</label>
                         <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                            <input 
                                type="text" 
                                value={projectImage} 
                                onChange={(e) => setProjectImage(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border border-paper-300 rounded-xl bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all placeholder:text-ink-300 text-sm"
                                placeholder="https://... (изображение)"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-ink-500 tracking-wide font-sans">Теги</label>
                    <input type="text" value={projectTags} onChange={(e) => setProjectTags(e.target.value)} className="w-full px-4 py-3 border border-paper-300 rounded-xl bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all placeholder:text-ink-300 text-sm" placeholder="Python, Telegram, Open Source (через запятую)"/>
                </div>
              </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-paper-200 bg-white flex justify-end gap-4 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-ink-500 hover:text-ink-800 font-bold uppercase text-xs tracking-widest hover:bg-paper-100 rounded-lg transition-colors"
            >
                Отмена
            </button>
            <Tooltip content="Опубликовать в общую ленту">
                <button 
                    onClick={handleSubmit}
                    type="submit" 
                    className="px-8 py-2.5 bg-ink-900 text-white font-bold uppercase text-xs tracking-widest hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-lg flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> 
                  Опубликовать
                </button>
            </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;