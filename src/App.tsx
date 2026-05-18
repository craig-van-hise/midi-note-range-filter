import { AlertCircle, Info, Settings, Settings2, Power } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Piano128, updateKeyVisuals128 } from './components/Piano128';
import { RangeSlider } from './components/RangeSlider';
import { useMidi } from './hooks/useMidi';
import { FilterMode, processNote } from './lib/midiProcessing';

const MODE_DESCRIPTIONS: Record<FilterMode, string> = {
  block: 'Mutes notes that fall outside the active range.',
  octave_wrap: 'Folds out-of-range notes by shifting them up or down by octaves until they fit.',
  wrap: 'Folds out-of-range notes back into the range directly.',
  limit: 'Clamps out-of-range notes to the nearest edge (min or max).'
};

export default function App() {
  const [isBypassed, setIsBypassed] = useState(false);
  const [activeMode, setActiveMode] = useState<FilterMode>('block');
  const [range, setRange] = useState<[number, number]>([0, 127]);
  const [activeMidiChannels, setActiveMidiChannels] = useState<number[]>(
    Array.from({ length: 16 }, (_, i) => i + 1)
  );

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { inputs, outputs, selectedInputId, setSelectedInputId, lastMessage } = useMidi();
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  
  const mappedNotesRef = useRef<Map<number, number>>(new Map());

  // Keep refs of current values for MIDI event processing
  const configRef = useRef({ isBypassed, activeMode, range, activeMidiChannels });
  useEffect(() => {
    configRef.current = { isBypassed, activeMode, range, activeMidiChannels };
  }, [isBypassed, activeMode, range, activeMidiChannels]);

  // Handle setting changes: flush pending notes to prevent sticking
  useEffect(() => {
    outputs.forEach(output => {
      for (let ch = 0; ch < 16; ch++) {
        mappedNotesRef.current.forEach((mappedNote, originalNote) => {
          output.send([0x80 + ch, mappedNote, 0]);
          output.send([0x80 + ch, originalNote, 0]);
        });
      }
    });

    mappedNotesRef.current.forEach((mappedNote, originalNote) => {
        updateKeyVisuals128(mappedNote, '');
        updateKeyVisuals128(originalNote, ''); // just in case
    });
    
    setActiveNotes(new Set());
    mappedNotesRef.current.clear();
  }, [activeMode, range, isBypassed]);

  // Handle incoming MIDI messages
  useEffect(() => {
    if (!lastMessage) return;

    const { isBypassed, activeMode, range, activeMidiChannels } = configRef.current;

    if (!activeMidiChannels.includes(lastMessage.channel)) {
      return; 
    }

    const { note, type } = lastMessage;

    if (type === 'noteon') {
      if (isBypassed) {
        updateKeyVisuals128(note, '#ef4444'); // Red for bypass
        setActiveNotes((prev) => new Set(prev).add(note));
        mappedNotesRef.current.set(note, note);
      } else {
        const processedNote = processNote(note, range[0], range[1], activeMode);
        if (processedNote !== null) {
          updateKeyVisuals128(processedNote, '#3b82f6');
          setActiveNotes((prev) => new Set(prev).add(processedNote));
          mappedNotesRef.current.set(note, processedNote);
        } else {
          // It's blocked, visualize as muted red
          updateKeyVisuals128(note, 'rgba(239, 68, 68, 0.4)');
          setActiveNotes((prev) => new Set(prev).add(note));
          mappedNotesRef.current.set(note, note);
        }
      }
    } else if (type === 'noteoff') {
      const mappedNote = mappedNotesRef.current.get(note);
      if (mappedNote !== undefined) {
        mappedNotesRef.current.delete(note);
        let isStillActive = false;
        for (const mapped of mappedNotesRef.current.values()) {
          if (mapped === mappedNote) isStillActive = true;
        }
        if (!isStillActive) {
          updateKeyVisuals128(mappedNote, '');
          setActiveNotes((prev) => {
            const next = new Set(prev);
            next.delete(mappedNote);
            return next;
          });
        }
      }
    }
  }, [lastMessage]); // ONLY re-run when lastMessage reference changes

  const handlePanic = () => {
    outputs.forEach(output => {
      for (let ch = 0; ch < 16; ch++) {
        output.send([0xB0 + ch, 123, 0]);
        for (let note = 0; note < 128; note++) {
          output.send([0x80 + ch, note, 0]);
        }
      }
    });
    activeNotes.forEach(note => updateKeyVisuals128(note, ''));
    setActiveNotes(new Set());
  };

  const toggleChannel = (ch: number) => {
    setActiveMidiChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col items-center select-none">
      
      {/* Top Header Strip */}
      <div className="w-full flex items-center justify-between bg-neutral-950 p-4 border-b border-neutral-800 shadow-xl z-10 px-8">
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-wider text-neutral-200">
            VV | MIDI Note Range Filter
          </h1>
        </div>
        
        <div className="flex-1 flex justify-center">
          <select 
            value={selectedInputId || ''} 
            onChange={(e) => setSelectedInputId(e.target.value)}
            className="bg-neutral-800 border border-neutral-600 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          >
            <option value="" disabled>Select MIDI IN</option>
            {inputs.map(input => (
              <option key={input.id} value={input.id}>{input.name || `Port ${input.id}`}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex justify-end gap-3">
          <button 
            onClick={() => setIsBypassed(!isBypassed)}
            className={`flex items-center justify-center w-10 h-10 rounded-full border ${isBypassed ? 'bg-neutral-800 text-neutral-500 border-neutral-700' : 'bg-green-500/10 text-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'}`}
            title="Bypass"
          >
            <Power size={20} />
          </button>
          <button 
            onClick={handlePanic}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            title="MIDI Panic"
          >
            <AlertCircle size={20} />
          </button>
          <button 
            onClick={() => setIsInfoModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-600 bg-neutral-800 hover:bg-neutral-700"
            title="Info"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-600 bg-neutral-800 hover:bg-neutral-700"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1050px] mt-6 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-4 flex flex-col gap-4">

        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">Processing Mode</label>
          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {(['block', 'octave_wrap', 'wrap', 'limit'] as FilterMode[]).map((mode) => (
              <Tooltip.Root key={mode}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setActiveMode(mode)}
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
              onValueChange={setRange} 
            />
            <Piano128 minRange={range[0]} maxRange={range[1]} />
          </div>
        </div>
      </div>

      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white">&times;</button>
            <h2 className="text-2xl font-bold mb-2">MIDI Note Range Filter</h2>
            <p className="text-sm text-neutral-400 mb-6 border-b border-neutral-700 pb-4">by Craig Van Hise</p>
            <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
              An interactive UI for managing, filtering, and remapping MIDI note data based on user-defined bounds.
            </p>
            <div className="flex flex-col gap-3">
              <a href="https://www.virtualvirgin.net/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm font-mono break-all">
                https://www.virtualvirgin.net/
              </a>
              <a href="https://github.com/craig-van-hise" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm font-mono break-all">
                https://github.com/craig-van-hise
              </a>
            </div>
          </div>
        </div>
      )}

      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsSettingsModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white">&times;</button>
            <div className="flex items-center gap-3 mb-6 border-b border-neutral-700 pb-4">
              <Settings2 size={24} className="text-neutral-400" />
              <h2 className="text-xl font-bold">Settings</h2>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Active MIDI Channels</h3>
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`w-10 h-10 rounded border text-sm font-mono transition-colors ${
                      activeMidiChannels.includes(ch)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-500 hover:bg-neutral-700'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Tooltip.Provider>
  );
}
