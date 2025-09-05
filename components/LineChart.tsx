'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface LineChartProps {
  data: number[];
  labels: string[];
  isPositive: boolean;
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  value: number;
  label: string;
  visible: boolean;
}

interface CrosshairData {
  x: number;
  y: number;
  visible: boolean;
}

export default function LineChart({ data, labels, isPositive, className = '' }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    value: 0,
    label: '',
    visible: false
  });
  const [crosshair, setCrosshair] = useState<CrosshairData>({
    x: 0,
    y: 0,
    visible: false
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Chart dimensions with padding
    const padding = 20;
    const chartWidth = rect.width - padding * 2;

    if (mouseX < padding || mouseX > rect.width - padding) {
      setTooltip(prev => ({ ...prev, visible: false }));
      setCrosshair(prev => ({ ...prev, visible: false }));
      return;
    }

    // Find the closest data point
    const relativeX = (mouseX - padding) / chartWidth;
    const dataIndex = Math.round(relativeX * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    const value = data[clampedIndex];
    const label = labels[clampedIndex];

    // Calculate the exact chart position for the crosshair
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1;
    const chartHeight = rect.height - padding * 2;
    
    const chartY = padding + (1 - (value - minValue) / valueRange) * chartHeight;
    const chartX = padding + (clampedIndex / (data.length - 1)) * chartWidth;

    // Position tooltip
    const containerRect = container.getBoundingClientRect();
    const tooltipX = event.clientX - containerRect.left;
    const tooltipY = event.clientY - containerRect.top - 10;

    setTooltip({
      x: tooltipX,
      y: tooltipY,
      value,
      label,
      visible: true
    });

    // Position crosshair at the actual data point
    setCrosshair({
      x: chartX,
      y: chartY,
      visible: true
    });
  }, [data, labels]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setCrosshair(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Find min and max values for scaling
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1;

    // Chart dimensions with padding
    const padding = 20;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Calculate points
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + (1 - (value - minValue) / valueRange) * chartHeight;
      return { x, y };
    });

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = isPositive ? '#10b981' : '#ef4444'; // green or red
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();

    // Draw gradient fill under the line
    if (points.length > 1) {
      const gradient = ctx.createLinearGradient(0, padding, 0, rect.height - padding);
      gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      ctx.lineTo(points[points.length - 1].x, rect.height - padding);
      ctx.lineTo(points[0].x, rect.height - padding);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw dots on data points (only show a few to avoid clutter)
    const dotInterval = Math.max(1, Math.floor(data.length / 10));
    ctx.fillStyle = isPositive ? '#10b981' : '#ef4444';
    
    points.forEach((point, index) => {
      if (index % dotInterval === 0 || index === points.length - 1) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [data, labels, isPositive, handleMouseMove, handleMouseLeave]);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-[#a1a1aa] text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Crosshair Lines */}
      {crosshair.visible && (
        <>
          {/* Horizontal line */}
          <div
            className="absolute w-full h-px bg-white opacity-20 pointer-events-none"
            style={{
              top: crosshair.y,
              left: 0,
            }}
          />
          {/* Vertical line */}
          <div
            className="absolute w-px h-full bg-white opacity-20 pointer-events-none"
            style={{
              left: crosshair.x,
              top: 0,
            }}
          />
          {/* Highlight dot */}
          <div
            className="absolute w-2 h-2 rounded-full border-2 border-white pointer-events-none"
            style={{
              left: crosshair.x - 4,
              top: crosshair.y - 4,
              backgroundColor: isPositive ? '#10b981' : '#ef4444',
            }}
          />
        </>
      )}
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-10 bg-black border border-[#333333] rounded-lg px-3 py-2 text-sm pointer-events-none shadow-lg"
          style={{
            left: tooltip.x - 60,
            top: tooltip.y - 60,
            transform: 'translate(0, 0)'
          }}
        >
          <div className="text-white font-semibold">
            {tooltip.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6
            })} STRK
          </div>
          <div className="text-[#a1a1aa] text-xs">
            {tooltip.label}
          </div>
        </div>
      )}
    </div>
  );
}