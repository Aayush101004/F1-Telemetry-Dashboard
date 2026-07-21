import React from 'react';
import { CARS, TEAM_COLORS, TEAM_DISPLAY_NAMES } from '../config';
import type { ProcessedSeasonState, TooltipState } from '../types';

interface Props {
    state: ProcessedSeasonState;
    scopeIndex: number;
    selectedTeams: Set<string>;
    setSelectedTeams: React.Dispatch<React.SetStateAction<Set<string>>>;
    year: number;
    setTooltipState: React.Dispatch<React.SetStateAction<TooltipState>>;
}

function renderRankChange(current: number, prev: number, scopeIndex: number) {
    if (scopeIndex === 0 || prev === 0) return <span className="text-slate-600 text-[11px] font-black block mt-1">-</span>;
    const diff = prev - current;
    if (diff > 0) return <span className="text-emerald-500 text-[11px] font-black block mt-1">▲ {diff}</span>;
    if (diff < 0) return <span className="text-red-500 text-[11px] font-black block mt-1">▼ {Math.abs(diff)}</span>;
    return <span className="text-slate-600 text-[11px] font-black block mt-1">-</span>;
}

export default function ConstructorStandings({ state, scopeIndex, selectedTeams, setSelectedTeams, year, setTooltipState }: Props) {
    const validTeams = Object.keys(TEAM_DISPLAY_NAMES).filter(t => t !== 'cadillac' || year >= 2026);
    const sortedTeams = [...validTeams].sort((a, b) => (state.teamHistory[b]?.[scopeIndex] || 0) - (state.teamHistory[a]?.[scopeIndex] || 0));
    const prevSortedTeams = scopeIndex > 0 ? [...validTeams].sort((a, b) => (state.teamHistory[b]?.[scopeIndex - 1] || 0) - (state.teamHistory[a]?.[scopeIndex - 1] || 0)) : [];

    const toggleTeam = (tId: string) => {
        setSelectedTeams(prev => {
            const next = new Set(prev);
            if (next.has(tId)) next.delete(tId);
            else next.add(tId);
            return next;
        });
    };

    return (
        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider">Constructors</h2>
                <div className="flex items-center gap-3 text-sm font-bold tracking-wide">
                    <button onClick={() => setSelectedTeams(new Set(validTeams))} className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer">Select All</button>
                    <span className="text-slate-700 font-normal">|</span>
                    <button onClick={() => setSelectedTeams(new Set())} className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer">Clear All</button>
                </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[600px]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800/80 text-slate-500 uppercase text-[11px] tracking-widest font-black">
                            <th className="pb-3 text-center w-16">POS</th>
                            <th className="pb-3 w-10"></th>
                            <th className="pb-3 pl-4">CONSTRUCTOR TRACK LANE ASSEMBLY</th>
                            <th className="pb-3 text-right pr-4">POINTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((teamKey, idx) => {
                            const pts = state.teamHistory[teamKey]?.[scopeIndex] || 0;
                            const currentRank = idx + 1;
                            const prevRank = scopeIndex > 0 ? prevSortedTeams.indexOf(teamKey) + 1 : 0;

                            return (
                                <tr key={teamKey} className="border-b border-slate-800/20 hover:bg-slate-800/30 transition-colors h-[76px]">
                                    <td className="py-2 w-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="font-black text-slate-200 text-lg leading-none">{currentRank}</span>
                                            {renderRankChange(currentRank, prevRank, scopeIndex)}
                                        </div>
                                    </td>
                                    <td className="py-2 w-10 text-center">
                                        <input type="checkbox" checked={selectedTeams.has(teamKey)} onChange={() => toggleTeam(teamKey)} className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-blue-600 cursor-pointer" />
                                    </td>
                                    <td className="py-2 pl-4 w-full relative cursor-pointer group"
                                        onClick={() => toggleTeam(teamKey)}
                                        onMouseMove={(e) => setTooltipState({ type: 'team', id: teamKey, x: e.clientX, y: e.clientY })}
                                        onMouseLeave={() => setTooltipState({ type: null, id: null, x: 0, y: 0 })}>
                                        <div className="flex flex-col items-end w-[260px]">
                                            <div className="h-10 w-full flex items-center justify-end z-10 mb-[-3px]">
                                                <img src={CARS[teamKey]} className="max-h-full max-w-full object-contain drop-shadow-lg transform transition-transform duration-300 ease-out group-hover:translate-x-3" />
                                            </div>
                                            <div className="w-full h-[10px] bg-[#4B5563] rounded-l transition-transform duration-300 ease-out group-hover:translate-x-3" style={{ borderRight: `4px solid ${TEAM_COLORS[teamKey]}`, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.4)' }}></div>
                                        </div>
                                    </td>
                                    <td className="py-2 text-right font-black text-white text-lg pr-4 tabular-nums">{pts}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}