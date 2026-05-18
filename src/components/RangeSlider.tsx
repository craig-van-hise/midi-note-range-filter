import React, { useRef, useState, useEffect, useCallback } from 'react';

const SCALE = 0.75;
const WHITE_KEY_WIDTH = 17 * SCALE;
const TOTAL_WIDTH = 75 * WHITE_KEY_WIDTH; // 1275 * 0.75

// Calculate exact X geometric center of any MIDI note
export const getNoteCenterX = (note: number) => {
  const whiteKeyIndices = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
  const isWhite = [0, 2, 4, 5, 7, 9, 11].includes(note % 12);
  const whiteKeysBefore = Math.floor(note / 12) * 7 + whiteKeyIndices[note % 12];
  
  if (isWhite) {
    return (whiteKeysBefore + 0.5) * WHITE_KEY_WIDTH;
  } else {
    // Black keys are perfectly centered on the seam between the two adjacent white keys
    return (whiteKeysBefore + 1) * WHITE_KEY_WIDTH;
  }
};

const getClosestNote = (x: number) => {
  let minNote = 0;
  let minDist = Infinity;
  for (let i = 0; i <= 127; i++) {
    const cx = getNoteCenterX(i);
    const dist = Math.abs(cx - x);
    if (dist < minDist) {
      minDist = dist;
      minNote = i;
    }
  }
  return minNote;
};

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value, onValueChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingThumb, setDraggingThumb] = useState<'min' | 'max' | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, thumb: 'min' | 'max') => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingThumb(thumb);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingThumb || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const note = getClosestNote(x);

    let newMin = value[0];
    let newMax = value[1];

    if (draggingThumb === 'min') {
      newMin = Math.min(Math.max(note, min), value[1]);
    } else {
      newMax = Math.max(Math.min(note, max), value[0]);
    }

    if (newMin !== value[0] || newMax !== value[1]) {
      onValueChange([newMin, newMax]);
    }
  }, [draggingThumb, value, min, max, onValueChange]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (draggingThumb) {
      setDraggingThumb(null);
    }
  }, [draggingThumb]);

  useEffect(() => {
    if (draggingThumb) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingThumb, handlePointerMove, handlePointerUp]);

  const x1 = getNoteCenterX(value[0]);
  const x2 = getNoteCenterX(value[1]);

  return (
    <div style={{ width: `${TOTAL_WIDTH}px`, display: 'flex', flexDirection: 'column' }}>
        <div 
          ref={containerRef}
          style={{ width: `${TOTAL_WIDTH}px`, height: '32px', position: 'relative', touchAction: 'none' }}
          className="select-none mx-auto"
        >
          {/* Background Track */}
          <div className="absolute top-[22px] left-0 right-0 h-[4px] bg-neutral-800 rounded-full" />
          
          {/* Active Range Track */}
          <div 
            className="absolute top-[22px] h-[4px] bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            style={{ left: `${x1}px`, width: `${x2 - x1}px` }} 
          />

          {/* Thumbs */}
          <Thumb x={x1} value={value[0]} type="min" onPointerDown={(e) => handlePointerDown(e, 'min')} isDragging={draggingThumb === 'min'} />
          <Thumb x={x2} value={value[1]} type="max" onPointerDown={(e) => handlePointerDown(e, 'max')} isDragging={draggingThumb === 'max'} />
        </div>
    </div>
  );
};

const Thumb = ({ x, value, type, onPointerDown, isDragging }: { x: number, value: number, type: 'min' | 'max', onPointerDown: any, isDragging: boolean }) => {
  return (
    <div 
      onPointerDown={onPointerDown}
      className={`absolute top-[0px] flex flex-col items-center justify-center -translate-x-1/2 ${isDragging ? 'cursor-grabbing z-20' : 'cursor-grab z-10'}`}
      style={{ left: `${x}px` }}
    >
      <div className="bg-neutral-900 border border-blue-500 text-white font-mono text-[10px] leading-none px-1.5 py-0.5 rounded shadow-lg mb-[2px] pointer-events-none whitespace-nowrap">
        {value}
      </div>
      <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none drop-shadow-md">
         <path d="M7 15L0 8V3C0 1.34315 1.34315 0 3 0H11C12.6569 0 14 1.34315 14 3V8L7 15Z" fill="#171717" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
         <line x1="7" y1="3" x2="7" y2="7" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
};
