import React, { useState, useEffect, useRef } from 'react';
import { Post, CategoryType, Attachment, User } from '../types';
import { MessageSquare, Copy, Check, CheckCircle2, Star, ChevronDown, ChevronUp, FileAudio, FileText, Download, Terminal, ArrowRight, Maximize2, X, Share2, Link as LinkIcon, ThumbsUp, Image as ImageIcon, Calendar } from 'lucide-react';
import StarRating from './StarRating';
import { Tooltip } from './ModernUI';
import ShareModal from './ShareModal';
import TelegramLoginButton from './TelegramLoginButton';

interface PostCardProps {
  post: Post;
  onAddReview: (id: string, text: string, rating: number) => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
}

const PostCard: React.FC<PostCardProps> = React.memo(({ post, onAddReview, currentUser, onLogin }) => {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5); 
  const [showReviews, setShowReviews] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Share State
  const [linkCopied, setLinkCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Quick Rate Hover State
  const [quickRateHover, setQuickRateHover] = useState<number | null>(null);
  
  // Lightbox State
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxSrc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxSrc]);

  const averageRating = post.reviews.length > 0
    ? post.reviews.reduce((acc, r) => acc + r.rating, 0) / post.reviews.length
    : 0;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(post.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return; // Should be handled by UI visibility, but safe check

    onAddReview(post.id, reviewText, reviewRating);
    setReviewText('');
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleQuickRate = (rating: number) => {
      // If user not logged in, force open reviews and scroll to login button (simplified behavior)
      if (!currentUser) {
          setShowReviews(true);
          // Optional: Add shake animation or focus on login
          return;
      }
      onAddReview(post.id, '', rating);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 2000);
  };

  const handleShareLink = () => {
      const baseUrl = window.location.href.split('#')[0];
      const url = `${baseUrl}#post-${post.id}`;
      
      navigator.clipboard.writeText(url).then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
      });
  };

  // Logic to determine if Input or Output should be rendered as an image
  const isInputImageMode = !post.inputAttachments && (post.category === CategoryType.RESTORATION || post.category === CategoryType.IDENTIFICATION);
  const isOutputImageMode = post.category === CategoryType.RESTORATION || post.category === CategoryType.IDENTIFICATION || post.category === CategoryType.INFOGRAPHIC;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderAttachments = (attachments: Attachment[]) => {
      return (
          <div className="space-y-2 mt-2">
              {attachments.map(att => {
                  if (att.type === 'image') {
                      return (
                          <div 
                            key={att.id} 
                            onClick={() => setLightboxSrc(att.url)}
                            className="relative rounded-lg overflow-hidden border border-paper-200 shadow-sm group cursor-zoom-in"
                          >
                              <img src={att.url} alt={att.name} loading="lazy" decoding="async" className="w-full h-auto max-h-64 object-contain bg-paper-50 transition-transform group-hover:scale-105 duration-500" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="text-white w-6 h-6 drop-shadow-md" />
                              </div>
                          </div>
                      );
                  }
                  if (att.type === 'audio') {
                      return (
                          <div key={att.id} className="bg-white border border-paper-200 p-2 rounded-lg flex items-center gap-2 shadow-sm">
                              <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                  <FileAudio className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-ink-700 truncate font-sans">{att.name}</p>
                                  <audio controls src={att.url} className="w-full h-8 mt-1 ui-font" />
                              </div>
                          </div>
                      );
                  }
                  if (att.type === 'document') {
                       return (
                          <div key={att.id} className="bg-white border border-paper-200 p-2 rounded-lg flex items-center gap-3 shadow-sm">
                              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-ink-700 truncate font-sans">{att.name}</p>
                                  <p className="text-[10px] text-ink-400 uppercase font-sans">Document</p>
                              </div>
                              <Tooltip content="Скачать файл">
                                  <a href={att.url} download={att.name} className="p-2 hover:bg-paper-100 rounded-full transition-colors text-ink-500">
                                      <Download className="w-4 h-4" />
                                  </a>
                              </Tooltip>
                          </div>
                      );
                  }
                  return null;
              })}
          </div>
      );
  };

  return (
    <>
      <div id={`post-${post.id}`} className="bg-white rounded-2xl shadow-sm border border-paper-200 overflow-hidden flex flex-col scroll-mt-24 transition-colors hover:border-paper-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-paper-100 bg-white relative">
          <div className="flex justify-between items-start gap-4 relative z-10">
              <div className="pr-2 flex-1">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-ink-400 font-sans">
                          {post.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-ink-400 text-[10px] uppercase font-bold tracking-wide font-sans">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(post.createdAt)}</span>
                      </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-ink-900 leading-tight mb-3 tracking-tight">
                      {post.title}
                  </h3>
                  <div className="flex items-center gap-2">
                      <span className="bg-ink-100 text-ink-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide font-sans border border-ink-200">{post.modelName}</span>
                      <span className="text-ink-400 text-xs font-sans ml-1">by @{post.author}</span>
                  </div>
              </div>
              
              {/* Rating Block */}
              <div className="flex flex-col items-end flex-shrink-0 pt-1">
                  {averageRating > 0 ? (
                      <Tooltip content={`На основе ${post.reviews.length} отзывов`}>
                          <div className="flex items-center gap-2 bg-paper-50 px-3 py-1.5 rounded-xl border border-paper-200 shadow-sm transition-all hover:border-ink-200 hover:shadow-md cursor-help">
                              <div className="flex items-center gap-1.5">
                                  <span className="text-lg font-bold text-ink-900 leading-none pt-0.5 font-sans">{averageRating.toFixed(1)}</span>
                                  <StarRating rating={averageRating} size={14} />
                              </div>
                              <div className="h-4 w-px bg-paper-300 mx-1"></div>
                              <span className="text-xs font-bold text-ink-500 font-sans">
                                  {post.reviews.length}
                              </span>
                          </div>
                      </Tooltip>
                  ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-paper-50 border border-paper-200 text-xs font-bold text-ink-400 whitespace-nowrap font-sans">
                          Нет оценок
                      </span>
                  )}
              </div>
          </div>
        </div>

        {/* Content Body - Split Cards */}
        <div className="p-6 bg-paper-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                
                {/* Decorative Arrow for Desktop */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-paper-200 rounded-full items-center justify-center z-10 shadow-sm text-ink-300">
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>
                </div>

                {/* INPUT CARD */}
                <div className="flex flex-col rounded-xl overflow-hidden border-2 border-paper-200 bg-paper-100/30">
                    <div className="px-4 py-2 bg-paper-200/40 border-b border-paper-200 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest font-sans">Input / Исходник</span>
                    </div>
                    
                    <div className="flex-1 relative group/panel">
                      {isInputImageMode ? (
                          <div 
                            className="relative overflow-hidden h-64 md:h-72 cursor-zoom-in"
                            onClick={() => setLightboxSrc(post.inputContent)}
                          >
                              <img src={post.inputContent} alt="Input" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover/panel:scale-105 opacity-90 hover:opacity-100" />
                              <div className="absolute inset-0 bg-black/0 group-hover/panel:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/panel:opacity-100 pointer-events-none">
                                  <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                              </div>
                          </div>
                      ) : (
                          <div className="p-4 h-full min-h-[200px] max-h-[350px] overflow-y-auto scrollbar-thin bg-white/50">
                              {post.inputContent && (
                                  <div className="text-sm font-serif text-ink-700 whitespace-pre-wrap leading-relaxed mb-4">
                                      {post.inputContent}
                                  </div>
                              )}
                              {post.inputAttachments && post.inputAttachments.length > 0 && renderAttachments(post.inputAttachments)}
                          </div>
                      )}
                    </div>
                </div>

                {/* OUTPUT CARD */}
                <div className="flex flex-col rounded-xl overflow-hidden border-2 border-accent-100 bg-white shadow-sm ring-1 ring-black/5">
                    <div className="px-4 py-2 bg-accent-50/50 border-b border-accent-100 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-accent-700 uppercase tracking-widest font-sans flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Result / Результат
                          </span>
                    </div>

                    <div className="flex-1 relative group/panel">
                        {isOutputImageMode ? (
                          <div 
                            className="relative overflow-hidden h-64 md:h-72 cursor-zoom-in"
                            onClick={() => setLightboxSrc(post.outputContent)}
                          >
                              <img src={post.outputContent} alt="Output" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover/panel:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover/panel:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/panel:opacity-100 pointer-events-none">
                                  <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                              </div>
                          </div>
                        ) : (
                          <div className="p-4 h-full min-h-[200px] max-h-[350px] overflow-y-auto scrollbar-thin bg-white">
                              <div className="text-sm font-serif text-ink-900 whitespace-pre-wrap leading-relaxed">
                                  {post.outputContent}
                              </div>
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Redesigned Prompt Section */}
        <div className="px-6 py-5 bg-white border-t border-paper-200">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-ink-500">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest font-sans">Промт</span>
                </div>
                <Tooltip content={copied ? "Скопировано в буфер" : "Копировать промт"}>
                    <button 
                        onClick={handleCopyPrompt} 
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400 hover:text-ink-700 transition-colors font-sans px-2 py-1 rounded hover:bg-paper-100"
                    >
                        {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600"/>
                              <span className="text-green-600">Скопировано</span>
                            </>
                        ) : (
                            <>
                              <Copy className="w-3.5 h-3.5"/>
                              <span>Копировать</span>
                            </>
                        )}
                    </button>
                </Tooltip>
            </div>
            
            {/* CHANGED: Background from bg-ink-900 to bg-paper-200, text to dark */}
            <div className="bg-paper-200 border border-paper-300 rounded-xl p-4 shadow-inner relative overflow-hidden group/prompt">
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                    <Terminal className="w-16 h-16 text-ink-900 rotate-12" />
                </div>
                <p className="font-mono text-xs md:text-sm text-ink-800 leading-relaxed whitespace-pre-wrap break-words relative z-10 selection:bg-accent-500 selection:text-white">
                    {post.prompt}
                </p>
            </div>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 border-t border-paper-200 bg-paper-50 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left Actions: Reviews Toggle & Share */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Tooltip content={showReviews ? "Свернуть обсуждение" : "Показать обсуждение"}>
                <button 
                  onClick={() => setShowReviews(!showReviews)}
                  className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all font-sans py-2 px-4 rounded-lg border ${showReviews ? 'bg-white border-paper-300 text-ink-900 shadow-sm' : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-paper-100'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {post.reviews.length > 0 ? (
                      <span>
                        Отзывы <span className="text-ink-400 font-normal">({post.reviews.length})</span>
                      </span>
                  ) : 'Комментарии'}
                  {showReviews ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                </button>
            </Tooltip>

            <div className="h-6 w-px bg-paper-200 mx-1"></div>

            <Tooltip content={linkCopied ? "Ссылка скопирована!" : "Скопировать ссылку"}>
                <button 
                    onClick={handleShareLink}
                    className={`p-2 rounded-lg border transition-all ${linkCopied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-transparent border-transparent text-ink-400 hover:text-ink-800 hover:bg-paper-100'}`}
                >
                    {linkCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </button>
            </Tooltip>
            
            <Tooltip content="Создать карточку для соцсетей">
                <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 rounded-lg border bg-transparent border-transparent text-ink-400 hover:text-accent-600 hover:bg-accent-50 transition-all"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
            </Tooltip>
          </div>

          {/* Right Action: QUICK RATE */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {reviewSuccess ? (
                   <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-xs font-bold uppercase tracking-wide animate-fade-in border border-green-200">
                       <CheckCircle2 className="w-4 h-4" />
                       Голос учтен!
                   </div>
              ) : (
                  <div className={`flex items-center gap-3 bg-white border border-paper-200 rounded-xl px-4 py-2 shadow-sm transition-all hover:border-ink-200 hover:shadow-md min-w-[200px] justify-between ${!currentUser ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${quickRateHover ? 'text-accent-600' : 'text-ink-400'}`}>
                          {quickRateHover ? `Оценка: ${quickRateHover}` : 'Быстрая оценка:'}
                      </span>
                      <StarRating 
                        rating={quickRateHover || 0} 
                        editable={!!currentUser} 
                        onChange={handleQuickRate} 
                        onHover={setQuickRateHover}
                        size={18} 
                      />
                  </div>
              )}
          </div>
        </div>

        {/* Reviews Section (Collapsible) */}
        {showReviews && (
          <div className="bg-white border-t border-paper-200 p-6 animate-slide-up">
              <div className="space-y-4 mb-5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {post.reviews.length === 0 ? (
                      <div className="text-center py-6 bg-paper-50 rounded-xl border border-dashed border-paper-200">
                          <MessageSquare className="w-6 h-6 text-paper-300 mx-auto mb-2" />
                          <p className="text-sm text-ink-400 italic font-serif">Будьте первым критиком.</p>
                      </div>
                  ) : (
                      post.reviews.map(r => (
                          <div key={r.id} className="bg-paper-50 p-4 rounded-xl border border-paper-100 text-sm">
                              <div className="flex justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                      {r.authorAvatar ? (
                                           <img src={r.authorAvatar} alt={r.author} className="w-5 h-5 rounded-full" />
                                      ) : (
                                          <div className="w-5 h-5 rounded-full bg-ink-200 flex items-center justify-center text-[9px] text-ink-600">
                                              {r.author[0]}
                                          </div>
                                      )}
                                      <span className="font-bold text-ink-800 font-sans text-xs">
                                          {r.author}
                                      </span>
                                  </div>
                                  <StarRating rating={r.rating} size={12} />
                              </div>
                              {r.text && <p className="text-ink-600 leading-relaxed font-serif pl-7">{r.text}</p>}
                          </div>
                      ))
                  )}
              </div>

              {reviewSuccess ? (
                  <div className="bg-green-50 text-green-800 p-3 rounded-xl text-sm flex items-center gap-2 border border-green-200 font-sans font-bold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4"/> Оценка принята
                  </div>
              ) : (
                  <>
                      {currentUser ? (
                          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 animate-fade-in">
                              <div className="flex items-center justify-between bg-paper-50 p-3 rounded-lg border border-paper-200">
                                  <div className="flex items-center gap-3">
                                      <img src={currentUser.photo_url || 'https://via.placeholder.com/32'} alt="Me" className="w-6 h-6 rounded-full"/>
                                      <span className="text-xs font-bold uppercase tracking-wide text-ink-500 font-sans">
                                          Ваша оценка: <span className="text-ink-800 text-lg ml-2">{reviewRating}</span>
                                      </span>
                                  </div>
                                  <StarRating rating={reviewRating} editable onChange={setReviewRating} size={20} />
                              </div>
                              <div className="flex gap-2">
                                  <input 
                                      value={reviewText}
                                      onChange={(e) => setReviewText(e.target.value)}
                                      placeholder="Напишите комментарий..."
                                      className="flex-1 text-sm px-4 py-3 border border-paper-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 bg-white font-serif transition-shadow"
                                  />
                                  <button type="submit" className="bg-ink-800 text-white px-4 py-2 rounded-xl hover:bg-ink-900 shadow-sm transition-colors">
                                      <ArrowRight className="w-5 h-5" />
                                  </button>
                              </div>
                          </form>
                      ) : (
                          <div className="flex flex-col items-center justify-center py-6 bg-paper-50 rounded-xl border border-paper-200 gap-3">
                              <p className="text-sm text-ink-500 font-serif">Войдите, чтобы оставить отзыв</p>
                              <TelegramLoginButton 
                                  botName="YOUR_BOT_NAME" // User would replace this
                                  onAuth={onLogin}
                                  buttonSize="medium"
                              />
                          </div>
                      )}
                  </>
              )}
          </div>
        )}
      </div>

      {/* SHARE MODAL */}
      <ShareModal 
        post={post}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* LIGHTBOX OVERLAY */}
      {lightboxSrc && (
        <div 
          className="fixed inset-0 z-[100] bg-ink-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setLightboxSrc(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area (optional, usually clicking background closes)
          >
             <img 
               src={lightboxSrc} 
               alt="Full view" 
               className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
             />
          </div>
        </div>
      )}
    </>
  );
});

export default PostCard;