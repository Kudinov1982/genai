import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CategoryType, Post, Review, ShowcaseItem, User } from './types';
import { INITIAL_POSTS, INITIAL_SHOWCASES, GOOGLE_SHEETS_CSV_URL } from './constants';
import { fetchPostsFromGoogleSheets } from './api';
import PostCard from './components/PostCard';
import UploadModal from './components/UploadModal';
import ComparisonView from './components/ComparisonView';
import PromptLibrary from './components/PromptLibrary';
import ShowcaseGallery from './components/ShowcaseGallery';
import { Sparkles, Plus, Search, Filter, LayoutGrid, BookOpen, Crown, Grid3X3, Feather, X, Menu, Star, ChevronDown, List, BarChart3, Image as ImageIcon, SlidersHorizontal, User as UserIcon, Tag, Box, FileText, History, LogOut, Loader2, Database } from 'lucide-react';
import { ModernSelect, useClickOutside, Tooltip } from './components/ModernUI';

const PAGE_SIZE = 5;

interface SearchSuggestion {
    type: 'history' | 'category' | 'model' | 'author' | 'post';
    label: string;
    value: string;
    subLabel?: string;
}

const App: React.FC = () => {
  // --- Data Loading State ---
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [sheetPosts, setSheetPosts] = useState<Post[]>([]);
  
  // --- Local Data State ---
  // We keep "local" posts separate so user can still add posts without backend
  const [localPosts, setLocalPosts] = useState<Post[]>(() => {
      try {
          const saved = localStorage.getItem('genai_local_posts');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  // Effect to fetch from Google Sheets
  useEffect(() => {
    async function loadData() {
        setIsDataLoading(true);
        const data = await fetchPostsFromGoogleSheets(GOOGLE_SHEETS_CSV_URL);
        setSheetPosts(data);
        setIsDataLoading(false);
    }
    loadData();
  }, []);

  // Save local posts
  useEffect(() => {
      localStorage.setItem('genai_local_posts', JSON.stringify(localPosts));
  }, [localPosts]);

  // Combined Posts (Local + Sheets + Initial Fallback if both empty)
  const posts = useMemo(() => {
      const combined = [...localPosts, ...sheetPosts];
      // If we have no data at all (sheet failed/empty AND no local posts), show demo data
      if (combined.length === 0 && !isDataLoading && !GOOGLE_SHEETS_CSV_URL) {
          return INITIAL_POSTS;
      }
      return combined;
  }, [localPosts, sheetPosts, isDataLoading]);

  // --- Reviews State (Persisted separately for now as we can't write to sheets) ---
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(() => {
    try {
        const saved = localStorage.getItem('genai_reviews');
        return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
      localStorage.setItem('genai_reviews', JSON.stringify(reviewsMap));
  }, [reviewsMap]);

  // Inject reviews into posts
  const postsWithReviews = useMemo(() => {
      return posts.map(p => ({
          ...p,
          reviews: [...(p.reviews || []), ...(reviewsMap[p.id] || [])]
      }));
  }, [posts, reviewsMap]);

  const [showcases, setShowcases] = useState<ShowcaseItem[]>(() => {
      try {
          const saved = localStorage.getItem('genai_showcases');
          return saved ? JSON.parse(saved) : INITIAL_SHOWCASES;
      } catch (e) {
          console.error("Failed to load showcases", e);
          return INITIAL_SHOWCASES;
      }
  });

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      try {
          const saved = localStorage.getItem('genai_user');
          return saved ? JSON.parse(saved) : null;
      } catch (e) {
          return null;
      }
  });
  
  useEffect(() => {
      localStorage.setItem('genai_showcases', JSON.stringify(showcases));
  }, [showcases]);

  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('genai_user', JSON.stringify(currentUser));
      } else {
          localStorage.removeItem('genai_user');
      }
  }, [currentUser]);

  const handleLogin = useCallback((user: User) => {
      setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
      setCurrentUser(null);
  }, []);

  // Navigation State
  const [activeSection, setActiveSection] = useState<'feed' | 'library' | 'gallery'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  
  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [prefilledPrompt, setPrefilledPrompt] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<'date' | 'date_asc' | 'rating' | 'reviews'>('date');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [selectedModelFilter, setSelectedModelFilter] = useState<string | null>(null);

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useClickOutside(searchContainerRef, () => setIsSearchFocused(false));

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, searchQuery, minRatingFilter, selectedModelFilter, sortBy]);

  // --- Derived Data ---

  // 1. Autocomplete Suggestions
  const searchSuggestions = useMemo(() => {
      const suggestions: SearchSuggestion[] = [];
      const queryLower = searchQuery.toLowerCase().trim();

      if (!queryLower) {
          // Default suggestions when empty
          suggestions.push({ type: 'category', label: 'Транскрипция', value: 'Транскрипция', subLabel: 'Категория' });
          suggestions.push({ type: 'category', label: 'Реставрация', value: 'Реставрация', subLabel: 'Категория' });
          
          // Get top 3 models from post data
          const allModels = Array.from(new Set(postsWithReviews.map(p => p.modelName))).slice(0, 3) as string[];
          allModels.forEach(m => suggestions.push({ type: 'model', label: m, value: m, subLabel: 'Популярная модель' }));
          
          return suggestions;
      }

      // 1. Match Categories
      (Object.values(CategoryType) as string[]).forEach((cat) => {
          if (cat.toLowerCase().includes(queryLower)) {
              suggestions.push({ type: 'category', label: cat, value: cat, subLabel: 'Категория' });
          }
      });

      // 2. Match Models
      const uniqueModels: string[] = Array.from(new Set(postsWithReviews.map(p => p.modelName)));
      uniqueModels.forEach(model => {
          if (model.toLowerCase().includes(queryLower)) {
              suggestions.push({ type: 'model', label: model, value: model, subLabel: 'AI Модель' });
          }
      });

      // 3. Match Authors
      const uniqueAuthors: string[] = Array.from(new Set(postsWithReviews.map(p => p.author)));
      uniqueAuthors.forEach(author => {
          if (author.toLowerCase().includes(queryLower)) {
              suggestions.push({ type: 'author', label: author, value: author, subLabel: 'Автор' });
          }
      });

      // 4. Match Post Titles
      postsWithReviews.forEach(post => {
          if (post.title.toLowerCase().includes(queryLower)) {
              suggestions.push({ type: 'post', label: post.title, value: post.title, subLabel: post.modelName });
          }
      });

      return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, postsWithReviews]);

  const getAverageRating = useCallback((post: Post) => {
    if (post.reviews.length === 0) return 0;
    return post.reviews.reduce((acc, r) => acc + r.rating, 0) / post.reviews.length;
  }, []);

  // Memoize heavy filtering/sorting logic
  const processedPosts = useMemo(() => {
      return postsWithReviews
        .filter(post => {
          const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
          // Enhanced search to include author
          const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                post.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                post.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                post.category.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesRating = getAverageRating(post) >= minRatingFilter;
          const matchesModel = selectedModelFilter ? post.modelName === selectedModelFilter : true;

          return matchesCategory && matchesSearch && matchesRating && matchesModel;
        })
        .sort((a, b) => {
          if (sortBy === 'rating') return getAverageRating(b) - getAverageRating(a);
          if (sortBy === 'reviews') return b.reviews.length - a.reviews.length;
          if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
  }, [postsWithReviews, selectedCategory, searchQuery, minRatingFilter, selectedModelFilter, sortBy, getAverageRating]);

  const visiblePosts = useMemo(() => processedPosts.slice(0, visibleCount), [processedPosts, visibleCount]);
  const hasMore = visibleCount < processedPosts.length;

  // --- Handlers ---

  const handleAddReview = useCallback((postId: string, text: string, rating: number) => {
    if (!currentUser) return; // Guard clause

    const newReview: Review = {
      id: Date.now().toString(),
      author: currentUser.username || currentUser.first_name,
      authorAvatar: currentUser.photo_url,
      text,
      rating,
      createdAt: new Date().toISOString()
    };
    
    setReviewsMap(prev => ({
        ...prev,
        [postId]: [newReview, ...(prev[postId] || [])]
    }));
  }, [currentUser]);

  const handleUploadPost = useCallback((newPost: Post) => {
      setLocalPosts(currentPosts => {
          const postWithAuthor = {
            ...newPost,
            author: currentUser ? (currentUser.username || currentUser.first_name) : 'Anonymous'
          };
          return [postWithAuthor, ...currentPosts];
      });
  }, [currentUser]);
  
  const handleUploadShowcase = useCallback((newItem: ShowcaseItem) => {
       setShowcases(currentShowcases => {
            const itemWithAuthor = {
                ...newItem,
                author: currentUser ? (currentUser.username || currentUser.first_name) : 'Anonymous'
            };
            return [itemWithAuthor, ...currentShowcases];
       });
  }, [currentUser]);

  const handleUsePrompt = (prompt: string) => {
      setPrefilledPrompt(prompt);
      setIsUploadOpen(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      setSearchQuery(suggestion.value);
      setIsSearchFocused(false);
    };

  const ratingOptions = [
      { label: 'Любой рейтинг', value: 0 },
      { label: '3+ Звезды', value: 3 },
      { label: '4+ Звезды', value: 4 },
      { label: 'Только 5 звезд', value: 5 },
  ];

  const sortOptions = [
      { label: 'Сначала новые', value: 'date' },
      { label: 'Сначала старые', value: 'date_asc' },
      { label: 'Высокий рейтинг', value: 'rating' },
      { label: 'Много отзывов', value: 'reviews' },
  ];

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + PAGE_SIZE);
  };

  // --- Deep Linking Logic ---
  useEffect(() => {
    const handleDeepLink = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            const postId = hash.replace('#post-', '');
            const postIndex = processedPosts.findIndex(p => p.id === postId);
            
            if (postIndex !== -1) {
                // Determine needed count (round up to nearest PAGE_SIZE chunk)
                const neededCount = Math.ceil((postIndex + 1) / PAGE_SIZE) * PAGE_SIZE;
                if (neededCount > visibleCount) {
                    setVisibleCount(neededCount);
                }
                
                // Wait for DOM update and scroll
                setTimeout(() => {
                    const element = document.getElementById(`post-${postId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add highlight effect
                        element.classList.add('ring-2', 'ring-accent-500', 'ring-offset-4');
                        setTimeout(() => element.classList.remove('ring-2', 'ring-accent-500', 'ring-offset-4'), 2500);
                    }
                }, 400);
            }
        }
    };

    // Run on mount
    handleDeepLink();
    
    // Listen for hash changes if user clicks multiple links
    window.addEventListener('hashchange', handleDeepLink);
    return () => window.removeEventListener('hashchange', handleDeepLink);
  }, [processedPosts, visibleCount]); // Depend on processedPosts to know indices

  const navItems = [
    { id: 'feed', label: 'Лента', icon: <List className="w-4 h-4" /> },
    { id: 'library', label: 'Промты', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'gallery', label: 'Галерея', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const isFiltersActive = searchQuery || minRatingFilter > 0 || selectedModelFilter || sortBy !== 'date';

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
      switch (type) {
          case 'category': return <Tag className="w-4 h-4 text-accent-500" />;
          case 'model': return <Box className="w-4 h-4 text-purple-500" />;
          case 'author': return <UserIcon className="w-4 h-4 text-blue-500" />;
          case 'post': return <FileText className="w-4 h-4 text-ink-500" />;
          default: return <History className="w-4 h-4 text-ink-400" />;
      }
  };

  return (
    <div className="min-h-screen bg-paper-50 font-sans flex flex-col">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-paper-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                {/* Logo */}
                <div 
                    className="flex items-center gap-3 cursor-pointer group select-none" 
                    onClick={() => { setActiveSection('feed'); setSelectedCategory('All'); window.scrollTo(0,0); }}
                >
                    <div className="w-9 h-9 bg-ink-900 rounded-lg flex items-center justify-center shadow-md group-hover:bg-accent-600 transition-colors duration-300">
                        <Feather className="w-5 h-5 text-paper-50" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-ink-900 leading-none tracking-tight group-hover:text-accent-700 transition-colors">GenArchive</h1>
                        <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold font-sans group-hover:text-accent-500 transition-colors">AI Genealogy</span>
                    </div>
                </div>

                {/* Desktop Nav Links (Pill Design) */}
                <div className="hidden md:flex items-center p-1 bg-paper-100 rounded-xl border border-paper-200">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as any)}
                            className={`
                                relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300
                                ${activeSection === item.id 
                                    ? 'bg-white text-ink-900 shadow-sm ring-1 ring-black/5' 
                                    : 'text-ink-500 hover:text-ink-900 hover:bg-paper-200/50'
                                }
                            `}
                        >
                            {item.icon}
                            <span className="uppercase tracking-wide text-xs pt-0.5">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Actions: Add + User Profile */}
                <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="hidden md:flex items-center gap-2 bg-ink-900 hover:bg-accent-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                     >
                        <Plus className="w-4 h-4" />
                        <span>Добавить</span>
                     </button>

                     {/* User Profile / Logout (Desktop) */}
                     {currentUser && (
                         <div className="hidden md:flex items-center gap-3 pl-2 border-l border-paper-200">
                             <img 
                                src={currentUser.photo_url || 'https://via.placeholder.com/32'} 
                                alt={currentUser.first_name} 
                                className="w-8 h-8 rounded-full border border-paper-300"
                             />
                             <Tooltip content="Выйти">
                                 <button onClick={handleLogout} className="p-2 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                     <LogOut className="w-4 h-4" />
                                 </button>
                             </Tooltip>
                         </div>
                     )}
                     
                     {/* Mobile Menu Button */}
                     <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-ink-600 hover:bg-paper-100 rounded-lg transition-colors">
                        {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                     </button>
                </div>
            </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-paper-200 animate-slide-up shadow-xl relative z-50">
                 <div className="p-4 space-y-1">
                    {/* User Info Mobile */}
                    {currentUser && (
                        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-paper-50 rounded-xl border border-paper-200">
                             <img 
                                src={currentUser.photo_url || 'https://via.placeholder.com/32'} 
                                alt={currentUser.first_name} 
                                className="w-8 h-8 rounded-full"
                             />
                             <div className="flex-1">
                                 <div className="text-sm font-bold text-ink-900">{currentUser.first_name}</div>
                                 <div className="text-[10px] text-ink-500">@{currentUser.username}</div>
                             </div>
                             <button onClick={handleLogout} className="text-xs text-red-600 font-bold uppercase">Выйти</button>
                        </div>
                    )}

                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveSection(item.id as any); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                                activeSection === item.id 
                                    ? 'bg-paper-100 text-ink-900' 
                                    : 'text-ink-500 hover:bg-paper-50 hover:text-ink-900'
                            }`}
                        >
                            {item.icon}
                            <span className="uppercase tracking-wide">{item.label}</span>
                        </button>
                    ))}
                    <div className="h-px bg-paper-100 my-2 mx-2"></div>
                    <button 
                        onClick={() => { setIsUploadOpen(true); setIsMobileMenuOpen(false); }} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors uppercase tracking-widest shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить запись
                    </button>
                 </div>
            </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: FEED */}
        {activeSection === 'feed' && (
            <div className="animate-fade-in">

                {/* 1. LEADERBOARD / MATRIX (Always Top) */}
                <ComparisonView posts={postsWithReviews} />
                
                {/* 2. SEARCH & FILTERS */}
                <div className="bg-white rounded-2xl p-2 md:p-3 shadow-lg border border-paper-200 mb-8 flex flex-col md:flex-row gap-3 relative z-30">
                    
                    {/* Main Search Input with Autocomplete */}
                    <div className="relative flex-1 group" ref={searchContainerRef}>
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-ink-400 group-focus-within:text-ink-900 transition-colors" strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 bg-paper-50 border-transparent rounded-xl text-lg font-serif text-ink-900 placeholder-ink-400 placeholder:italic focus:bg-white focus:border-transparent focus:ring-2 focus:ring-ink-100 transition-all outline-none"
                            placeholder="Поиск по архиву, промтам и моделям..."
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => { setSearchQuery(''); setIsSearchFocused(true); }}
                                className="absolute inset-y-0 right-3 flex items-center text-ink-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-5 w-5" strokeWidth={3} />
                            </button>
                        )}

                        {/* Autocomplete Dropdown */}
                        {isSearchFocused && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-paper-200 overflow-hidden animate-slide-up z-50">
                                <div className="py-2">
                                    <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1">
                                        {searchQuery ? 'Результаты поиска' : 'Рекомендации'}
                                    </div>
                                    {searchSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={`${suggestion.type}-${suggestion.value}-${idx}`}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-paper-50 transition-colors group/item"
                                        >
                                            <div className="p-2 rounded-lg bg-paper-100 text-ink-500 group-hover/item:bg-white group-hover/item:text-ink-900 transition-colors">
                                                {getSuggestionIcon(suggestion.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-serif font-medium text-ink-800 truncate group-hover/item:text-ink-900">
                                                    {suggestion.label}
                                                </div>
                                                {suggestion.subLabel && (
                                                    <div className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
                                                        {suggestion.subLabel}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Group */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                         {/* Separator for Desktop */}
                         <div className="hidden md:block w-px bg-paper-200 h-10 mx-2"></div>
                         
                         <div className="w-full md:w-auto min-w-[160px]">
                            <ModernSelect 
                                options={ratingOptions}
                                value={minRatingFilter}
                                onChange={setMinRatingFilter}
                                icon={<Star className="w-4 h-4"/>}
                                label="Рейтинг"
                                className="w-full font-serif"
                            />
                         </div>

                         <div className="w-full md:w-auto min-w-[180px]">
                            <ModernSelect 
                                options={sortOptions}
                                value={sortBy}
                                onChange={setSortBy}
                                icon={<SlidersHorizontal className="w-4 h-4"/>}
                                label="Сортировка"
                                className="w-full font-serif"
                            />
                         </div>
                         
                         {isFiltersActive && (
                            <button 
                                onClick={() => { setSearchQuery(''); setMinRatingFilter(0); setSortBy('date'); setSelectedModelFilter(null); }}
                                className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl px-4 py-3 transition-colors shrink-0 border border-red-100 w-full md:w-auto"
                                title="Сбросить все фильтры"
                            >
                                <X className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                         )}
                    </div>
                </div>

                {/* 3. FEED FILTERS (Categories) */}
                <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-lg text-sm font-sans font-medium tracking-wide transition-all border ${selectedCategory === 'All' ? 'bg-ink-800 border-ink-800 text-white shadow-md' : 'bg-white border-paper-200 text-ink-600 hover:bg-paper-100 hover:text-ink-900'}`}
                        >
                            Все
                        </button>
                        {(Object.values(CategoryType) as CategoryType[]).map(cat => (
                             <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-sans font-medium tracking-wide whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-ink-800 border-ink-800 text-white shadow-md' : 'bg-white border-paper-200 text-ink-600 hover:bg-paper-100 hover:text-ink-900'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* STANDARD FEED (Vertical Stack) */}
                <div className="flex flex-col gap-8 pb-10 max-w-4xl mx-auto">
                    {/* Loading State */}
                    {isDataLoading && (
                        <div className="w-full py-12 flex flex-col items-center justify-center text-ink-400 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
                            <span className="text-xs font-bold uppercase tracking-widest">Загрузка данных из Google Sheets...</span>
                        </div>
                    )}

                    {!isDataLoading && visiblePosts.map(post => (
                        <div key={post.id} className="w-full">
                            <PostCard 
                                post={post} 
                                onAddReview={handleAddReview}
                                currentUser={currentUser}
                                onLogin={handleLogin}
                            />
                        </div>
                    ))}
                    
                    {!isDataLoading && processedPosts.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-paper-300">
                             <div className="flex justify-center mb-4">
                                <Database className="w-12 h-12 text-paper-300" />
                             </div>
                             <p className="text-ink-500 text-lg font-display font-medium">База данных пуста или недоступна</p>
                             <p className="text-ink-400 text-sm mt-2 max-w-md mx-auto">Убедитесь, что ссылка на CSV Google Таблицы указана верно в файле constants.ts</p>
                             <button onClick={() => { setSearchQuery(''); setMinRatingFilter(0); setSelectedModelFilter(null); }} className="mt-4 text-accent-600 text-sm font-bold uppercase tracking-wide hover:underline">Сбросить фильтры</button>
                        </div>
                    )}
                </div>

                {/* Pagination (Load More) */}
                {hasMore && !isDataLoading && (
                    <div className="flex justify-center pb-12">
                         <button 
                            onClick={handleLoadMore}
                            className="bg-white border border-paper-300 text-ink-600 font-bold uppercase text-xs tracking-widest py-3 px-8 rounded-full shadow-sm hover:bg-ink-50 hover:text-ink-900 hover:border-ink-300 transition-all flex items-center gap-2 group"
                         >
                            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            Загрузить еще ({processedPosts.length - visibleCount})
                         </button>
                    </div>
                )}
            </div>
        )}

        {/* VIEW: PROMPTS */}
        {activeSection === 'library' && (
             <PromptLibrary onUsePrompt={handleUsePrompt} onBack={() => setActiveSection('feed')} />
        )}

        {/* VIEW: SHOWCASE */}
        {activeSection === 'gallery' && (
            <ShowcaseGallery items={showcases} onAdd={() => setIsUploadOpen(true)} />
        )}

      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => { setIsUploadOpen(false); setPrefilledPrompt(''); }} 
        onUploadPost={handleUploadPost}
        onUploadShowcase={handleUploadShowcase}
        initialPrompt={prefilledPrompt}
      />
    </div>
  );
};

export default App;