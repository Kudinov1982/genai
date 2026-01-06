import React, { useRef, useState, useEffect } from 'react';
import { Post, CategoryType } from '../types';
import { X, Download, Share2, Feather, CheckCircle2, Loader2, Image as ImageIcon, FileText, Sparkles, User, Terminal, Star } from 'lucide-react';
import { toPng } from 'html-to-image';
import StarRating from './StarRating';

interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontStyles, setFontStyles] = useState<string>('');
  
  // Pre-load and inline fonts as base64 to avoid CORS/cssRules errors in html-to-image
  useEffect(() => {
    if (isOpen && !fontStyles) {
        const loadFonts = async () => {
            try {
                const fontUrl = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap";
                const response = await fetch(fontUrl);
                let css = await response.text();
                
                // Find all unique font URLs in the CSS
                const urlMatches = css.match(/url\(([^)]+)\)/g) || [];
                const uniqueUrls = new Set(urlMatches.map(u => u.replace(/url\(["']?/, '').replace(/["']?\)/, '')));
                
                // Fetch each font file and convert to base64
                for (const url of uniqueUrls) {
                    try {
                        const fontRes = await fetch(url);
                        const blob = await fontRes.blob();
                        const reader = new FileReader();
                        const base64 = await new Promise<string>((resolve) => {
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                        // Global replace of this URL in the CSS with the base64 data URI
                        // Using split/join for global replacement without regex special char issues
                        css = css.split(url).join(base64);
                    } catch (err) {
                        console.warn('Could not embed font:', url);
                    }
                }
                setFontStyles(css);
            } catch (e) {
                console.error("Font loading failed", e);
            }
        };
        loadFonts();
    }
  }, [isOpen, fontStyles]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    
    try {
      // Small delay to ensure images and fonts render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 1, 
        width: 1080,
        height: 1080,
        backgroundColor: '#F9F7F2',
        cacheBust: true,
        skipFonts: true,
        style: {
            transform: 'none', // Reset scale to capture full size
            transformOrigin: 'top left',
        }
      });
      
      const link = document.createElement('a');
      link.download = `genarchive-${post.modelName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Не удалось сгенерировать изображение. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isInputImageMode = !post.inputAttachments && (post.category === CategoryType.RESTORATION || post.category === CategoryType.IDENTIFICATION);
  const isOutputImageMode = post.category === CategoryType.RESTORATION || post.category === CategoryType.IDENTIFICATION || post.category === CategoryType.INFOGRAPHIC;

  const averageRating = post.reviews.length > 0
    ? post.reviews.reduce((acc, r) => acc + r.rating, 0) / post.reviews.length
    : 0;

  // Scale factor for the preview
  const SCALE = 0.45;
  const CARD_SIZE = 1080;
  const PREVIEW_SIZE = CARD_SIZE * SCALE;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-900/90 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden ring-1 ring-white/10">
        
        {/* Left Side: Preview Area */}
        <div className="flex-1 p-6 md:p-10 flex flex-col bg-paper-200/50 overflow-y-auto scrollbar-thin relative items-center justify-center">
           
           <div className="flex justify-between items-center mb-6 md:hidden w-full">
                <h3 className="text-xl font-display font-bold text-ink-900">Экспорт</h3>
                <button 
                  onClick={onClose}
                  className="p-2 bg-white rounded-full shadow-sm text-ink-900"
                >
                  <X className="w-6 h-6" />
                </button>
           </div>
           
           {/* Preview Container with fixed Aspect Ratio */}
           <div 
             className="relative shadow-2xl rounded-sm overflow-hidden bg-white shrink-0"
             style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
           >
                {/* --- THE CAPTURE CARD START --- */}
                {/* We use transform scale to fit the 1080px card into the preview container */}
                <div 
                    ref={cardRef}
                    id="share-card"
                    className="absolute top-0 left-0 origin-top-left bg-[#F9F7F2] p-12 flex flex-col font-serif"
                    style={{ 
                        width: CARD_SIZE, 
                        height: CARD_SIZE, 
                        transform: `scale(${SCALE})`,
                    }}
                >
                    {/* INJECTED FONTS: This ensures fonts are present without relying on html-to-image's buggy fetching */}
                    {fontStyles && <style>{fontStyles}</style>}

                    {/* The Card Replica - Exact PostCard Style */}
                    <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-paper-300 overflow-hidden flex flex-col relative z-10">
                        
                        {/* Header - Balanced padding */}
                        <div className="px-12 py-10 border-b border-paper-100 bg-white flex justify-between items-start shrink-0">
                            <div className="space-y-3 max-w-[70%]">
                                <span className="text-sm font-bold tracking-[0.15em] uppercase text-ink-400 block font-sans">
                                    {post.category}
                                </span>
                                <h1 className="text-5xl font-display font-bold text-ink-900 leading-tight tracking-tight line-clamp-2">
                                    {post.title}
                                </h1>
                                <div className="flex items-center gap-4 pt-1">
                                    <span className="bg-ink-100 text-ink-800 px-4 py-2 rounded-lg text-lg font-bold uppercase tracking-wide font-sans border border-ink-200">
                                        {post.modelName}
                                    </span>
                                    <span className="text-ink-500 text-xl font-sans">by @{post.author}</span>
                                </div>
                            </div>
                            
                            {/* Rating Big */}
                            <div className="flex flex-col items-end pt-2">
                                    <div className="flex items-center gap-3 bg-paper-50 px-5 py-3 rounded-2xl border border-paper-200 shadow-sm">
                                        <span className="text-4xl font-bold text-ink-900 font-sans pt-1">{averageRating.toFixed(1)}</span>
                                        <StarRating rating={averageRating} size={32} />
                                    </div>
                                    <span className="text-sm font-bold text-ink-400 mt-2 font-sans uppercase tracking-wide">Рейтинг сообщества</span>
                            </div>
                        </div>

                        {/* Content Area - Side by Side - Flexible Height */}
                        <div className="flex-1 bg-[#FAF9F6] p-10 min-h-0">
                            <div className="grid grid-cols-2 gap-8 h-full">
                                
                                {/* Input Column */}
                                <div className="flex flex-col rounded-3xl overflow-hidden border-2 border-paper-200 bg-[#F0EBE0]/30 h-full">
                                    <div className="px-8 py-5 bg-[#F0EBE0]/50 border-b border-paper-200 flex justify-between items-center shrink-0">
                                        <span className="text-lg font-bold text-ink-500 uppercase tracking-widest font-sans">Input / Исходник</span>
                                    </div>
                                    <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#F0EBE0]/20">
                                        {isInputImageMode ? (
                                            <img src={post.inputContent} className="w-full h-full object-cover" alt="Input" />
                                        ) : (
                                            <div className="p-8 text-2xl leading-relaxed text-ink-700 whitespace-pre-wrap font-serif w-full h-full overflow-hidden">
                                                {post.inputContent ? post.inputContent.slice(0, 450) + (post.inputContent.length > 450 ? '...' : '') : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Output Column */}
                                <div className="flex flex-col rounded-3xl overflow-hidden border-2 border-accent-100 bg-white shadow-sm ring-1 ring-black/5 h-full">
                                    <div className="px-8 py-5 bg-accent-50/50 border-b border-accent-100 flex justify-between items-center shrink-0">
                                        <span className="text-lg font-bold text-accent-700 uppercase tracking-widest font-sans flex items-center gap-2">
                                            <CheckCircle2 className="w-6 h-6" /> Result / Результат
                                        </span>
                                    </div>
                                    <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-white">
                                        {isOutputImageMode ? (
                                            <img src={post.outputContent} className="w-full h-full object-cover" alt="Output" />
                                        ) : (
                                            <div className="p-8 text-2xl leading-relaxed text-ink-900 whitespace-pre-wrap font-serif w-full h-full overflow-hidden">
                                                {post.outputContent ? post.outputContent.slice(0, 450) + (post.outputContent.length > 450 ? '...' : '') : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Prompt Section - Fixed Height or Shrinkable */}
                        <div className="px-12 py-8 bg-white border-t border-paper-200 shrink-0">
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex items-center gap-3 text-ink-500">
                                    <Terminal className="w-6 h-6" />
                                    <span className="text-lg font-bold uppercase tracking-widest font-sans">Системный Промт</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-40">
                                    <Feather className="w-5 h-5 text-ink-900" />
                                    <span className="text-lg font-bold uppercase tracking-widest font-sans text-ink-900">GenArchive.com</span>
                                </div>
                            </div>
                            
                            {/* CHANGED: Background from bg-ink-900 to bg-paper-200 (dark-milky), text to dark */}
                            <div className="bg-paper-200 border border-paper-300 rounded-3xl p-12 relative overflow-hidden shadow-inner h-[260px]">
                                <p className="font-mono text-xl text-ink-900 leading-relaxed line-clamp-5 relative z-10 selection:bg-accent-500 selection:text-white">
                                    {post.prompt}
                                </p>
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <Terminal className="w-32 h-32 text-ink-900 rotate-12" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                {/* --- THE CAPTURE CARD END --- */}
           </div>
           
           <div className="text-center mt-6 space-y-1">
               <p className="text-xs font-bold text-ink-500 uppercase tracking-widest">Превью</p>
               <p className="text-[10px] text-ink-400">Финальное изображение: 1080 x 1080 px (PNG)</p>
               {!fontStyles && <p className="text-[10px] text-accent-600 animate-pulse">Загрузка шрифтов...</p>}
           </div>
        </div>

        {/* Right Side: Actions */}
        <div className="w-full md:w-80 bg-white p-8 flex flex-col border-l border-paper-200 z-10 relative shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="hidden md:flex justify-end mb-10">
                 <button onClick={onClose} className="p-2 hover:bg-paper-100 rounded-full transition-colors text-ink-400 hover:text-ink-900">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="mb-8">
                    <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 mb-4">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-display font-bold text-ink-900 mb-2">Готово к шерингу</h4>
                    <p className="text-sm text-ink-500 font-serif leading-relaxed">
                        Эта карточка оптимизирована для социальных сетей (1080x1080px). Дизайн идентичен карточкам на сайте.
                    </p>
                </div>

                <div className="space-y-3 mt-auto">
                    <button 
                        onClick={handleDownload}
                        disabled={isGenerating || !fontStyles}
                        className="w-full py-4 bg-ink-900 text-white rounded-xl font-bold uppercase text-xs tracking-[0.15em] hover:bg-accent-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        {isGenerating ? 'Рендеринг...' : (!fontStyles ? 'Загрузка шрифтов...' : 'Скачать PNG')}
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-white border border-paper-200 text-ink-500 rounded-xl font-bold uppercase text-xs tracking-[0.15em] hover:bg-paper-50 hover:text-ink-900 hover:border-paper-300 transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-paper-100 flex justify-center gap-6 opacity-50">
                 <Share2 className="w-4 h-4" />
                 <FileText className="w-4 h-4" />
                 <Feather className="w-4 h-4" />
            </div>
        </div>

      </div>
    </div>
  );
};

export default ShareModal;