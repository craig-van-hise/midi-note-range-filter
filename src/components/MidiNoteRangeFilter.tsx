import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Piano128 } from './Piano128';
import { RangeSlider } from './RangeSlider';
import { FilterMode } from '../lib/midiProcessing';

const MODE_DESCRIPTIONS: Record<FilterMode, string> = {
  block: 'Mutes notes that fall outside the active range.',
  octave_wrap: 'Folds out-of-range notes by shifting them up or down by octaves until they fit.',
  wrap: 'Folds out-of-range notes back into the range directly.',
  limit: 'Clamps out-of-range notes to the nearest edge (min or max).'
};

export interface MidiNoteRangeFilterProps {
  activeMode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export function MidiNoteRangeFilter({
  activeMode,
  onModeChange,
  range,
  onRangeChange,
}: MidiNoteRangeFilterProps) {
  return (
    <div className="w-full max-w-[1050px] mt-6 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-4 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">Processing Mode</label>
        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          {(['block', 'octave_wrap', 'wrap', 'limit'] as FilterMode[]).map((mode) => (
            <Tooltip.Root key={mode}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => onModeChange(mode)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeMode === mode 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  {mode === 'block' ? 'Block' :
                   mode === 'octave_wrap' ? 'Octave Wrap' :
                   mode === 'wrap' ? 'Wrap' : 'Limit'}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="bg-neutral-800 text-neutral-200 text-xs px-3 py-2 rounded shadow-lg border border-neutral-700 max-w-[200px] text-center"
                  sideOffset={8}
                >
                  {MODE_DESCRIPTIONS[mode]}
                  <Tooltip.Arrow className="fill-neutral-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-xl overflow-x-auto w-full max-w-full thin-scrollbar">
        <div className="w-fit mx-auto flex flex-col items-center pt-4 pb-4 px-4 gap-0">
          <RangeSlider 
            min={0} 
            max={127} 
            value={range} 
            onValueChange={onRangeChange} 
          />
          <Piano128 minRange={range[0]} maxRange={range[1]} />
        </div>
      </div>
    </div>
  );
}
