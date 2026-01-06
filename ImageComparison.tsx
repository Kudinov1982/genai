import React, { useState, useRef } from 'react';
import { MoveHorizontal, ZoomIn } from 'lucide-react';
import { Annotation } from '../types';
import { Tooltip } from './ModernUI';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  annotations?: Annotation[];
  onAddAnnotation?: (x: number, y: number) => void;
  isAnnotationMode?: boolean;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({ 
  beforeImage, 
  afterImage, 
  annotations = [], 
  onAddAnnotation,
  isAnnotationMode = false 
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setMousePos({ x, y });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isAnnotationMode && onAddAnnotation && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onAddAnnotation(x, y);
    }
  };

  // --- Logic for Magnifier (Refactored to be safer) ---
  const containerWidth = containerRef.current?.offsetWidth || 1;
  const containerHeight = containerRef.current?.offsetHeight || 1;
  
  const mousePercentX = (mousePos.x / containerWidth) * 100;
  const mousePercentY = (mousePos.y / containerHeight) * 100;

  // Which image to show in magnifier?
  const magnifierImage = sliderPosition > mousePercentX ? beforeImage : afterImage;
  // ----------------------------------------------------

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink-500">
            <MoveHorizontal className="w-3 h-3" />
            Сравнение (Слайдер)
         </div>
         <button 
            onClick={() => setShowMagnifier(!showMagnifier)}
            className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${showMagnifier ? 'bg-accent-100 text-accent-700' : 'bg-paper-100 text-ink-500 hover:text-ink-900'}`}
         >
            <ZoomIn className="w-3 h-3" />
            Лупа {showMagnifier ? 'ВКЛ' : 'ВЫКЛ'}
         </button>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full h-64 md:h-80 rounded-xl overflow-hidden cursor-${isAnnotationMode ? 'crosshair' : showMagnifier ? 'none' : 'ew-resize'} group border border-paper-200 shadow-inner bg-paper-100`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setShowMagnifier(false); }}
        onClick={handleContainerClick}
      >
        <img 
            src={afterImage} 
            alt="After" 
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
        />

        <div 
            className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
            <img 
                src={beforeImage} 
                alt="Before" 
                className="absolute inset-0 w-full h-full object-cover" 
            />
        </div>

        <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-ink-400 opacity-90">
                <MoveHorizontal className="w-4 h-4" />
            </div>
        </div>

        {!isAnnotationMode && !showMagnifier && (
            <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
            />
        )}

        {annotations.map((ann) => (
             <Tooltip key={ann.id} content={`${ann.author}: ${ann.text}`} position="top">
                <div 
                    className="absolute z-40 w-4 h-4 bg-accent-500 border-2 border-white rounded-full shadow-md hover:scale-125 transition-transform cursor-help animate-fade-in"
                    style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                </div>
             </Tooltip>
        ))}

        {showMagnifier && isHovering && (
            <div 
                className="absolute z-50 w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden pointer-events-none bg-paper-100"
                style={{ 
                    left: mousePos.x - 64, 
                    top: mousePos.y - 64,
                    backgroundImage: `url(${magnifierImage})`,
                    backgroundPosition: `${mousePercentX}% ${mousePercentY}%`,
                    backgroundSize: '300%',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 shadow-inner rounded-full ring-1 ring-black/10"></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageComparison;
