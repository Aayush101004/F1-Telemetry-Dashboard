import { useMemo } from 'react';
import type { LiveRaceSessionState, ProcessedSeasonState, SessionData, UpcomingRace } from '../types';

interface Props {
    state: ProcessedSeasonState;
    scopeIndex: number; // Target race being predicted
    sessions: SessionData[];
    upcomingRace?: UpcomingRace | null;
    liveState?: LiveRaceSessionState;
}

type RealSessionData = SessionData & {
    title?: string;
    isSprint?: boolean;
};

type RealUpcomingRace = UpcomingRace & {
    name?: string;
    isSprint?: boolean;
};

export default function RacePredictions({ state, scopeIndex, sessions, upcomingRace, liveState }: Props) {
    const isRaceOngoing = liveState?.isRaceOngoing && (liveState?.currentLap || 0) < (liveState?.totalLaps || 58);

    const isPredictingFuture = scopeIndex >= sessions.length;

    // Grab the target session object
    const targetSession = isPredictingFuture
        ? (upcomingRace as RealUpcomingRace)
        : (sessions[scopeIndex] as RealSessionData);

    // Identify if the target is a sprint
    const isTargetSprint = useMemo(() => {
        if (!targetSession) return false;
        if (!isPredictingFuture) {
            return !!(targetSession as RealSessionData).isSprint;
        }
        const futureName = (targetSession as RealUpcomingRace).name || '';
        return futureName.toLowerCase().includes('sprint') || !!(targetSession as RealUpcomingRace).isSprint;
    }, [targetSession, isPredictingFuture]);

    // GP counting logic for round number
    const targetRaceHeader = useMemo(() => {
        if (!targetSession) return 'Podium Predictions';

        let gpCountBeforeTarget = 0;
        for (let i = 0; i < scopeIndex; i++) {
            const s = sessions[i] as RealSessionData;
            if (s && !s.isSprint) {
                gpCountBeforeTarget += 1;
            }
        }

        const roundNumber = gpCountBeforeTarget + 1;
        const rawName = isPredictingFuture
            ? (targetSession as RealUpcomingRace).name || 'Upcoming Race'
            : (targetSession as RealSessionData).title || 'Upcoming Race';

        return `${rawName} (Round ${roundNumber}) Predictions`;
    }, [targetSession, scopeIndex, sessions, isPredictingFuture]);

    // Momentum calculations
    const predictions = useMemo(() => {
        const drivers = Object.keys(state.globalNames);
        const knownIndex = Math.max(0, Math.min(scopeIndex - 1, sessions.length - 1));

        let availableGPsBeforeThis = 0;
        for (let i = 0; i <= knownIndex; i++) {
            const s = sessions[i] as RealSessionData;
            if (s && !s.isSprint) {
                availableGPsBeforeThis++;
            }
        }

        const driverScores = drivers.map(dId => {
            const seasonPoints = state.globalHistory[dId]?.[knownIndex] || 0;
            let powerScore: number;

            if (availableGPsBeforeThis < 3) {
                powerScore = 2 * seasonPoints;
            } else {
                let recentFormPoints = 0;
                let gpCountFound = 0;
                let currIdx = knownIndex;

                while (gpCountFound < 3 && currIdx >= 0) {
                    const s = sessions[currIdx] as RealSessionData;
                    const isSprint = !!s?.isSprint;

                    recentFormPoints += state.roundScores[currIdx]?.[dId] || 0;

                    if (!isSprint) {
                        gpCountFound++;
                    }
                    currIdx--;
                }

                powerScore = (0.5 * seasonPoints) + (1.5 * recentFormPoints);
            }

            return { dId, powerScore };
        });

        return driverScores.sort((a, b) => b.powerScore - a.powerScore).slice(0, 3).map(d => d.dId);
    }, [state.globalHistory, state.roundScores, state.globalNames, scopeIndex, sessions]);

    // If race is ongoing, show the Live Banner state
    if (isRaceOngoing) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center mb-8">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                <h3 className="text-lg font-black uppercase text-white tracking-widest">
                    Race In Progress
                </h3>
                <p className="text-xs font-mono text-slate-400">
                    Telemetry model & post-race podium predictions will recalculate upon checkered flag completion.
                </p>
            </div>
        );
    }

    if (!targetSession) return null;

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 w-full mb-8">
            <h3 className="text-xl font-bold text-white mb-2">
                {targetRaceHeader}
            </h3>

            {isTargetSprint ? (
                <p className="text-slate-400 mb-6 italic">
                    Note: While Sprint races don't have a traditional Grand Prix podium ceremony, the top 3 finishers are still heavily rewarded. Based on current momentum and recent form, here are the candidates best fit for the top 3:
                </p>
            ) : (
                <p className="text-slate-400 mb-6">
                    Top 3 contenders for the podium based on championship standing and recent momentum:
                </p>
            )}

            <div className="flex gap-4">
                {predictions.map((dId, idx) => (
                    <div
                        key={dId}
                        className="flex-1 bg-slate-800 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-700/50 py-6"
                    >
                        <span className="text-2xl font-black text-slate-500">P{idx + 1}</span>
                        <span className="text-lg font-bold text-white mt-2 text-center">{state.globalNames[dId]}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">{state.driverTeamMap[dId]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}