import React from 'react';

const DIGIT_MAP: Record<string, boolean[]> = {
  // a, b, c, d, e, f, g (top, TR, BR, bottom, BL, TL, mid)
  '0': [true, true, true, true, true, true, false], 
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

const LcdDigit = ({ digit }: { digit: string }) => {
  const segments = DIGIT_MAP[digit] || DIGIT_MAP['0'];
  // Tailwind zinc-500 (#71717a) for active segments
  const ACTIVE = "#71717a";
  // Faint version for inactive segments
  const INACTIVE = "rgba(113, 113, 122, 0.15)";

  const Seg = ({ active, d }: { active: boolean, d: string }) => (
    <path d={d} fill={active ? ACTIVE : INACTIVE} />
  );

  return (
      <svg viewBox="0 0 30 50" className="w-[14px] h-[24px] relative">
      <Seg active={segments[0]} d="M 6 2 L 24 2 L 20 6 L 10 6 Z" />
      <Seg active={segments[1]} d="M 26 4 L 26 23 L 22 19 L 22 8 Z" />
      <Seg active={segments[2]} d="M 26 27 L 26 46 L 22 42 L 22 31 Z" />
      <Seg active={segments[3]} d="M 10 44 L 20 44 L 24 48 L 6 48 Z" />
      <Seg active={segments[4]} d="M 4 27 L 4 46 L 8 42 L 8 31 Z" />
      <Seg active={segments[5]} d="M 4 4 L 4 23 L 8 19 L 8 8 Z" />
      <Seg active={segments[6]} d="M 6 25 L 9 23 L 21 23 L 24 25 L 21 27 L 9 27 Z" />
    </svg>
  );
};

interface DigitalTimerProps {
  seconds: number;
}

export const DigitalTimer: React.FC<DigitalTimerProps> = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  const mStr = mins.toString().padStart(2, '0');
  const sStr = secs.toString().padStart(2, '0');

  return (
    <div className="flex items-center rounded-md">
      <div className="relative flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
        
        {/* Minutes */}
        <div className="flex gap-[1px]">
          <LcdDigit digit={mStr[0]} />
          <LcdDigit digit={mStr[1]} />
        </div>
        
        {/* Colon and generic scale */}
        <div className="flex flex-col gap-1.5 justify-center h-6 px-0.5 relative">
          <div className="w-1 h-1 bg-zinc-500 rounded-[1px]" />
          <div className="w-1 h-1 bg-zinc-500 rounded-[1px]" />
        </div>

        {/* Seconds */}
        <div className="flex gap-[1px] relative">
          <LcdDigit digit={sStr[0]} />
          <LcdDigit digit={sStr[1]} />
        </div>

      </div>
    </div>
  );
};
