import { getNormalizedTeamKey, LOGOS, TEAM_COLORS } from '../config';
import type { LiveRaceSessionState, ProcessedSeasonState, SessionData } from '../types';
import { generateDriverHighlight } from '../utils';

interface Props {
    session: SessionData;
    state: ProcessedSeasonState;
    scopeIndex: number;
    liveState?: LiveRaceSessionState;
}

export default function DetailedBreakdown({ session, state, scopeIndex, liveState }: Props) {
    if (!session || !session.results) return null;

    const isLive = liveState?.isRaceOngoing;
    const leaderLaps = parseInt(session.results[0]?.laps || "0", 10) || 0;

    return (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 shadow-lg mb-8 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800/80 pb-3">
                <h2 className="text-xl font-black text-slate-200 uppercase tracking-wider">{session.title}</h2>
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${isLive ? 'bg-red-950 text-red-500 border-red-900/50 animate-pulse' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                    {isLive ? 'Live Telemetry' : 'Telemetry Log'}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-800/80 text-slate-500 uppercase text-xs tracking-wider">
                            <th className="pb-3 px-4 text-center">Pos</th>
                            <th className="pb-3 px-4 text-center">Team</th>
                            <th className="pb-3 px-4">Driver</th>
                            <th className="pb-3 px-4 text-center">Pts</th>
                            <th className="pb-3 px-4 text-center">Time / Status</th>
                            <th className="pb-3 px-4">Session Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLive && liveState.driverPositions
                            ? Object.values(liveState.driverPositions)
                                .sort((a, b) => a.position - b.position)
                                .map((liveDriver) => {
                                    const dId = liveDriver.driverId;
                                    const name = state.globalNames[dId] || dId;
                                    const teamKey = getNormalizedTeamKey(state.driverTeamMap[dId]);
                                    const color = TEAM_COLORS[teamKey];
                                    const logo = LOGOS[teamKey];
                                    const pts = state.roundScores[scopeIndex]?.[dId] || 0;

                                    return (
                                        <tr key={dId} className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-colors duration-150">
                                            <td className="py-4 px-4 text-center font-bold text-slate-400 tabular-nums">{liveDriver.position}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center">
                                                    {logo && <img src={logo} className="w-6 h-6 object-contain opacity-80" alt={teamKey} />}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-semibold text-slate-200">
                                                <span className="border-l-2 pl-3 py-1" style={{ borderColor: color }}>{name}</span>
                                            </td>
                                            <td className={`py-4 px-4 text-center font-black tabular-nums ${pts > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{pts > 0 ? `+${pts}` : '0'}</td>
                                            <td className="py-4 px-4 text-center font-mono text-xs text-emerald-400 tabular-nums">{liveDriver.currentLapTime || 'RACING'}</td>
                                            <td className="py-4 px-4 italic text-slate-400 text-xs text-wrap min-w-[300px]">Live Data Stream Active</td>
                                        </tr>
                                    );
                                })
                            : session.results.map((r, i) => {
                                const dId = r.Driver.driverId;
                                const name = state.globalNames[dId];
                                const teamKey = getNormalizedTeamKey(r.Constructor?.constructorId || state.driverTeamMap[dId]);
                                const color = TEAM_COLORS[teamKey];
                                const logo = LOGOS[teamKey];
                                const pts = state.roundScores[scopeIndex]?.[dId] || 0;

                                let timingDisplayStr: string;
                                const statusLower = (r.status || "Finished").toLowerCase();
                                const driverLaps = parseInt(r.laps, 10) || 0;
                                const lapsBehind = leaderLaps - driverLaps;

                                if (statusLower.includes("dns") || statusLower.includes("not start") || statusLower.includes("withdrew")) timingDisplayStr = "DNS";
                                else if (statusLower !== "finished" && !statusLower.includes("lap") && !(r.status || "").match(/^\+\d/)) timingDisplayStr = "DNF";
                                else if (lapsBehind > 0) timingDisplayStr = `+${lapsBehind} ${lapsBehind === 1 ? 'Lap' : 'Laps'}`;
                                else if (statusLower.includes("lap") || (r.status || "").match(/^\+\d/)) timingDisplayStr = (r.status || "").startsWith("+") ? (r.status || "") : `+${r.status}`;
                                else if (r.Time?.time) timingDisplayStr = (i === 0) ? r.Time.time : (r.Time.time.startsWith("+") ? r.Time.time : `+${r.Time.time}`);
                                else timingDisplayStr = "DNF";

                                return (
                                    <tr key={dId} className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-colors duration-150">
                                        <td className="py-4 px-4 text-center font-bold text-slate-400 tabular-nums">{r.position}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-center">
                                                {logo && <img src={logo} className="w-6 h-6 object-contain opacity-80" alt={teamKey} />}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-slate-200">
                                            <span className="border-l-2 pl-3 py-1" style={{ borderColor: color }}>{name}</span>
                                        </td>
                                        <td className={`py-4 px-4 text-center font-black tabular-nums ${pts > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{pts > 0 ? `+${pts}` : '0'}</td>
                                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-300 tabular-nums">{timingDisplayStr}</td>
                                        <td className="py-4 px-4 italic text-slate-400 text-xs text-wrap min-w-[300px]" dangerouslySetInnerHTML={{ __html: generateDriverHighlight(r, timingDisplayStr) }} />
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}