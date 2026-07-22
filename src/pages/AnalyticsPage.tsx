import DetailedBreakdown from '../components/DetailedBreakdown';
import HeadToHeadComparison from '../components/HeadToHeadComparison';
import ProgressionCharts from '../components/ProgressionCharts';
import type { LiveRaceSessionState, ProcessedSeasonState, SessionData } from '../types';

interface Props {
    state: ProcessedSeasonState;
    sessions: SessionData[];
    scopeIndex: number;
    selectedDrivers: Set<string>;
    liveState: LiveRaceSessionState;
}

export default function AnalyticsPage({
    state,
    sessions,
    scopeIndex,
    selectedDrivers,
    liveState
}: Props) {
    return (
        <div className="flex flex-col gap-6 p-6">
            <HeadToHeadComparison state={state} />
            <ProgressionCharts
                state={state}
                sessions={sessions}
                scopeIndex={scopeIndex}
                selectedDrivers={selectedDrivers}
                type="drivers"
            />
            <DetailedBreakdown
                state={state}
                session={sessions[scopeIndex]}
                scopeIndex={scopeIndex}
                liveState={liveState}
            />
        </div>
    );
}