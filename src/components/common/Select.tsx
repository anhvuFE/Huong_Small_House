import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 lg:px-4 py-2 lg:py-2.5 text-left bg-white border rounded-lg transition-all duration-200',
          'flex items-center justify-between gap-2 text-sm lg:text-base',
          'hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
        )}
      >
        <span className={cn(
          'truncate',
          selectedOption ? 'text-gray-800' : 'text-gray-400'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown
          className={cn(
            'w-4 h-4 lg:w-5 lg:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full px-3 lg:px-4 py-2 lg:py-2.5 text-left flex items-center justify-between text-sm lg:text-base',
                  'transition-colors duration-150',
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'hover:bg-primary/5 text-gray-700 hover:text-gray-900',
                  option.value === value && !option.disabled && 'bg-primary/10 text-primary font-medium'
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && !option.disabled && (
                  <FiCheck className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option: SelectOption) => {
    if (value.includes(option.value)) {
      onChange(value.filter(v => v !== option.value));
    } else {
      onChange([...value, option.value]);
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-2.5 text-left bg-white border rounded-lg transition-all duration-200',
          'flex items-center justify-between gap-2',
          'hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
        )}
      >
        <span className={cn(
          'truncate',
          selectedOptions.length > 0 ? 'text-gray-800' : 'text-gray-400'
        )}>
          {selectedOptions.length > 0
            ? `${selectedOptions.length} mục đã chọn`
            : placeholder}
        </span>
        <FiChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggle(option)}
                className={cn(
                  'w-full px-4 py-2.5 text-left flex items-center justify-between',
                  'hover:bg-primary/5 transition-colors duration-150',
                  value.includes(option.value)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:text-gray-900'
                )}
              >
                <span className="truncate">{option.label}</span>
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  value.includes(option.value)
                    ? 'bg-primary border-primary'
                    : 'border-gray-300'
                )}>
                  {value.includes(option.value) && (
                    <FiCheck className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
