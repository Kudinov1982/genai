import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface ModernSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

interface FormSelectProps {
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export function useClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export const ModernSelect: React.FC<ModernSelectProps> = ({ options, value, onChange, label, icon, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 rounded-xl text-sm font-bold text-ink-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group
        ${isOpen ? 'border-ink-800 shadow-md ring-0' : 'border-paper-200 hover:border-ink-300'}
        `}
      >
        <div className="flex items-center gap-3 truncate">
          {/* Icon with background */}
          {icon && (
              <div className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-ink-100 text-ink-900' : 'bg-paper-100 text-ink-500 group-hover:bg-ink-50 group-hover:text-ink-700'}`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 16, strokeWidth: 2.5 }) : icon}
              </div>
          )}
          <div className="flex flex-col items-start leading-none gap-1">
            {label && <span className="text-[10px] text-ink-400 uppercase tracking-widest font-bold">{label}</span>}
            <span className="text-ink-900 text-sm">{selectedOption?.label}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-ink-900' : ''}`} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[180px] right-0 bg-white rounded-xl shadow-xl border-2 border-paper-100 py-2 animate-slide-up transform origin-top overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-all border-l-4
                ${
                option.value === value 
                  ? 'bg-paper-50 border-accent-500 text-ink-900 font-bold' 
                  : 'border-transparent text-ink-600 hover:bg-paper-50 hover:border-paper-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
              {option.value === value && <Check className="w-4 h-4 text-accent-600" strokeWidth={3} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FormSelect: React.FC<FormSelectProps> = ({ options, value, onChange, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2 border bg-paper-50 outline-none transition-colors text-left ${
          isOpen ? 'bg-white border-accent-500 ring-1 ring-accent-500' : 'border-paper-300 hover:border-ink-400'
        }`}
      >
        <span className={selectedOption ? 'text-ink-900' : 'text-ink-400'}>
          {selectedOption ? selectedOption.label : placeholder || 'Выберите...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-paper-300 shadow-xl max-h-60 overflow-y-auto animate-slide-up left-0">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors hover:bg-paper-100 border-b border-paper-100 last:border-0 ${
                option.value === value ? 'bg-paper-50 text-accent-700 font-bold' : 'text-ink-700'
              }`}
            >
              {option.label}
              {option.value === value && <Check className="w-4 h-4 text-accent-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ModernBadge: React.FC<{ children: React.ReactNode, color?: 'blue' | 'gray' | 'green' | 'purple' }> = ({ children, color = 'blue' }) => {
    const colors = {
        blue: 'bg-ink-50 text-ink-700 border-ink-100',
        gray: 'bg-paper-100 text-ink-600 border-paper-200',
        green: 'bg-green-50 text-green-700 border-green-100',
        purple: 'bg-accent-50 text-accent-700 border-accent-100',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border cursor-default ${colors[color]}`}>
            {children}
        </span>
    );
};

export const Tooltip: React.FC<{ content: string; children: React.ReactNode; position?: 'top' | 'bottom'; className?: string }> = ({ content, children, position = 'top', className = '' }) => {
  return (
    <div className={`group/tooltip relative inline-flex ${className}`}>
      {children}
      <div className={`
        absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 
        hidden group-hover/tooltip:block 
        px-2.5 py-1.5 bg-ink-800 text-paper-50 text-[10px] font-bold uppercase tracking-wide rounded shadow-lg whitespace-nowrap z-50 pointer-events-none animate-fade-in border border-ink-700
      `}>
        {content}
        <div className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${position === 'top' ? 'top-full border-t-ink-800' : 'bottom-full border-b-ink-800'}`} />
      </div>
    </div>
  );
};