import type { LiveRaceSessionState, LiveDriverPosition } from './types';

const F1API_BASE = 'https://api.jolpi.ca/ergast/f1';

interface LiveRaceData {
  isRaceOngoing: boolean;
  currentLap: number;
  totalLaps: number;
  flagStatus: 'GREEN' | 'YELLOW' | 'RED' | 'SC' | 'VSC' | 'DOUBLE_YELLOW';
  driverPositions: Record<string, LiveDriverPosition>;
}

/**
 * Fetches the current status of ongoing races from the F1 API.
 * The API doesn't have real-time data, so we'll check if the next race has started
 * and approximate live positions from race results.
 */
export async function checkLiveRaceStatus(year: number, nextRaceTime: Date | null, nextRaceRound: number | null): Promise<LiveRaceData> {
  const now = new Date();

  // Default response (no race ongoing)
  const defaultResponse: LiveRaceData = {
    isRaceOngoing: false,
    currentLap: 0,
    totalLaps: 58,
    flagStatus: 'GREEN',
    driverPositions: {}
  };

  // If no next race, return default
  if (!nextRaceTime || nextRaceRound === null) {
    return defaultResponse;
  }

  // Check if race has started (within last 4 hours) and hasn't finished yet (within next 4 hours)
  const raceStart = new Date(nextRaceTime).getTime();
  const timeSinceRaceStart = now.getTime() - raceStart;
  const estimatedRaceDuration = 4 * 60 * 60 * 1000; // ~4 hours for typical F1 race

  // Race is considered ongoing if it started within the last 4 hours and hasn't been over for 30 mins
  const isRaceWindow = timeSinceRaceStart > -15 * 60 * 1000 && timeSinceRaceStart < estimatedRaceDuration + 30 * 60 * 1000;

  if (!isRaceWindow) {
    return defaultResponse;
  }

  // Try to fetch live data from F1 live API or simulation
  try {
    // Since the Ergast API doesn't provide real-time data,
    // we'll simulate live race data for demonstration purposes
    // In production, you'd connect to F1's official WebSocket or a live data service

    if (timeSinceRaceStart > 0 && timeSinceRaceStart < estimatedRaceDuration) {
      // Race is currently happening
      const minutesSinceStart = timeSinceRaceStart / 60000;
      const estimatedLap = Math.max(1, Math.floor(minutesSinceStart / 1.5)); // Rough estimate

      // Fetch current race results if available
      const raceResults = await fetchCurrentRaceResults(year, nextRaceRound);

      return {
        isRaceOngoing: true,
        currentLap: Math.min(estimatedLap, 58),
        totalLaps: 58,
        flagStatus: 'GREEN',
        driverPositions: raceResults
      };
    }
  } catch (error) {
    console.error('Error checking live race status:', error);
  }

  return defaultResponse;
}

/**
 * Fetches current race results to determine live driver positions
 */
async function fetchCurrentRaceResults(year: number, round: number): Promise<Record<string, LiveDriverPosition>> {
  try {
    const res = await fetch(`${F1API_BASE}/${year}/${round}/results.json`);
    const data = await res.json();
    const results = data?.MRData?.RaceTable?.Races?.[0]?.Results || [];

    const driverPositions: Record<string, LiveDriverPosition> = {};

    results.forEach((result: any, index: number) => {
      const position = parseInt(result.position) || index + 1;
      const gridPosition = parseInt(result.grid) || 0;

      driverPositions[result.Driver.driverId] = {
        driverId: result.Driver.driverId,
        position,
        startPosition: gridPosition,
        positionDelta: gridPosition - position,
        currentLapTime: result.Time?.time,
        status: result.status === 'Finished' || result.status === '+1 Lap' || result.status.includes('Lap')
          ? 'RACING'
          : result.status === 'Pit' ? 'PIT' : 'DNF'
      };
    });

    return driverPositions;
  } catch (error) {
    console.error('Error fetching race results:', error);
    return {};
  }
}

/**
 * Finds the current or upcoming race round number and time
 */
export async function findCurrentRaceInfo(year: number): Promise<{ round: number; raceTime: Date } | null> {
  try {
    const res = await fetch(`${F1API_BASE}/${year}.json?limit=100`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    const now = new Date();
    let nextRace = null;

    for (const race of races) {
      const raceTime = new Date(`${race.date}T${race.time || '12:00:00Z'}`);
      if (raceTime > now) {
        nextRace = {
          round: parseInt(race.round),
          raceTime
        };
        break;
      }
    }

    return nextRace;
  } catch (error) {
    console.error('Error finding current race info:', error);
    return null;
  }
}

/**
 * Polls for live race data at regular intervals
 */
export function startLiveRacePoller(
  year: number,
  onUpdate: (state: LiveRaceSessionState) => void,
  interval: number = 5000 // Anchor poll every 5 seconds by default
) {
  let pollInterval: NodeJS.Timeout | null = null;
  let simInterval: NodeJS.Timeout | null = null;
  let raceInfo: { round: number; raceTime: Date } | null = null;
  let currentSimState: Record<string, LiveDriverPosition> | null = null;
  let anchorState: LiveRaceData | null = null;

  const clonePositions = (positions: Record<string, LiveDriverPosition>) => JSON.parse(JSON.stringify(positions));

  const startSimulator = (anchor: LiveRaceData) => {
    // Initialize sim state from anchor if needed
    if (!currentSimState) currentSimState = clonePositions(anchor.driverPositions);

    // Ensure any missing drivers from anchor are merged in
    currentSimState = { ...(currentSimState || {}), ...(clonePositions(anchor.driverPositions) || {}) };

    // Start per-second simulator if not already running
    if (!simInterval) {
      simInterval = setInterval(() => {
        try {
          if (!currentSimState) return;

          // Build an ordered array by position to simulate small overtakes
          const drivers = Object.values(currentSimState).sort((a, b) => a.position - b.position);

          // Small chance of adjacent position swaps to simulate overtakes / pitstops
          for (let i = 0; i < drivers.length - 1; i++) {
            const a = drivers[i];
            const b = drivers[i + 1];
            // If either driver is not racing, skip
            if (a.status !== 'RACING' || b.status !== 'RACING') continue;
            // Probability scaled by lap (more action mid-race)
            const baseProb = 0.02; // 2% base chance each second per adjacent pair
            const rand = Math.random();
            if (rand < baseProb) {
              // swap positions
              const tmp = a.position;
              a.position = b.position;
              b.position = tmp;
            }
          }
          // Occasionally simulate a pit stop: pick a random driver and set status
          if (Math.random() < 0.005) {
            const all = Object.values(currentSimState);
            const pick = all[Math.floor(Math.random() * all.length)];
            if (pick) pick.status = 'PIT';
          }
          // After small mutation, ensure positions are normalized (no duplicates)
          const normalized = Object.values(currentSimState)
            .sort((a, b) => a.position - b.position)
            .map((d, idx) => ({ ...d, position: idx + 1 }));
          // Rebuild currentSimState with normalized positions
          const rebuilt: Record<string, LiveDriverPosition> = {};
          normalized.forEach(d => { rebuilt[d.driverId] = d; });
          currentSimState = rebuilt;
          // Emit the updated state to the UI (keep anchor's lap/flag values)
          onUpdate({
            isRaceOngoing: anchor.isRaceOngoing,
            currentLap: anchor.currentLap,
            totalLaps: anchor.totalLaps,
            flagStatus: anchor.flagStatus,
            driverPositions: clonePositions(currentSimState)
          });
        } catch (err) {
          console.error('Simulator tick error:', err);
        }
      }, 1000);
    }
  };

  const stopSimulator = () => {
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
    currentSimState = null;
  };

  const poll = async () => {
    try {
      if (!raceInfo) {
        raceInfo = await findCurrentRaceInfo(year);
      }

      if (raceInfo) {
        const liveData = await checkLiveRaceStatus(year, raceInfo.raceTime, raceInfo.round);

        // Anchor the upstream state so simulator stays in sync periodically
        anchorState = liveData;
        if (liveData.isRaceOngoing) {
          // Start simulator anchored to this upstream snapshot
          startSimulator(liveData);
        } else {
          // Race not ongoing — ensure simulator stopped and emit a final non-live state
          stopSimulator();
          onUpdate({
            isRaceOngoing: false,
            currentLap: 0,
            totalLaps: liveData.totalLaps || 58,
            flagStatus: liveData.flagStatus || 'GREEN',
            driverPositions: {}
          });
        }
        // If race ended, reset raceInfo so next poll will re-discover upcoming races
        if (!liveData.isRaceOngoing && raceInfo) {
          raceInfo = null;
        }
      }
    } catch (error) {
      console.error('Error polling live race data:', error);
    }
  };

  // Initial poll
  poll();

  // Anchor poll interval
  pollInterval = setInterval(poll, interval);

  // Return cleanup function
  return () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    stopSimulator();
  };
}
