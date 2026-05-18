import { useEffect, useState, useCallback } from 'react';

export type MidiMessage = {
  note: number;
  velocity: number;
  type: 'noteon' | 'noteoff';
  channel: number;
};

export function useMidi() {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<MidiMessage | null>(null);

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(
        (access) => {
          setMidiAccess(access);
          const updatePorts = () => {
            const inputsArray = Array.from(access.inputs.values());
            const outputsArray = Array.from(access.outputs.values());
            setInputs(inputsArray);
            setOutputs(outputsArray);
            if (inputsArray.length > 0 && !selectedInputId) {
              setSelectedInputId(inputsArray[0].id);
            }
          };
          updatePorts();
          access.onstatechange = updatePorts;
        },
        (err) => console.error('MIDI Access Failed', err)
      );
    } else {
      console.warn('Web MIDI API not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    if (!midiAccess || !selectedInputId) return;

    const input = midiAccess.inputs.get(selectedInputId);
    if (!input) return;

    const handleMessage = (event: WebMidi.MIDIMessageEvent) => {
      const [status, data1, data2] = event.data;
      const cmd = status >> 4;
      const channel = (status & 0xf) + 1;
      
      const type = cmd === 9 && data2 > 0 ? 'noteon' : (cmd === 8 || (cmd === 9 && data2 === 0)) ? 'noteoff' : null;
      
      if (type) {
        setLastMessage({
          note: data1,
          velocity: data2,
          type,
          channel
        });
      }
    };

    input.onmidimessage = handleMessage;

    return () => {
      input.onmidimessage = null;
    };
  }, [midiAccess, selectedInputId]);

  return { midiAccess, inputs, outputs, selectedInputId, setSelectedInputId, lastMessage };
}
