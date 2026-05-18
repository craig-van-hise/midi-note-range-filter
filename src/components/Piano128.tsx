import React from 'react';

const SCALE = 0.75;
const WHITE_KEY_WIDTH = 17 * SCALE;
const WHITE_KEY_HEIGHT = 78 * SCALE;
const BLACK_KEY_WIDTH = 10 * SCALE;
const BLACK_KEY_HEIGHT = 52 * SCALE;

interface Piano128Props {
    middleC?: 'C3' | 'C4' | 'C5';
    minRange: number;
    maxRange: number;
}

export const Piano128: React.FC<Piano128Props> = ({ middleC = 'C4', minRange, maxRange }) => {
    const pianoKeys = [];

    // Range: MIDI 0 to 127
    for (let note = 0; note <= 127; note++) {
        const noteInOctave = note % 12;
        const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);
        
        const isOutOfRange = note < minRange || note > maxRange;

        if (!isBlack) {
            const hasRightBlack = [0, 2, 5, 7, 9].includes(noteInOctave) && (note + 1 <= 127);
            const isC = noteInOctave === 0;
            const octave = Math.floor(note / 12) + (middleC === 'C3' ? -2 : middleC === 'C5' ? 0 : -1);

            pianoKeys.push(
                <div
                    key={`w-${note}`}
                    id={`pk128-${note}`}
                    style={{
                        width: `${WHITE_KEY_WIDTH}px`,
                        height: `${WHITE_KEY_HEIGHT}px`,
                        borderLeft: '1px solid #ccc',
                        borderRight: '1px solid #ccc',
                        backgroundColor: '#fff',
                        position: 'relative',
                        boxSizing: 'border-box',
                        borderBottomLeftRadius: '3px',
                        borderBottomRightRadius: '3px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        flexShrink: 0
                    }}
                >
                    {/* Darken overlay for white keys out of range */}
                    {isOutOfRange && (
                        <div style={{
                            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', pointerEvents: 'none', zIndex: 1
                        }} />
                    )}

                    {hasRightBlack && (
                        <div
                            id={`pk128-${note + 1}`}
                            style={{
                                position: 'absolute',
                                zIndex: 10,
                                top: 0,
                                right: `-${BLACK_KEY_WIDTH / 2}px`, // Perfectly centered on the seam (half of actual width)
                                width: `${BLACK_KEY_WIDTH}px`,
                                height: `${BLACK_KEY_HEIGHT}px`,
                                backgroundColor: '#3a3a3a',
                                borderBottom: '6px solid #050505',
                                borderLeft: '1px solid #050505',
                                borderRight: '1px solid #050505',
                                borderTop: 'none',
                                borderRadius: '0',
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* Darken overlay for black keys out of range */}
                            {(note + 1 < minRange || note + 1 > maxRange) && (
                                <div style={{
                                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', pointerEvents: 'none', zIndex: 12
                                }} />
                            )}
                        </div>
                    )}
                    {isC && (
                        <span style={{
                            fontSize: '8px', 
                            fontFamily: 'sans-serif',
                            color: '#333',
                            marginBottom: '5px',
                            pointerEvents: 'none',
                            userSelect: 'none',
                            zIndex: 2
                        }}>
                            C{octave}
                        </span>
                    )}
                </div>
            );
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
                style={{
                    display: 'flex',
                    width: `${1275 * 0.75}px`, // 75 white keys scaled by 0.75
                    height: `${WHITE_KEY_HEIGHT}px`,
                    backgroundColor: '#fff',
                    borderTop: '2px solid #333',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    position: 'relative'
                }}
            >
                {pianoKeys}
            </div>
        </div>
    );
};

export const updateKeyVisuals128 = (note: number, color: string) => {
    const el = document.getElementById(`pk128-${note}`);
    if (!el) return;

    const isBlack = [1, 3, 6, 8, 10].includes(note % 12);

    if (color) {
        el.style.backgroundColor = color;
        if (color.startsWith('rgba')) {
            el.style.boxShadow = `inset 0 -4px 8px rgba(0,0,0,0.2)`; 
        } else {
            el.style.boxShadow = `inset 0 -4px 8px rgba(0,0,0,0.1), 0 0 10px ${color}`;
        }
        if (isBlack) el.style.zIndex = '11';
    } else {
        el.style.backgroundColor = isBlack ? '#3a3a3a' : '#fff';
        el.style.boxShadow = '';
        if (isBlack) el.style.zIndex = '10';
    }
};
