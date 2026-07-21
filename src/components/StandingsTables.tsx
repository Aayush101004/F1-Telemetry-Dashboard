import React from 'react';
import { getNormalizedTeamKey, LOGOS, TEAM_COLORS } from '../config';
import type { ProcessedSeasonState, TooltipState } from '../types';

interface Props {
    state: ProcessedSeasonState;
    scopeIndex: number;
    selectedDrivers: Set<string>;
    setSelectedDrivers: React.Dispatch<React.SetStateAction<Set<string>>>;
    setTooltipState: React.Dispatch<React.SetStateAction<TooltipState>>;
}

// Extracted to prevent nested-component re-rendering issues
function renderRankChange(current: number, prev: number, scopeIndex: number) {
    if (scopeIndex === 0 || prev === 0) return <span className="text-slate-600 text-[11px] font-black block mt-1">-</span>;
    const diff = prev - current;
    if (diff > 0) return <span className="text-emerald-500 text-[11px] font-black block mt-1">▲ {diff}</span>;
    if (diff < 0) return <span className="text-red-500 text-[11px] font-black block mt-1">▼ {Math.abs(diff)}</span>;
    return <span className="text-slate-600 text-[11px] font-black block mt-1">-</span>;
}

export default function StandingsTables({ state, scopeIndex, selectedDrivers, setSelectedDrivers, setTooltipState }: Props) {
    const sortedDrivers = Object.keys(state.globalNames).sort((a, b) => (state.globalHistory[b][scopeIndex] || 0) - (state.globalHistory[a][scopeIndex] || 0));
    const prevSortedDrivers = scopeIndex > 0 ? [...Object.keys(state.globalNames)].sort((a, b) => (state.globalHistory[b][scopeIndex - 1] || 0) - (state.globalHistory[a][scopeIndex - 1] || 0)) : [];

    const toggleDriver = (dId: string) => {
        setSelectedDrivers(prev => {
            const next = new Set(prev);
            if (next.has(dId)) next.delete(dId);
            else next.add(dId);
            return next;
        });
    };

    return (
        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider">Drivers Championship</h2>
                <div className="flex items-center gap-3 text-sm font-bold tracking-wide">
                    <button onClick={() => setSelectedDrivers(new Set(Object.keys(state.globalNames)))} className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer">Select All</button>
                    <span className="text-slate-700 font-normal">|</span>
                    <button onClick={() => setSelectedDrivers(new Set())} className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer">Clear All</button>
                </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[600px]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800/80 text-slate-500 uppercase text-[11px] tracking-widest font-black">
                            <th className="pb-3 text-center w-16">POS</th>
                            <th className="pb-3 w-10"></th>
                            <th className="pb-3 pl-4">DRIVER</th>
                            <th className="pb-3 text-right pr-4">POINTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDrivers.map((dId, idx) => {
                            const pts = state.globalHistory[dId][scopeIndex] || 0;
                            const teamKey = getNormalizedTeamKey(state.driverTeamMap[dId]);
                            const logo = LOGOS[teamKey] || '';
                            const color = TEAM_COLORS[teamKey] || '#94a3b8';
                            const currentRank = idx + 1;
                            const prevRank = scopeIndex > 0 ? prevSortedDrivers.indexOf(dId) + 1 : 0;

                            return (
                                <tr key={dId} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors group">
                                    <td className="py-4 w-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="font-black text-slate-200 text-lg leading-none">{currentRank}</span>
                                            {renderRankChange(currentRank, prevRank, scopeIndex)}
                                        </div>
                                    </td>
                                    <td className="py-4 w-10 text-center">
                                        <input type="checkbox" checked={selectedDrivers.has(dId)} onChange={() => toggleDriver(dId)} className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-blue-600 cursor-pointer" />
                                    </td>
                                    <td className="py-4 pl-4 font-medium flex items-center gap-4 cursor-pointer"
                                        onClick={() => toggleDriver(dId)}
                                        onMouseMove={(e) => setTooltipState({ type: 'driver-stats', id: dId, x: e.clientX, y: e.clientY })}
                                        onMouseLeave={() => setTooltipState({ type: null, id: null, x: 0, y: 0 })}>
                                        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }}></div>
                                        {logo && <img src={logo} className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />}

                                        {/* Driver name with team-colored bottom line reveal on group hover */}
                                        <div className="relative inline-block pb-0.5">
                                            <span className="text-[17px] font-bold text-slate-200 group-hover:text-white transition-colors">
                                                {state.globalNames[dId]}
                                            </span>
                                            <span
                                                className="absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full rounded-full"
                                                style={{ backgroundColor: color }}
                                            ></span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right font-black text-white text-lg tabular-nums pr-4">{pts}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}