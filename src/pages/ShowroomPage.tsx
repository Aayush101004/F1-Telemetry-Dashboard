import CircuitMap from '../components/CircuitMap';
import DriversGrid from '../components/DriversGrid';
import F1CarViewer from '../components/F1CarViewer';
import RacePredictions from '../components/RacePredictions';
import type { LiveRaceSessionState, ProcessedSeasonState, SessionData, UpcomingRace } from '../types';

interface Props {
    state: ProcessedSeasonState;
    sessions: SessionData[];
    scopeIndex: number;
    upcomingRace: UpcomingRace | null;
    liveState: LiveRaceSessionState;
}

export default function ShowroomPage({
    state,
    sessions,
    scopeIndex,
    upcomingRace,
    liveState
}: Props) {
    // Extract current session to pass the track name to the Circuit Map
    const currentSession = sessions[scopeIndex] || {};

    return (
        <div className="flex flex-col gap-6 p-6">
            <F1CarViewer />

            <CircuitMap
                circuitName={currentSession.title}
                raceName={currentSession.title}
            />

            <RacePredictions
                state={state}
                scopeIndex={scopeIndex}
                sessions={sessions}
                upcomingRace={upcomingRace}
                liveState={liveState}
            />

            <DriversGrid
                state={state}
                scopeIndex={scopeIndex}
            />
        </div>
    );
}