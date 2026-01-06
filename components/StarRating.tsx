import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5 (floats allowed, e.g. 3.5)
  editable?: boolean;
  onChange?: (rating: number) => void;
  onHover?: (rating: number | null) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, editable = false, onChange, onHover, size = 16 }) => {
  const stars = [1, 2, 3, 4, 5];

  const calculateRating = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;
    return isLeftHalf ? starIndex - 0.5 : starIndex;
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    if (!editable || !onChange) return;
    onChange(calculateRating(e, starIndex));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
      if (!editable || !onHover) return;
      onHover(calculateRating(e, starIndex));
  };

  return (
    <div 
        className="flex items-center space-x-0.5"
        onMouseLeave={() => { if(editable && onHover) onHover(null); }}
    >
      {stars.map((starIndex) => {
        // Logic for display width
        let fillPercentage = '0%';
        if (rating >= starIndex) {
          fillPercentage = '100%';
        } else if (rating >= starIndex - 0.5) {
          fillPercentage = '50%';
        }

        return (
          <span
            key={starIndex}
            className={`relative inline-block ${editable ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ width: size, height: size }}
            onClick={(e) => handleClick(e, starIndex)}
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
          >
            {/* Background Star (Gray/Empty) */}
            <Star 
                size={size} 
                className="absolute top-0 left-0 text-gray-300 fill-gray-100" 
                strokeWidth={1.5}
            />

            {/* Foreground Star (Yellow/Filled) - Clipped */}
            <div 
                className="absolute top-0 left-0 overflow-hidden pointer-events-none" 
                style={{ width: fillPercentage, height: '100%', transition: 'width 0.1s ease' }}
            >
                <Star 
                    size={size} 
                    className="text-yellow-400 fill-yellow-400" 
                    strokeWidth={1.5}
                />
            </div>
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;