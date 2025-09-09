'use client';

import { useState, useEffect } from 'react';
import DualRangeSlider from './DualRangeSlider';

interface FilterOptions {
  minMarketCap: number | null;
  maxMarketCap: number | null;
  dateRange: 'all' | '1h' | '24h' | '7d' | '30d';
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

const MARKET_CAP_PRESETS = [
  { label: 'All', min: null, max: null },
  { label: '$0 - $10K', min: 0, max: 10000 },
  { label: '$10K - $100K', min: 10000, max: 100000 },
  { label: '$100K - $1M', min: 100000, max: 1000000 },
  { label: '$1M+', min: 1000000, max: null },
];

const DATE_RANGE_OPTIONS = [
  { label: 'All Time', value: 'all' as const },
  { label: 'Last Hour', value: '1h' as const },
  { label: 'Last 24 Hours', value: '24h' as const },
  { label: 'Last 7 Days', value: '7d' as const },
  { label: 'Last 30 Days', value: '30d' as const },
];

export default function FilterPanel({ 
  isOpen, 
  onClose, 
  onFiltersChange, 
  initialFilters 
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(10000000); // 10M max
  const [isUsingCustomRange, setIsUsingCustomRange] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Initialize slider values based on current filters
      if (filters.minMarketCap !== null || filters.maxMarketCap !== null) {
        setSliderMin(filters.minMarketCap || 0);
        setSliderMax(filters.maxMarketCap || 10000000);
        setIsUsingCustomRange(true);
      }
    }
  }, [isOpen, filters.minMarketCap, filters.maxMarketCap]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleApplyFilters = () => {
    const updatedFilters = {
      ...filters,
      minMarketCap: isUsingCustomRange ? (sliderMin > 0 ? sliderMin : null) : filters.minMarketCap,
      maxMarketCap: isUsingCustomRange ? (sliderMax < 10000000 ? sliderMax : null) : filters.maxMarketCap,
    };

    onFiltersChange(updatedFilters);
    handleClose();
  };

  const handleMarketCapPreset = (preset: typeof MARKET_CAP_PRESETS[0]) => {
    setFilters({
      ...filters,
      minMarketCap: preset.min,
      maxMarketCap: preset.max,
    });
    setIsUsingCustomRange(false);
  };

  const handleSliderChange = (min: number, max: number) => {
    setSliderMin(min);
    setSliderMax(max);
    setIsUsingCustomRange(true);
    // Clear preset selection when using custom slider
    setFilters({
      ...filters,
      minMarketCap: null,
      maxMarketCap: null,
    });
  };

  const formatMarketCapValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const handleDateRangeChange = (dateRange: FilterOptions['dateRange']) => {
    setFilters({
      ...filters,
      dateRange,
    });
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      minMarketCap: null,
      maxMarketCap: null,
      dateRange: 'all',
    };
    setFilters(clearedFilters);
    setSliderMin(0);
    setSliderMax(10000000);
    setIsUsingCustomRange(false);
    onFiltersChange(clearedFilters);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 transition-opacity duration-200 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 theme-bg-secondary theme-border-primary border rounded-2xl p-6 transform transition-all duration-200 max-h-[80vh] overflow-y-auto ${
        isVisible 
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-4 scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="theme-text-primary text-xl font-semibold">Filter Tokens</h2>
          <button
            onClick={handleClose}
            className="theme-text-secondary hover:theme-text-primary transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Market Cap Filter */}
        <div className="mb-6">
          <h3 className="theme-text-primary text-sm font-medium mb-3">Market Cap</h3>
          
          {/* Market Cap Presets */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {MARKET_CAP_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleMarketCapPreset(preset)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                  !isUsingCustomRange && filters.minMarketCap === preset.min && filters.maxMarketCap === preset.max
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2a2a2a] text-[#a1a1aa] hover:bg-[#333333] hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Range Slider */}
          <div className="space-y-3">
            <p className="text-[#a1a1aa] text-xs">Custom Range</p>
            <DualRangeSlider
              min={0}
              max={10000000}
              minValue={sliderMin}
              maxValue={sliderMax}
              step={1000}
              onChange={handleSliderChange}
              formatValue={formatMarketCapValue}
              className="px-2"
            />
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-8">
          <h3 className="text-white text-sm font-medium mb-3">Created</h3>
          <div className="grid grid-cols-2 gap-2">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                  filters.dateRange === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2a2a2a] text-[#a1a1aa] hover:bg-[#333333] hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className="flex-1 bg-[#2a2a2a] hover:bg-[#333333] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export type { FilterOptions };