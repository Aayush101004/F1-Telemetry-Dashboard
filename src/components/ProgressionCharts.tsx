import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import { getNormalizedTeamKey, TEAM_COLORS, TEAM_DISPLAY_NAMES } from '../config';
import type { ProcessedSeasonState, SessionData } from '../types';
import { externalTooltipHandler } from '../utils';

interface Props {
    state: ProcessedSeasonState;
    sessions: SessionData[];
    scopeIndex: number;
    selectedDrivers?: Set<string>;
    selectedTeams?: Set<string>;
    type: 'drivers' | 'constructors';
}

interface ProgressionDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    borderWidth: number;
    pointRadius: number;
    pointHoverRadius: number;
    driverId?: string;
    teamKey?: string;
}

export default function ProgressionCharts({ state, sessions, scopeIndex, selectedDrivers, selectedTeams, type }: Props) {
    const labels = sessions.slice(0, scopeIndex + 1).map(s => s.title);
    let datasets: ProgressionDataset[] = [];

    if (type === 'drivers' && selectedDrivers) {
        datasets = Array.from(selectedDrivers).map(dId => {
            const teamKey = getNormalizedTeamKey(state.driverTeamMap[dId]);
            const color = TEAM_COLORS[teamKey] || '#94a3b8';
            return {
                label: state.globalNames[dId],
                data: state.globalHistory[dId].slice(0, scopeIndex + 1),
                borderColor: color, backgroundColor: color,
                tension: 0.25, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 7, driverId: dId
            };
        });
    } else if (type === 'constructors' && selectedTeams) {
        datasets = Array.from(selectedTeams).map(teamKey => {
            const color = TEAM_COLORS[teamKey] || '#94a3b8';
            return {
                label: TEAM_DISPLAY_NAMES[teamKey],
                data: state.teamHistory[teamKey].slice(0, scopeIndex + 1),
                borderColor: color, backgroundColor: color,
                tension: 0.25, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 7, teamKey: teamKey
            };
        });
    }

    return (
        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 shadow-lg h-full min-h-[500px] flex flex-col">
            <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Points Progression</h2>
            <div className="flex-1 w-full relative">
                {datasets.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium">Select items from the table to compare telemetry.</div>
                ) : (
                    <Line
                        data={{ labels, datasets }}
                        options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false, external: (ctx) => externalTooltipHandler(ctx, state) }
                            },
                            scales: {
                                x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
                                y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}