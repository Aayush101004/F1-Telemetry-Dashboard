import { TEAM_COLORS, TEAM_DISPLAY_NAMES, getDriverFuzzyImage, getNormalizedTeamKey } from '../config';
import type { LiveRaceSessionState, ProcessedSeasonState } from '../types';

interface Props {
    liveState: LiveRaceSessionState;
    state: ProcessedSeasonState;
}

export default function LiveTelemetry({ liveState, state }: Props) {
    if (!liveState.isRaceOngoing) return null;

    const drivers = Object.values(liveState.driverPositions)
        .sort((a, b) => a.position - b.position)
        .slice(0, 10);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Live Positions</h3>
                <span className="ml-auto text-xs font-mono text-slate-400">
                    Lap {liveState.currentLap}/{liveState.totalLaps}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {drivers.map((driver) => {
                    const driverId = driver.driverId;
                    const driverName = state.globalNames[driverId] || driverId;
                    const teamId = state.driverTeamMap[driverId];
                    const teamKey = getNormalizedTeamKey(teamId);
                    const color = TEAM_COLORS[teamKey];
                    const img = getDriverFuzzyImage(driverId);

                    const positionChange = driver.startPosition - driver.position;

                    return (
                        <div
                            key={driverId}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-950/50 hover:bg-slate-950 transition-colors"
                        >
                            {/* Position */}
                            <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" style={{ backgroundColor: color, opacity: 0.3 }}>
                                <span className="text-white font-black">{driver.position}</span>
                            </div>

                            {/* Driver Image & Name */}
                            <div className="flex items-center gap-2 min-w-0">
                                <img src={img} className="w-8 h-8 rounded-full border-2 object-cover object-top" style={{ borderColor: color }} alt={driverName} />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{driverName.split(' ')[1] || driverName}</p>
                                    <p className="text-xs text-slate-400 truncate">{TEAM_DISPLAY_NAMES[teamKey]}</p>
                                </div>
                            </div>

                            {/* Position Delta */}
                            <div className="ml-auto flex items-center gap-2 shrink-0">
                                {positionChange > 0 && (
                                    <span className="text-emerald-400 text-xs font-bold">▲ {positionChange}</span>
                                )}
                                {positionChange < 0 && (
                                    <span className="text-red-400 text-xs font-bold">▼ {Math.abs(positionChange)}</span>
                                )}
                                {positionChange === 0 && (
                                    <span className="text-slate-500 text-xs font-bold">—</span>
                                )}

                                {/* Status Icon */}
                                {driver.status === 'PIT' && (
                                    <span className="px-2 py-1 text-xs font-bold rounded bg-yellow-500/20 text-yellow-400">PIT</span>
                                )}
                                {driver.status === 'DNF' && (
                                    <span className="px-2 py-1 text-xs font-bold rounded bg-red-500/20 text-red-400">DNF</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}