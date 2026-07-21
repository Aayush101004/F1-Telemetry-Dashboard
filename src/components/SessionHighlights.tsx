import { useEffect, useState } from 'react';
import { TEAM_COLORS, TEAM_DISPLAY_NAMES, getDriverFuzzyImage, getNormalizedTeamKey } from '../config';
import type { LiveRaceSessionState, ProcessedSeasonState, RaceResult, SessionData } from '../types';

type PitStop = {
    driverId: string;
    duration: string;
};

type SessionEntity = RaceResult | PitStop;

interface BlockCardProps<T extends SessionEntity> {
    title: string;
    drivers: T[];
    metricFn: (d: T) => string;
    loading?: boolean;
    error?: boolean;
    emptyMsg: string;
    state: ProcessedSeasonState;
}

function SessionHighlightsBlockCard<T extends SessionEntity>({ title, drivers, metricFn, loading, error, emptyMsg, state }: BlockCardProps<T>) {
    if (loading) return <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 flex flex-col h-full"><h3 className="text-emerald-400 font-black uppercase text-sm mb-4 border-b border-slate-800/60 pb-2">{title}</h3><div className="text-emerald-500/80 text-xs font-mono font-bold text-center my-auto animate-pulse">Fetching track telemetry...</div></div>;
    if (error) return <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 flex flex-col h-full"><h3 className="text-red-400 font-black uppercase text-sm mb-4 border-b border-red-900/60 pb-2">{title}</h3><div className="text-red-500/80 text-xs font-bold text-center my-auto">Failed to load (API Limit)</div></div>;
    if (drivers.length === 0) return <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 flex flex-col h-full"><h3 className="text-slate-400 font-black uppercase text-sm mb-4 border-b border-slate-800/60 pb-2">{title}</h3><div className="text-slate-500 text-xs text-center my-auto">{emptyMsg}</div></div>;

    return (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 shadow-lg overflow-hidden h-full">
            <h3 className="text-emerald-400 font-black uppercase text-sm mb-4 border-b border-slate-800/60 pb-2">{title}</h3>
            <div className="flex flex-col gap-3.5">
                {drivers.map((d, i) => {
                    const dId = 'Driver' in d ? d.Driver.driverId : d.driverId;
                    const name = 'Driver' in d ? `${d.Driver.givenName} ${d.Driver.familyName}` : state.globalNames[dId];
                    const tId = 'Constructor' in d ? d.Constructor?.constructorId || state.driverTeamMap[dId] : state.driverTeamMap[dId];
                    const teamKey = getNormalizedTeamKey(tId);
                    const color = TEAM_COLORS[teamKey];
                    const img = getDriverFuzzyImage(dId);

                    if (i === 0) {
                        return (
                            <div key={`${dId}-${i}`} className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 shadow-inner mb-1">
                                <img src={img} className="w-16 h-16 rounded-full border-[3px] object-cover object-top" style={{ borderColor: color }} alt={name} />
                                <div className="flex flex-col flex-1 min-w-0">
                                    {title === "Starting Grid" && (
                                        <span className="text-yellow-500 text-[10px] font-black uppercase">
                                            Pole Position
                                        </span>
                                    )}
                                    <span className="font-bold text-white text-base truncate">{name}</span>
                                    <span className="text-[9px] text-slate-400 font-semibold uppercase mt-1 truncate">{TEAM_DISPLAY_NAMES[teamKey]}</span>
                                    <span className="font-mono text-emerald-400 font-bold text-sm mt-0.5">{metricFn(d)}</span>
                                </div>
                                {title !== "Starting Grid" && (
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="font-black text-yellow-500 text-sm italic w-6 text-right">P1</span>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return (
                        <div key={`${dId}-${i}`} className="flex items-center gap-3 px-2 group">
                            <img src={img} className="w-8 h-8 rounded-full border-2 object-cover object-top opacity-80 group-hover:opacity-100" style={{ borderColor: color }} alt={name} />
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-bold text-slate-300 text-sm truncate">{name}</span>
                                <span className="text-[9px] text-slate-500 font-medium uppercase truncate">{TEAM_DISPLAY_NAMES[teamKey]}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-slate-400 text-xs">{metricFn(d)}</span>
                                <span className="font-black text-slate-700 text-sm italic w-6 text-right">P{i + 1}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface Props {
    sessions: SessionData[];
    scopeIndex: number;
    state: ProcessedSeasonState;
    year: number;
    liveState?: LiveRaceSessionState;
}

export default function SessionHighlights({ sessions, scopeIndex, state, year, liveState }: Props) {
    const session = sessions[scopeIndex];
    const [pitStops, setPitStops] = useState<PitStop[] | null>(null);
    const [pitError, setPitError] = useState(false);
    const isLive = liveState?.isRaceOngoing;

    useEffect(() => {
        if (!session || isLive) {
            if (isLive) {
                queueMicrotask(() => { setPitStops([]); });
            }
            return;
        }

        if (session.isSprint) {
            queueMicrotask(() => { setPitStops([]); setPitError(false); });
            return;
        }

        const actualRound = sessions.slice(0, scopeIndex + 1).filter(s => !s.isSprint).length;
        let isMounted = true;

        async function loadPitStops() {
            queueMicrotask(() => { setPitStops(null); setPitError(false); });
            try {
                const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${actualRound}/pitstops.json`);
                const data = await res.json();
                const pits = (data?.MRData?.RaceTable?.Races[0]?.PitStops || []) as PitStop[];
                const sortedPits = pits.filter(p => p.duration && !p.duration.includes(':')).sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration)).slice(0, 5);
                if (!isMounted) return;
                setPitStops(sortedPits);
            } catch {
                if (!isMounted) return;
                setPitError(true);
            }
        }
        queueMicrotask(() => { void loadPitStops(); });
        return () => { isMounted = false; };
    }, [scopeIndex, session, year, sessions, isLive]);

    if (!session || !session.results) return null;

    if (isLive) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center mb-8">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                <h3 className="text-lg font-black uppercase text-white tracking-widest">
                    Session Highlights Pending
                </h3>
                <p className="text-xs font-mono text-slate-400">
                    Fastest laps and pit lane times will be populated upon checkered flag completion.
                </p>
            </div>
        );
    }

    const fastestLaps = [...session.results].filter(r => r.FastestLap?.rank).sort((a, b) => parseInt(a.FastestLap!.rank!) - parseInt(b.FastestLap!.rank!)).slice(0, 5);
    const startingGrid = [...session.results].sort((a, b) => parseInt(a.grid) - parseInt(b.grid)).slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <SessionHighlightsBlockCard<PitStop>
                title="Fastest Pit Lane Times"
                drivers={pitStops || []}
                metricFn={d => `${d.duration}s`}
                loading={pitStops === null}
                error={pitError}
                emptyMsg={session.isSprint ? "Sprint race (No pit stops)" : "Data unavailable"}
                state={state}
            />
            <SessionHighlightsBlockCard<RaceResult>
                title="Fastest Lap Times"
                drivers={fastestLaps}
                metricFn={d => d.FastestLap?.Time?.time || 'N/A'}
                emptyMsg="Data unavailable"
                state={state}
            />
            <SessionHighlightsBlockCard<RaceResult>
                title="Starting Grid"
                drivers={startingGrid}
                metricFn={d => `Grid: ${d.grid}`}
                emptyMsg="Data unavailable"
                state={state}
            />
        </div>
    );
}