import { DRIVER_IMAGES, LOGOS, TEAM_DISPLAY_NAMES } from './config';
import type { LiveDriverPosition, ProcessedSeasonState, RaceResult } from './types';

export const F1_POINTS_MAP: Record<number, number> = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8,  7: 6,  8: 4,  9: 2,  10: 1
};

export const calculateProvisionalLivePoints = (
    basePointsMap: Record<string, number>,
    livePositions: Record<string, LiveDriverPosition>
): Record<string, number> => {
    const provisionalPoints: Record<string, number> = { ...basePointsMap };

    Object.values(livePositions).forEach(({ driverId, position }) => {
        const pointsAwarded = F1_POINTS_MAP[position] || 0;
        provisionalPoints[driverId] = (provisionalPoints[driverId] || 0) + pointsAwarded;
    });

    return provisionalPoints;
};

export interface ChartTooltipDataPoint {
    dataset: {
        data: (number | string)[];
        label: string;
        driverId?: string;
        teamKey?: string;
    };
    dataIndex: number;
    formattedValue: string;
}

export interface ChartTooltipContext {
    chart: { canvas: HTMLCanvasElement; };
    tooltip: {
        opacity: number;
        body?: unknown[];
        title?: string[];
        dataPoints: ChartTooltipDataPoint[];
        caretX: number;
        caretY: number;
    };
}

