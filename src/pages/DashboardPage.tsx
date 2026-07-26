import React from 'react';
import CircuitMap from '../components/CircuitMap';
import ConstructorStandings from '../components/ConstructorStandings';
import LiveDriverStandings from '../components/LiveDriverStandings';
import LiveTeamStandings from '../components/LiveTeamStandings';
import LiveTelemetry from '../components/LiveTelemetry';
import SessionHighlights from '../components/SessionHighlights';
import StandingsTables from '../components/StandingsTables';
import type { LiveRaceSessionState, ProcessedSeasonState, SessionData, TooltipState } from '../types';

interface Props {
    state: ProcessedSeasonState;
    scopeIndex: number;
    selectedDrivers: Set<string>;
    setSelectedDrivers: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedTeams: Set<string>;
    setSelectedTeams: React.Dispatch<React.SetStateAction<Set<string>>>;
    setTooltipState: React.Dispatch<React.SetStateAction<TooltipState>>;
    year: number;
    sessions: SessionData[];
    liveState: LiveRaceSessionState;
}

export default function DashboardPage({
    state,
    scopeIndex,
    selectedDrivers,
    setSelectedDrivers,
    selectedTeams,
    setSelectedTeams,
    setTooltipState,
    year,
    sessions,
    liveState
}: Props) {
    // Safely extract the current session for the Circuit Map
    const currentSession = sessions[scopeIndex] || {};

    if (liveState.isRaceOngoing) {
        // Live race layout with real-time telemetry
        return (
            <div className="flex flex-col gap-6 p-6 w-full">
                {/* Top: Live Telemetry (Main) */}
                <LiveTelemetry liveState={liveState} state={state} />

                {/* Middle: Three small tables - Live standings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LiveDriverStandings liveState={liveState} state={state} />
                    <LiveTeamStandings liveState={liveState} state={state} />
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Race Status</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center px-3 py-2">
                                <span className="text-xs text-slate-400">Current Lap</span>
                                <span className="text-lg font-black text-white">{liveState.currentLap}/{liveState.totalLaps}</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2">
                                <span className="text-xs text-slate-400">Flag Status</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${liveState.flagStatus === 'GREEN' ? 'bg-green-500/20 text-green-400' : liveState.flagStatus === 'YELLOW' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {liveState.flagStatus}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
                                    style={{ width: `${(liveState.currentLap / liveState.totalLaps) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Circuit and Session Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CircuitMap
                        circuitName={currentSession.title}
                        raceName={currentSession.title}
                    />
                    <SessionHighlights
                        state={state}
                        sessions={sessions}
                        scopeIndex={scopeIndex}
                        year={year}
                        liveState={liveState}
                    />
                </div>
            </div>
        );
    }

    // Normal layout (when race is not ongoing)
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <StandingsTables
                state={state}
                scopeIndex={scopeIndex}
                selectedDrivers={selectedDrivers}
                setSelectedDrivers={setSelectedDrivers}
                setTooltipState={setTooltipState}
            />
            <ConstructorStandings
                state={state}
                scopeIndex={scopeIndex}
                selectedTeams={selectedTeams}
                setSelectedTeams={setSelectedTeams}
                year={year}
                setTooltipState={setTooltipState}
            />
            <CircuitMap
                circuitName={currentSession.title}
                raceName={currentSession.title}
            />
            <SessionHighlights
                state={state}
                sessions={sessions}
                scopeIndex={scopeIndex}
                year={year}
                liveState={liveState}
            />
        </div>
    );
}