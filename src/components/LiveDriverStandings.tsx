import React from 'react';
import { TEAM_COLORS, TEAM_DISPLAY_NAMES, getNormalizedTeamKey, getDriverFuzzyImage } from '../config';
import type { LiveRaceSessionState, ProcessedSeasonState } from '../types';

interface Props {
    liveState: LiveRaceSessionState;
    state: ProcessedSeasonState;
}

export default function LiveDriverStandings({ liveState, state }: Props) {
    if (!liveState.isRaceOngoing) return null;

    // Get top 3 drivers by position
    const topDrivers = Object.values(liveState.driverPositions)
        .filter(d => d.status === 'RACING')
        .sort((a, b) => a.position - b.position)
        .slice(0, 3);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Race Leaders</h3>
            </div>

            <div className="flex flex-col gap-3">
                {topDrivers.map((driver, idx) => {
                    const driverId = driver.driverId;
                    const driverName = state.globalNames[driverId] || driverId;
                    const teamId = state.driverTeamMap[driverId];
                    const teamKey = getNormalizedTeamKey(teamId);
                    const color = TEAM_COLORS[teamKey];
                    const displayName = TEAM_DISPLAY_NAMES[teamKey];
                    const img = getDriverFuzzyImage(driverId);

                    const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                    const podiumBg = podiumColors[idx];

                    return (
                        <div
                            key={driverId}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                            style={{
                                backgroundColor: `${podiumBg}20`,
                                borderLeft: `3px solid ${podiumBg}`
                            }}
                        >
                            {/* Position with Medal */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full font-black text-lg" style={{ backgroundColor: podiumBg }}>
                                <span className="text-slate-900">{driver.position}</span>
                            </div>

                            {/* Driver Image */}
                            <img src={img} alt={driverName} className="w-10 h-10 rounded-full border-2 object-cover object-top" style={{ borderColor: color }} />

                            {/* Driver & Team Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{driverName}</p>
                                <p className="text-xs text-slate-400 truncate">{displayName}</p>
                            </div>

                            {/* Gap / Status */}
                            <div className="flex flex-col items-end shrink-0">
                                {driver.currentLapTime && (
                                    <p className="text-xs font-mono text-slate-300">{driver.currentLapTime}</p>
                                )}
                                {driver.status === 'PIT' && (
                                    <p className="text-xs font-bold text-yellow-400">Pitting</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
