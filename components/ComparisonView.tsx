import React, { useMemo, useState } from 'react';
import { Post, CategoryType } from '../types';
import StarRating from './StarRating';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { Tooltip } from './ModernUI';

interface ComparisonViewProps {
  posts: Post[];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ posts }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'Overall', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; 

  const stats = useMemo(() => {
    const models: Record<string, Record<string, { sum: number; count: number }>> = {};
    const uniqueModels = new Set<string>();

    posts.forEach(post => {
      const model = post.modelName;
      const cat = post.category;
      uniqueModels.add(model);

      if (!models[model]) models[model] = {};
      if (!models[model][cat]) models[model][cat] = { sum: 0, count: 0 };
      if (!models[model]['Overall']) models[model]['Overall'] = { sum: 0, count: 0 };

      if (post.reviews.length > 0) {
        post.reviews.forEach(review => {
            models[model][cat].sum += review.rating;
            models[model][cat].count += 1;
            models[model]['Overall'].sum += review.rating;
            models[model]['Overall'].count += 1;
        });
      }
    });

    return { data: models, modelNames: Array.from(uniqueModels) };
  }, [posts]);

  const categories = Object.values(CategoryType);

  const getScore = (modelName: string, categoryKey: string) => {
      const item = stats.data[modelName]?.[categoryKey];
      if (!item || item.count === 0) return -1;
      return item.sum / item.count;
  };

  const sortedModels = useMemo(() => {
      let sortableItems = [...stats.modelNames];
      
      sortableItems.sort((a, b) => {
          let valA: number | string;
          let valB: number | string;

          if (sortConfig.key === 'Model') {
              valA = a;
              valB = b;
              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          } else {
              valA = getScore(a, sortConfig.key);
              valB = getScore(b, sortConfig.key);
              
              if (valA === -1 && valB !== -1) return 1;
              if (valA !== -1 && valB === -1) return -1;
              
              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          }
      });
      return sortableItems;
  }, [stats, sortConfig]);

  const totalPages = Math.ceil(sortedModels.length / ITEMS_PER_PAGE);
  const paginatedModels = sortedModels.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
      setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
      }));
  };

  const renderSortIcon = (key: string) => {
      if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 text-paper-400 opacity-50" />;
      return sortConfig.direction === 'asc' ? 
          <ArrowUp className="w-3 h-3 text-accent-600" /> : 
          <ArrowDown className="w-3 h-3 text-accent-600" />;
  };

  const getHeatmapStyle = (score: number) => {
    if (score <= 0) return {};
    const normalized = (Math.max(1, Math.min(5, score)) - 1) / 4;
    const hue = normalized * 120;
    const saturation = 70 + (normalized * 20);
    const lightness = 96 - (normalized * 8);
    return { backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` };
  };

  return (
    <div className="animate-fade-in mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-paper-300 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-paper-100 border-b border-paper-300">
                            <th 
                                className="px-3 py-2 text-xs font-sans font-bold text-ink-800 sticky left-0 bg-paper-100 z-10 border-r border-paper-300 cursor-pointer hover:bg-paper-200 transition-colors w-[220px]"
                                onClick={() => handleSort('Model')}
                            >
                                <div className="flex items-center justify-between">
                                    Модель
                                    {renderSortIcon('Model')}
                                </div>
                            </th>
                            <th 
                                className="px-3 py-2 text-xs font-sans font-bold text-accent-700 bg-paper-200/50 border-r border-paper-300 w-28 cursor-pointer hover:bg-paper-200 transition-colors text-center"
                                onClick={() => handleSort('Overall')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Общий
                                    {renderSortIcon('Overall')}
                                </div>
                            </th>
                            {categories.map(cat => (
                                <th 
                                    key={cat} 
                                    className="px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-wider text-ink-600 border-r border-paper-200 last:border-0 cursor-pointer hover:bg-paper-200 transition-colors text-center"
                                    onClick={() => handleSort(cat)}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        {cat}
                                        {renderSortIcon(cat)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedModels.map((model, idx) => {
                            const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                            const overall = stats.data[model]['Overall'];
                            const avgOverall = overall && overall.count > 0 ? overall.sum / overall.count : 0;

                            return (
                                <tr key={model} className="border-b border-paper-100 hover:bg-paper-50 transition-colors group">
                                    <td className="px-3 py-2 font-medium text-ink-900 sticky left-0 bg-white border-r border-paper-200 z-10 group-hover:bg-paper-50 font-display text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${globalIndex < 3 ? 'bg-accent-100 text-accent-700' : 'text-ink-400 bg-paper-100'}`}>
                                                {globalIndex + 1}
                                            </span>
                                            <span className="truncate max-w-[160px]" title={model}>{model}</span>
                                        </div>
                                    </td>
                                    <td 
                                        className="px-3 py-2 border-r border-paper-200 text-center transition-colors"
                                        style={getHeatmapStyle(avgOverall)}
                                    >
                                        {overall && overall.count > 0 ? (
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span className="font-bold text-sm text-ink-800 font-sans">{avgOverall.toFixed(1)}</span>
                                                <StarRating rating={Math.round(avgOverall)} size={10} />
                                            </div>
                                        ) : (
                                            <span className="text-paper-300 text-xs">-</span>
                                        )}
                                    </td>
                                    {categories.map(cat => {
                                        const catData = stats.data[model][cat];
                                        const avg = catData && catData.count > 0 ? catData.sum / catData.count : 0;
                                        
                                        return (
                                            <td 
                                                key={cat} 
                                                className="px-3 py-2 text-center border-r border-paper-100 last:border-0 transition-colors"
                                                style={getHeatmapStyle(avg)}
                                            >
                                                {catData && catData.count > 0 ? (
                                                     <div className="flex flex-col items-center leading-none">
                                                        <span className={`font-bold font-sans text-xs ${avg >= 4.5 ? 'text-green-800' : avg >= 3 ? 'text-ink-800' : 'text-red-800'}`}>
                                                            {avg.toFixed(1)}
                                                        </span>
                                                        <span className="text-[8px] text-ink-400 font-sans opacity-60 mt-0.5">{catData.count}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-paper-300 font-sans text-xs">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 bg-paper-50 border-t border-paper-200">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded-md hover:bg-white border border-transparent hover:border-paper-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-ink-600" />
                    </button>
                    <span className="text-[10px] font-bold uppercase text-ink-400 tracking-widest">
                        {currentPage} / {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded-md hover:bg-white border border-transparent hover:border-paper-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-ink-600" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default ComparisonView;