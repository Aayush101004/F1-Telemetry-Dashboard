import { TEAM_COLORS, TEAM_DISPLAY_NAMES, getDriverFuzzyImage, getNormalizedTeamKey } from '../config';
import type { ProcessedSeasonState } from '../types';

export default function DriversGrid({ state, scopeIndex }: { state: ProcessedSeasonState, scopeIndex: number }) {
    const sortedDrivers = Object.keys(state.globalNames).sort((a, b) => (state.globalHistory[b][scopeIndex] || 0) - (state.globalHistory[a][scopeIndex] || 0));

    if (sortedDrivers.length === 0) return null;

    return (
        <div>
            <div className="flex items-center gap-3 border-t border-slate-800/80 pt-8 mb-5">
                <div className="h-6 w-1.5 bg-slate-500 rounded-full"></div>
                <h2 className="text-lg font-black text-slate-300 uppercase tracking-wider">Active Drivers Grid</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-4">
                {sortedDrivers.map(dId => {
                    const teamKey = getNormalizedTeamKey(state.driverTeamMap[dId]);
                    return (
                        <div key={dId} className="flex flex-col items-center bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 shadow-lg hover:bg-slate-800/40 transition-colors">
                            <img src={getDriverFuzzyImage(dId)} className="w-14 h-14 rounded-full border-[3px] object-cover object-top mb-2" style={{ borderColor: TEAM_COLORS[teamKey] }} />
                            <span className="text-[10px] font-bold text-slate-300 uppercase text-center leading-tight mb-1">{state.globalNames[dId]}</span>
                            <span className="text-[8px] font-semibold text-slate-500 uppercase text-center truncate w-full">{TEAM_DISPLAY_NAMES[teamKey]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}