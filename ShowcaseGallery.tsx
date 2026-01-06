import React from 'react';
import { ShowcaseItem } from '../types';
import { ExternalLink, Plus } from 'lucide-react';
import { ModernBadge, Tooltip } from './ModernUI';

interface ShowcaseGalleryProps {
  items: ShowcaseItem[];
  onAdd: () => void;
}

const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({ items, onAdd }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-paper-300 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-900 tracking-tight">Галерея Проектов</h2>
          <p className="text-ink-500 mt-2 font-serif text-lg">Инструменты и ресурсы, созданные сообществом.</p>
        </div>
        <Tooltip content="Предложить свой инструмент">
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 bg-ink-900 hover:bg-ink-800 text-white px-6 py-3 rounded-lg font-bold uppercase text-sm tracking-wide transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Добавить проект
            </button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(item => (
          <div key={item.id} className="group bg-white border border-paper-200 hover:border-accent-300 transition-colors flex flex-col shadow-sm rounded-xl overflow-hidden">
            <div className="h-48 overflow-hidden bg-paper-100 relative">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-ink-900/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-display font-bold text-ink-900 group-hover:text-accent-700 transition-colors leading-tight">{item.title}</h3>
                <Tooltip content="Открыть сайт">
                    <a 
                       href={item.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-ink-400 hover:text-accent-600 transition-colors p-1"
                     >
                       <ExternalLink className="w-5 h-5" />
                     </a>
                </Tooltip>
              </div>
              <p className="text-xs text-ink-400 font-mono mb-4">by @{item.author}</p>
              
              <p className="text-ink-600 text-sm mb-6 leading-relaxed flex-1 font-serif">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-paper-100">
                {item.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-paper-100 text-ink-600 text-[10px] uppercase font-bold tracking-wider border border-paper-200 rounded-md font-sans">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowcaseGallery;