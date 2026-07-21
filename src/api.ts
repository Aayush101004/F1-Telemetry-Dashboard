import type { RaceResult, SessionData, UpcomingRace } from './types';

interface ErgastRaceResponse {
    round: string;
    raceName: string;
    date: string;
    time?: string;
    Results?: RaceResult[];
    SprintResults?: RaceResult[];
}

async function fetchPaginated(url: string): Promise<ErgastRaceResponse[]> {
    const allRaces: ErgastRaceResponse[] = [];
    let offset = 0;
    const limit = 100;
    let total = 1;
    let retries = 0;

    while (offset < total && retries < 3) {
        try {
            const separator = url.includes('?') ? '&' : '?';
            const res = await fetch(`${url}${separator}limit=${limit}&offset=${offset}`);

            if (res.status === 429) {
                await new Promise(r => setTimeout(r, 1000));
                retries++;
                continue;
            }
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

            const data = await res.json();
            total = parseInt(data.MRData.total, 10) || 0;

            const races = (data.MRData.RaceTable.Races || []) as ErgastRaceResponse[];
            for (const r of races) {
                const existing = allRaces.find(ex => ex.round === r.round);
                if (existing) {
                    // Strictly prevent duplicates if the API overlaps pagination pages
                    if (r.Results) {
                        const newRes = r.Results.filter(nr => !existing.Results?.find(er => er.Driver.driverId === nr.Driver.driverId));
                        existing.Results = [...(existing.Results || []), ...newRes];
                    }
                    if (r.SprintResults) {
                        const newSprint = r.SprintResults.filter(nr => !existing.SprintResults?.find(er => er.Driver.driverId === nr.Driver.driverId));
                        existing.SprintResults = [...(existing.SprintResults || []), ...newSprint];
                    }
                } else {
                    allRaces.push(r);
                }
            }

            offset += limit;
            retries = 0;
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error("Pagination error handling telemetry frames:", e);
            retries++;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return allRaces;
}

export async function fetchF1SeasonData(year: number): Promise<{ sessions: SessionData[], upcomingRace: UpcomingRace | null }> {
    const rawSessions: SessionData[] = [];
    let nextUpcomingRace: UpcomingRace | null = null;
    const rightNow = new Date();

    try {
        const schedRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json?limit=100`);
        const schedData = await schedRes.json();
        await new Promise(resolve => setTimeout(resolve, 300));
        const scheduleRaces = schedData?.MRData?.RaceTable?.Races || [];

        const resultRaces = await fetchPaginated(`https://api.jolpi.ca/ergast/f1/${year}/results.json`);
        const sprintRaces = await fetchPaginated(`https://api.jolpi.ca/ergast/f1/${year}/sprint.json`);

        for (const race of scheduleRaces) {
            const round = race.round;
            const shortName = race.raceName.replace("Grand Prix", "GP");
            const raceDateTime = new Date(`${race.date}T${race.time || '12:00:00Z'}`);

            if (!nextUpcomingRace && raceDateTime > rightNow) {
                nextUpcomingRace = { name: shortName, time: raceDateTime };
            }

            const sprintRace = sprintRaces.find(r => r.round === round);
            if (sprintRace && sprintRace.SprintResults && sprintRace.SprintResults.length > 0) {
                rawSessions.push({ title: `${shortName} Sprint`, results: sprintRace.SprintResults, isSprint: true });
            }

            const resultRace = resultRaces.find(r => r.round === round);
            if (resultRace && resultRace.Results && resultRace.Results.length > 0) {
                rawSessions.push({ title: shortName, results: resultRace.Results, isSprint: false });
            }
        }

        return { sessions: rawSessions, upcomingRace: nextUpcomingRace };
    } catch (error) {
        console.error(`Failed to fetch F1 Data for ${year}:`, error);
        return { sessions: [], upcomingRace: null };
    }
}