import React from 'react';
import { CARS, TEAM_COLORS, TEAM_DISPLAY_NAMES, getNormalizedTeamKey } from '../config';
import type { LiveRaceSessionState, ProcessedSeasonState } from '../types';

interface Props {
    liveState: LiveRaceSessionState;
    state: ProcessedSeasonState;
}

export default function LiveTeamStandings({ liveState, state }: Props) {
    if (!liveState.isRaceOngoing) return null;

    // Calculate live team standings based on current positions
    const teamPositions: Record<string, number[]> = {};

    Object.values(liveState.driverPositions).forEach(driver => {
        const teamId = state.driverTeamMap[driver.driverId];
        const teamKey = getNormalizedTeamKey(teamId);

        if (!teamPositions[teamKey]) {
            teamPositions[teamKey] = [];
        }
        teamPositions[teamKey].push(driver.position);
    });

    // Calculate combined score for each team (sum of driver positions, lower is better)
    const teamScores = Object.entries(teamPositions)
        .map(([teamKey, positions]) => ({
            teamKey,
            combinedScore: positions.sort((a, b) => a - b).slice(0, 2).reduce((a, b) => a + b, 0),
            drivers: positions.length
        }))
        .sort((a, b) => a.combinedScore - b.combinedScore)
        .slice(0, 3);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Live Team Standings</h3>
            </div>

            <div className="flex flex-col gap-3">
                {teamScores.map((team, idx) => {
                    const color = TEAM_COLORS[team.teamKey];
                    const car = CARS[team.teamKey];
                    const displayName = TEAM_DISPLAY_NAMES[team.teamKey];

                    return (
                        <div
                            key={team.teamKey}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-950/50 hover:bg-slate-950 transition-colors"
                        >
                            {/* Ranking */}
                            <div className="flex items-center justify-center w-8 h-8 font-bold text-sm rounded-full" style={{ backgroundColor: color, opacity: 0.3 }}>
                                <span className="text-white font-black">{idx + 1}</span>
                            </div>

                            {/* Team Car Image */}
                            <div className="flex items-center justify-center w-16 h-8">
                                <img src={car} alt={displayName} className="h-full object-contain" />
                            </div>

                            {/* Team Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                                <p className="text-xs text-slate-400">Combined Score: {team.combinedScore}</p>
                            </div>

                            {/* Driver Count Badge */}
                            <div className="flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: color, opacity: 0.2, color: color }}>
                                {team.drivers} Drivers
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
