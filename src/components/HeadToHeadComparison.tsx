import { useEffect, useRef, useState } from 'react';
import type { ProcessedSeasonState } from '../types';
import { getDriverFuzzyImage } from '../utils';

interface HeadToHeadProps {
    state: ProcessedSeasonState;
}

// 1. Custom Select Component with Sleek Scrollbar & Cleaned Unused Variables
function CustomDriverSelect({
    selectedId,
    onChange,
    options,
    disabledId,
    state,
    label,
    activeColor
}: {
    selectedId: string;
    onChange: (id: string) => void;
    options: string[];
    disabledId: string;
    state: ProcessedSeasonState;
    label: string;
    activeColor: 'red' | 'blue';
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close the dropdown if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
            <label className="text-xs uppercase font-bold text-slate-400">{label}</label>
            <div className="relative">
                {/* Trigger Button */}
                <div
                    className={`flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1.5 cursor-pointer transition-colors ${isOpen ? (activeColor === 'red' ? 'border-red-500' : 'border-blue-500') : 'hover:border-slate-500'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <img
                        src={getDriverFuzzyImage(selectedId)}
                        alt="Selected Driver"
                        className="w-8 h-8 rounded-full border border-slate-600 object-cover object-top shrink-0 ml-2 shadow-inner"
                    />
                    <span className="w-full bg-transparent text-slate-200 font-bold px-3 py-1.5 select-none">
                        {state.globalNames[selectedId]}
                    </span>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* Dropdown Menu with Custom Thin Scrollbar */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                        {options.map((id) => {
                            const isDisabled = id === disabledId;
                            const isSelected = id === selectedId;
                            return (
                                <div
                                    key={id}
                                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors 
                                        ${isDisabled ? 'opacity-40 cursor-not-allowed bg-slate-950' : 'cursor-pointer hover:bg-slate-800'} 
                                        ${isSelected ? 'bg-slate-800 border-l-2 ' + (activeColor === 'red' ? 'border-red-500' : 'border-blue-500') : 'border-l-2 border-transparent'}
                                    `}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onChange(id);
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    <img
                                        src={getDriverFuzzyImage(id)}
                                        className="w-7 h-7 rounded-full border border-slate-600 object-cover object-top shrink-0 shadow-inner"
                                        alt={state.globalNames[id]}
                                    />
                                    <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        {state.globalNames[id]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// 2. Main Component
export default function HeadToHeadComparison({ state }: HeadToHeadProps) {
    const sortedDriverIds = Object.keys(state.globalNames).sort((a, b) => {
        const pointsA = state.globalHistory[a]?.[state.globalHistory[a]?.length - 1] || 0;
        const pointsB = state.globalHistory[b]?.[state.globalHistory[b]?.length - 1] || 0;
        return pointsB - pointsA;
    });

    const [driverA, setDriverA] = useState<string>(sortedDriverIds[0] || '');
    const [driverB, setDriverB] = useState<string>(sortedDriverIds[1] || '');

    if (sortedDriverIds.length < 2) return null;

    const statsA = state.driverStats[driverA] || { poles: 0, podiums: 0, titles: 0, debut: 2026 };
    const statsB = state.driverStats[driverB] || { poles: 0, podiums: 0, titles: 0, debut: 2026 };

    const pointsA = state.globalHistory[driverA]?.[state.globalHistory[driverA]?.length - 1] || 0;
    const pointsB = state.globalHistory[driverB]?.[state.globalHistory[driverB]?.length - 1] || 0;

    const renderStatRow = (label: string, valA: number, valB: number) => {
        const total = valA + valB || 1;
        const pctA = Math.round((valA / total) * 100);
        const pctB = Math.round((valB / total) * 100);

        return (
            <div className="flex flex-col gap-1 w-full my-2">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                    <span className={valA >= valB ? "text-red-500 font-black" : ""}>{valA}</span>
                    <span className="uppercase text-slate-500 tracking-wider">{label}</span>
                    <span className={valB >= valA ? "text-blue-500 font-black" : ""}>{valB}</span>
                </div>
                <div className="flex h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-red-600 transition-all duration-500" style={{ width: `${pctA}%` }}></div>
                    <div className="bg-blue-600 transition-all duration-500" style={{ width: `${pctB}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-[#090d16] border border-slate-800/80 rounded-xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-2 h-5 bg-red-600 rounded-sm inline-block"></span>
                    Head-To-Head Driver Telemetry
                </h2>
            </div>

            {/* Custom Driver Selectors */}
            <div className="grid grid-cols-2 gap-6">
                <CustomDriverSelect
                    label="Driver 1"
                    selectedId={driverA}
                    onChange={setDriverA}
                    options={sortedDriverIds}
                    disabledId={driverB}
                    state={state}
                    activeColor="red"
                />
                <CustomDriverSelect
                    label="Driver 2"
                    selectedId={driverB}
                    onChange={setDriverB}
                    options={sortedDriverIds}
                    disabledId={driverA}
                    state={state}
                    activeColor="blue"
                />
            </div>

            {/* Comparison Metrics */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-lg border border-slate-800/50 mt-2">
                {renderStatRow("Season Points", pointsA, pointsB)}
                {renderStatRow("Pole Positions", statsA.poles, statsB.poles)}
                {renderStatRow("Podiums", statsA.podiums, statsB.podiums)}
                {renderStatRow("World Titles", statsA.titles, statsB.titles)}
            </div>
        </div>
    );
}