import React from 'react';
import CircuitMap from '../components/CircuitMap';
import ConstructorStandings from '../components/ConstructorStandings';
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