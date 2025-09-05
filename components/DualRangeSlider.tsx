'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  onChange: (minVal: number, maxVal: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

export default function DualRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  onChange,
  formatValue = (val) => val.toString(),
  className = '',
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [tempMinValue, setTempMinValue] = useState(minValue);
  const [tempMaxValue, setTempMaxValue] = useState(maxValue);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update temp values when props change
  useEffect(() => {
    setTempMinValue(minValue);
    setTempMaxValue(maxValue);
  }, [minValue, maxValue]);

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const value = min + (percentage / 100) * (max - min);
    
    // Round to step
    return Math.round(value / step) * step;
  };

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const newValue = getValueFromPosition(e.clientX);
    
    if (isDragging === 'min') {
      const clampedValue = Math.min(newValue, tempMaxValue - step);
      const finalValue = Math.max(min, clampedValue);
      setTempMinValue(finalValue);
      onChange(finalValue, tempMaxValue);
    } else {
      const clampedValue = Math.max(newValue, tempMinValue + step);
      const finalValue = Math.min(max, clampedValue);
      setTempMaxValue(finalValue);
      onChange(tempMinValue, finalValue);
    }
  }, [isDragging, tempMinValue, tempMaxValue, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newValue = getValueFromPosition(touch.clientX);
    
    if (isDragging === 'min') {
      const clampedValue = Math.min(newValue, tempMaxValue - step);
      const finalValue = Math.max(min, clampedValue);
      setTempMinValue(finalValue);
      onChange(finalValue, tempMaxValue);
    } else {
      const clampedValue = Math.max(newValue, tempMinValue + step);
      const finalValue = Math.min(max, clampedValue);
      setTempMaxValue(finalValue);
      onChange(tempMinValue, finalValue);
    }
  }, [isDragging, tempMinValue, tempMaxValue, min, max, step, onChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const minPercentage = getPercentage(tempMinValue);
  const maxPercentage = getPercentage(tempMaxValue);

  return (
    <div className={`w-full ${className}`}>
      {/* Value Display */}
      <div className="flex justify-between mb-3">
        <span className="text-xs text-[#a1a1aa]">
          {formatValue(tempMinValue)}
        </span>
        <span className="text-xs text-[#a1a1aa]">
          {formatValue(tempMaxValue)}
        </span>
      </div>

      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="relative h-6 cursor-pointer"
      >
        {/* Track Background */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-[#2a2a2a] rounded-full">
          {/* Active Range */}
          <div 
            className="absolute h-full bg-blue-500 rounded-full transition-all duration-150"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />
        </div>

        {/* Min Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-grab transition-all duration-150 ${
            isDragging === 'min' ? 'cursor-grabbing scale-110 shadow-lg' : 'hover:scale-105'
          }`}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging('min');
          }}
        >
          {/* Handle Grip Lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-3 bg-blue-500 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Max Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-grab transition-all duration-150 ${
            isDragging === 'max' ? 'cursor-grabbing scale-110 shadow-lg' : 'hover:scale-105'
          }`}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging('max');
          }}
        >
          {/* Handle Grip Lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-3 bg-blue-500 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-[#666666]">
          {formatValue(min)}
        </span>
        <span className="text-xs text-[#666666]">
          {formatValue(max)}
        </span>
      </div>
    </div>
  );
}