export function getNormalizedTeamKey(rawConstructorId?: string, driverId?: string): string {
    const cid = (rawConstructorId || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Primary Check: API Constructor ID
    if (cid.includes('mercedes')) return 'mercedes';
    if (cid.includes('ferrari')) return 'ferrari';
    if (cid.includes('mclaren')) return 'mclaren';
    if (cid.includes('alpine')) return 'alpine';
    if (cid.includes('redbull') || (cid.includes('red') && cid.includes('bull'))) return 'redbull';
    if (cid.includes('aston') || cid.includes('amr')) return 'aston_martin';
    if (cid.includes('williams')) return 'williams';
    if (cid.includes('haas')) return 'haas';
    if (cid.includes('rb') || cid.includes('racingbulls') || cid.includes('alphatauri') || cid.includes('vcarb')) return 'racing_bulls';
    if (cid.includes('audi') || cid.includes('sauber') || cid.includes('kick')) return 'audi';
    if (cid.includes('cadillac') || cid.includes('andretti')) return 'cadillac';

    // 2. Safety Fallback: Map by Driver ID if constructor data is missing/unknown
    const dIdStr = (driverId || '').toLowerCase();
    if (dIdStr.includes('verstappen') || dIdStr.includes('hadjar')) return 'redbull';
    if (dIdStr.includes('lawson') || dIdStr.includes('lindblad') || dIdStr.includes('arvid')) return 'racing_bulls';
    if (dIdStr.includes('antonelli') || dIdStr.includes('russell')) return 'mercedes';
    if (dIdStr.includes('leclerc') || dIdStr.includes('hamilton')) return 'ferrari';
    if (dIdStr.includes('norris') || dIdStr.includes('piastri')) return 'mclaren';
    if (dIdStr.includes('alons') || dIdStr.includes('stroll')) return 'aston_martin';
    if (dIdStr.includes('gasly') || dIdStr.includes('doohan')) return 'alpine';
    if (dIdStr.includes('albon') || dIdStr.includes('sainz')) return 'williams';
    if (dIdStr.includes('hulkenberg') || dIdStr.includes('bortoleto')) return 'audi';
    if (dIdStr.includes('tsunoda') || dIdStr.includes('bearman') || dIdStr.includes('ocon')) return 'haas';

    return 'audi'; // Ultimate default fallback
}

export function getDriverFuzzyImage(dId: string): string {
    const fuzzyKey = Object.keys(DRIVER_IMAGES).find(k => k !== 'default' && (k.toLowerCase().includes(dId.toLowerCase()) || dId.toLowerCase().includes(k.toLowerCase())));
    return fuzzyKey ? DRIVER_IMAGES[fuzzyKey] : DRIVER_IMAGES.default;
}

export function generateDriverHighlight(r: RaceResult, timingStr: string): string {
    const pos = parseInt(r.position, 10);
    const net = parseInt(r.grid, 10) - pos;
    const lap = r.FastestLap?.Time?.time;
    const statusStr = r.status || "";

    if (timingStr === "DNS") return `<span class="text-amber-500 font-semibold not-italic">DNS</span> — Failed to start the session.`;
    if (timingStr === "DNF") {
        if (statusStr.toLowerCase().includes("disqualified")) return `<span class="text-red-600 font-black not-italic">DSQ</span> — Disqualified by race officials.`;
        return `<span class="text-red-400 font-semibold not-italic">DNF</span> — Retired after ${r.laps} laps.`;
    }

    let base = pos === 1 ? `<span class="text-yellow-500 font-bold not-italic">🏆 Winner</span> — Dominant race execution.`
        : (pos <= 3 ? `<span class="text-blue-400 font-bold not-italic">Podium</span> — Consistent drive to secure the trophy step.`
            : (parseFloat(r.points) > 0 ? `<span class="text-emerald-500 font-medium not-italic">Points Finish</span> — Crossed inside scoring bounds.`
                : `Completed session outside the points.`));

    if (timingStr.includes("Lap")) base += ` Finished ${timingStr.replace('+', '').trim().toLowerCase()} behind the leader.`;
    else if (timingStr.startsWith("+")) base += ` Finished ${timingStr} behind the leader.`;

    if (net > 0) base += ` Gained a massive +${net} grid spots on track.`;
    if (net < 0) base += ` Dropped ${Math.abs(net)} places from starting slot.`;
    if (lap) base += ` Best pace lap clocked at ${lap}.`;

    return base;
}

export function getOrCreateChartTooltip(): HTMLElement {
    let tooltip = document.getElementById('chartjs-custom-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chartjs-custom-tooltip';
        tooltip.className = 'absolute z-[9999] opacity-0 pointer-events-none transition-opacity duration-150 ease-out';
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

export function externalTooltipHandler(context: unknown, state: ProcessedSeasonState): void {
    const ctx = context as ChartTooltipContext;
    const tooltipEl = getOrCreateChartTooltip();
    const tooltipModel = ctx.tooltip;

    if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
    }

    if (tooltipModel.body) {
        const titleLines = tooltipModel.title || [];
        let innerHtml = `
            <div class="bg-slate-950/98 border border-slate-800 p-3.5 rounded-xl shadow-2xl text-white text-xs backdrop-blur-md min-w-[220px]">
                <div class="font-black uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800/80 pb-2 flex justify-between items-end">
                    <span>${titleLines[0] || ''}</span>
                    <span class="text-[9px] font-bold text-slate-500 pl-4">SESSION GAIN</span>
                </div>
                <div class="flex flex-col gap-1.5">
        `;

        tooltipModel.dataPoints.forEach((dataPoint) => {
            const dataset = dataPoint.dataset;
            const dataIndex = dataPoint.dataIndex;
            const currentPts = parseFloat(dataset.data[dataIndex] as string) || 0;
            const prevPts = dataIndex > 0 ? (parseFloat(dataset.data[dataIndex - 1] as string) || 0) : 0;
            const pointsGained = parseFloat((currentPts - prevPts).toFixed(1));

            let gainMarkup = `<span class="text-slate-600 font-medium">+0</span>`;
            if (pointsGained > 0) gainMarkup = `<span class="text-emerald-500 font-black">+${pointsGained}</span>`;
            if (pointsGained < 0) gainMarkup = `<span class="text-red-500 font-black">${pointsGained}</span>`;

            if (dataset.driverId) {
                const teamKey = getNormalizedTeamKey(state.driverTeamMap[dataset.driverId], dataset.driverId);
                const teamName = TEAM_DISPLAY_NAMES[teamKey] || 'Unknown Team';
                const driverImgUrl = getDriverFuzzyImage(dataset.driverId);

                innerHtml += `
                    <div class="flex items-center gap-3 py-1">
                        <div class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            <img src="${driverImgUrl}" class="w-full h-full object-cover object-top">
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-slate-100 text-[13px] leading-tight">${dataset.label}</span>
                            <span class="font-bold text-slate-500 text-[9px] uppercase tracking-wider">${teamName}</span>
                        </div>
                        <div class="flex flex-col items-end ml-auto pl-4">
                            <span class="font-mono text-slate-100 font-bold leading-tight">${dataPoint.formattedValue} <span class="text-[9px] text-slate-400 font-normal">pts</span></span>
                            <span class="font-mono text-[11px] mt-0.5 tracking-wide">${gainMarkup}</span>
                        </div>
                    </div>`;
            } else if (dataset.teamKey) {
                const logoUrl = LOGOS[dataset.teamKey] || '';
                innerHtml += `
                    <div class="flex items-center gap-3 py-1">
                        <div class="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover">` : ''}
                        </div>
                        <span class="font-bold text-slate-100 text-[13px]">${dataset.label}</span>
                        <div class="flex flex-col items-end ml-auto pl-4">
                            <span class="font-mono text-slate-100 font-bold leading-tight">${dataPoint.formattedValue} <span class="text-[9px] text-slate-400 font-normal">pts</span></span>
                            <span class="font-mono text-[11px] mt-0.5 tracking-wide">${gainMarkup}</span>
                        </div>
                    </div>`;
            }
        });
        tooltipEl.innerHTML = innerHtml + `</div></div>`;
    }

    const position = ctx.chart.canvas.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth;
    let calculatedLeft = tooltipModel.caretX + 16;
    if (calculatedLeft + tooltipWidth > position.width) calculatedLeft = tooltipModel.caretX - tooltipWidth - 16;

    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = position.left + window.scrollX + calculatedLeft + 'px';
    tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY - 30 + 'px';
}