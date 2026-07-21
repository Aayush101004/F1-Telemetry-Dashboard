import { LOGOS, TEAM_COLORS, TEAM_DISPLAY_NAMES, getDriverFuzzyImage } from '../config';
import type { ProcessedSeasonState, TooltipState } from '../types';

interface Props {
    tooltip: TooltipState;
    state: ProcessedSeasonState;
    scopeIndex: number;
}

export default function GlobalTooltip({ tooltip, state, scopeIndex }: Props) {
    if (!tooltip.type || !tooltip.id) return null;

    let content = null;
    const isVisible = tooltip.x > 0 && tooltip.y > 0;

    let leftPos = tooltip.x + 15;
    if (leftPos + 320 > window.innerWidth) leftPos = tooltip.x - 320;

    if (tooltip.type === 'driver') {
        const teamKey = state.driverTeamMap[tooltip.id];

        // Time-traveling query. Fetches the stats perfectly matching the currently selected race!
        const raceSnapshot = state.historicalStats[scopeIndex] || {};
        const stats = raceSnapshot[tooltip.id] || { poles: 0, podiums: 0, titles: 0 };

        content = (
            <div className="flex flex-col bg-slate-900 p-4 rounded-2xl border border-slate-700/50 shadow-2xl min-w-[280px]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ border: `2px solid ${TEAM_COLORS[teamKey]}` }}>
                        <img src={getDriverFuzzyImage(tooltip.id)} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="font-black uppercase text-[15px] tracking-wide text-white leading-tight drop-shadow-sm">{state.globalNames[tooltip.id]}</h4>
                        <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mt-0.5">{TEAM_DISPLAY_NAMES[teamKey]}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80">
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">WDC Titles</span>
                        <span className="text-base font-black text-yellow-500">{stats.titles}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-r border-slate-800/80 px-3">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Career Podiums</span>
                        <span className="text-base font-black text-emerald-400">{stats.podiums}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Career Poles</span>
                        <span className="text-base font-black text-blue-400">{stats.poles}</span>
                    </div>
                </div>
            </div>
        );
    }

    else if (tooltip.type === 'team') {
        const teamKey = tooltip.id;

        // NEW: Fetch the time-traveling team stats snapshot!
        const teamStats = state.teamStats?.[teamKey] || { poles: 0, podiums: 0, titles: 0 };

        const roster = Object.keys(state.driverTeamMap)
            .filter(dId => state.driverTeamMap[dId] === teamKey)
            .map(dId => (
                <div key={dId} className="flex justify-between text-[13px] text-slate-400 items-center">
                    <span>• {state.globalNames[dId]}</span>
                    <span className="text-slate-300 font-medium">{state.globalHistory[dId][scopeIndex] || 0} pts</span>
                </div>
            ));

        content = (
            <div className="flex flex-col bg-slate-900 p-4 rounded-2xl border border-slate-700/50 shadow-2xl min-w-[300px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 bg-transparent flex items-center justify-center shrink-0">
                        <img src={LOGOS[teamKey]} className="max-w-full max-h-full object-contain" />
                    </div>
                    <h4 className="font-black uppercase text-[14px] tracking-wider text-white drop-shadow-sm">{TEAM_DISPLAY_NAMES[teamKey]}</h4>
                </div>

                {/* NEW: Constructor Stats Row exactly matching the driver style */}
                <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-4">
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">WCC Titles</span>
                        <span className="text-base font-black text-yellow-500">{teamStats.titles}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-r border-slate-800/80 px-3">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Team Podiums</span>
                        <span className="text-base font-black text-emerald-400">{teamStats.podiums}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Team Poles</span>
                        <span className="text-base font-black text-blue-400">{teamStats.poles}</span>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center text-sm font-bold mb-3 pb-3 border-b border-slate-800">
                        <span className="text-slate-200">Team Score Total</span>
                        <span className="font-mono text-emerald-400 text-lg">{state.teamHistory[teamKey]?.[scopeIndex] || 0} <span className="text-[10px] text-emerald-600 font-sans">pts</span></span>
                    </div>
                    <div className="space-y-2.5">{roster}</div>
                </div>
            </div>
        );
    }

    else if (tooltip.type === 'prediction' && tooltip.data) {
        const reason = tooltip.message || "Prediction data unavailable.";

        content = (
            <div className="flex flex-col bg-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-2xl max-w-[320px]">
                <div className="border-b border-slate-700/50 pb-2 mb-2">
                    <h4 className="font-black uppercase text-[13px] tracking-wider text-white drop-shadow-sm">{state.globalNames[tooltip.id]}</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{reason}</p>
            </div>
        );
    }

    else if (tooltip.type === 'driver-stats') {
        const dId = tooltip.id || "";
        const stats = state.driverStats[dId] || { poles: 0, podiums: 0, titles: 0, debut: 2023 };

        content = (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-2xl min-w-[200px]">
                <h4 className="font-black uppercase text-white mb-2">{state.globalNames[dId]}</h4>
                <div className="text-xs text-slate-400 space-y-1">
                    <p>Poles: <span className="text-emerald-400 font-bold">{stats.poles}</span></p>
                    <p>Podiums: <span className="text-emerald-400 font-bold">{stats.podiums}</span></p>
                    <p>Titles: <span className="text-yellow-500 font-bold">{stats.titles}</span></p>
                    <p>Debut: <span className="text-slate-400">{stats.debut}</span></p>
                </div>
            </div>
        );
    }

    if (!content) return null;

    return (
        <div
            className="fixed z-[9999] pointer-events-none transition-opacity duration-150 ease-out"
            style={{
                left: `${leftPos}px`,
                top: `${tooltip.y - 15}px`,
                opacity: isVisible ? 1 : 0
            }}
        >
            {content}
        </div>
    );
}