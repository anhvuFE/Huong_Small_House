import React, { useState, useEffect, useCallback, useRef } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  step = 10000,
  value,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback((newValue: [number, number]) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
    }, 100);
  }, [onChange]);

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= localValue[1] - step) {
      const newValue: [number, number] = [newMin, localValue[1]];
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    }
  }, [localValue, step, debouncedOnChange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= localValue[0] + step) {
      const newValue: [number, number] = [localValue[0], newMax];
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    }
  }, [localValue, step, debouncedOnChange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="w-full px-2">
      <div className="relative pt-8 pb-2">
        <div className="relative h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-150 ease-out shadow-sm"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-white [&::-webkit-slider-thumb]:to-gray-50 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-white [&::-moz-range-thumb]:to-gray-50 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95"
          style={{ top: '-7px', zIndex: localValue[0] === max ? 5 : 3 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-white [&::-webkit-slider-thumb]:to-gray-50 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-white [&::-moz-range-thumb]:to-gray-50 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95"
          style={{ top: '-7px', zIndex: 4 }}
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className={`flex flex-col transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}>
          <span className="text-xs text-gray-600 font-medium">Từ</span>
          <span className="font-bold text-lg text-primary">
            {formatPrice(localValue[0])}đ
          </span>
        </div>
        <div className="flex-1 mx-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>
        <div className={`flex flex-col text-right transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}>
          <span className="text-xs text-gray-600 font-medium">Đến</span>
          <span className="font-bold text-lg text-primary">
            {formatPrice(localValue[1])}đ
          </span>
        </div>
      </div>
    </div>
  );
};