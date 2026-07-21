import { useEffect, useMemo, useState } from 'react';
import { fetchF1SeasonData } from './api';
import CircuitMap from './components/CircuitMap';
import ConstructorStandings from './components/ConstructorStandings';
import DashboardControls from './components/DashboardControls';
import DetailedBreakdown from './components/DetailedBreakdown';
import DriversGrid from './components/DriversGrid';
import F1CarViewer from './components/F1CarViewer';
import GlobalTooltip from './components/GlobalTooltip';
import HeadToHeadComparison from './components/HeadToHeadComparison';
import ProgressionCharts from './components/ProgressionCharts';
import RacePredictions from './components/RacePredictions';
import SessionHighlights from './components/SessionHighlights';
import StandingsTables from './components/StandingsTables';
import type { LiveRaceSessionState, ProcessedSeasonState, RaceResult, SessionData, TooltipState, UpcomingRace } from './types';
import { F1_POINTS_MAP, getNormalizedTeamKey } from './utils';

const BASELINE_STATS: Record<string, { poles: number; podiums: number; titles: number; debut: number }> = {
  max_verstappen: { poles: 20, podiums: 77, titles: 2, debut: 2015 },
  hamilton: { poles: 103, podiums: 191, titles: 7, debut: 2007 },
  alonso: { poles: 22, podiums: 98, titles: 2, debut: 2001 },
  leclerc: { poles: 18, podiums: 24, titles: 0, debut: 2018 },
  sainz: { poles: 3, podiums: 15, titles: 0, debut: 2015 },
  russell: { poles: 1, podiums: 9, titles: 0, debut: 2019 },
  norris: { poles: 1, podiums: 6, titles: 0, debut: 2019 },
  stroll: { poles: 1, podiums: 3, titles: 0, debut: 2017 },
  gasly: { poles: 0, podiums: 3, titles: 0, debut: 2017 },
  albon: { poles: 0, podiums: 2, titles: 0, debut: 2019 },
  ocon: { poles: 0, podiums: 2, titles: 0, debut: 2016 },
  hulkenberg: { poles: 1, podiums: 0, titles: 0, debut: 2010 },
  bottas: { poles: 20, podiums: 67, titles: 0, debut: 2013 },
  perez: { poles: 1, podiums: 26, titles: 0, debut: 2011 },
  kevin_magnussen: { poles: 1, podiums: 1, titles: 0, debut: 2014 },
  tsunoda: { poles: 0, podiums: 0, titles: 0, debut: 2021 },
  zhou: { poles: 0, podiums: 0, titles: 0, debut: 2022 },
  de_vries: { poles: 0, podiums: 0, titles: 0, debut: 2022 },
  sargeant: { poles: 0, podiums: 0, titles: 0, debut: 2023 },
  piastri: { poles: 0, podiums: 0, titles: 0, debut: 2023 },
  lawson: { poles: 0, podiums: 0, titles: 0, debut: 2023 },
  hadjar: { poles: 0, podiums: 0, titles: 0, debut: 2023 },
  antonelli: { poles: 0, podiums: 0, titles: 0, debut: 2024 },
  doohan: { poles: 0, podiums: 0, titles: 0, debut: 2024 },
  lindblad: { poles: 0, podiums: 0, titles: 0, debut: 2024 },
  bortoleto: { poles: 0, podiums: 0, titles: 0, debut: 2024 },
  bearman: { poles: 0, podiums: 0, titles: 0, debut: 2024 }
};

const CONSTRUCTOR_BASELINE_STATS: Record<string, { poles: number; podiums: number; titles: number; debut: number }> = {
  red_bull: { poles: 81, podiums: 234, titles: 5, debut: 2005 },
  mercedes: { poles: 136, podiums: 281, titles: 8, debut: 1954 },
  ferrari: { poles: 242, podiums: 798, titles: 16, debut: 1950 },
  mclaren: { poles: 156, podiums: 494, titles: 8, debut: 1966 },
  aston_martin: { poles: 1, podiums: 1, titles: 0, debut: 2021 },
  alpine: { poles: 0, podiums: 2, titles: 0, debut: 2021 },
  williams: { poles: 128, podiums: 313, titles: 9, debut: 1978 },
  alphatauri: { poles: 1, podiums: 5, titles: 0, debut: 2006 },
  rb: { poles: 1, podiums: 5, titles: 0, debut: 2006 },
  alfa: { poles: 1, podiums: 26, titles: 0, debut: 1993 },
  kick_sauber: { poles: 1, podiums: 26, titles: 0, debut: 1993 },
  haas: { poles: 1, podiums: 0, titles: 0, debut: 2016 }
};

export default function App() {
  const [year, setYear] = useState<number>(2026);
  const [scopeIndex, setScopeIndex] = useState<number>(0);
  const [loadingMsg, setLoadingMsg] = useState<string>('Initializing Telemetry...');

  const [driverStats, setDriverStats] = useState<ProcessedSeasonState['driverStats']>({});
  const [teamStats, setTeamStats] = useState<ProcessedSeasonState['teamStats']>({});

  const [seasonsCache, setSeasonsCache] = useState<Record<number, { sessions: SessionData[], upcomingRace: UpcomingRace | null }>>({});

  const [globalHistoricalStats, setGlobalHistoricalStats] = useState<Record<number, Record<number, Record<string, { poles: number; podiums: number; titles: number; debut: number }>>>>({});
  const [globalTeamHistoricalStats, setGlobalTeamHistoricalStats] = useState<Record<number, Record<number, Record<string, { poles: number; podiums: number; titles: number; debut: number }>>>>({});

  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [tooltipState, setTooltipState] = useState<TooltipState>({ type: null, id: null, x: 0, y: 0 });

  // Live Race Engine State
  const [liveState] = useState<LiveRaceSessionState>({
    isRaceOngoing: false,
    currentLap: 0,
    totalLaps: 58,
    flagStatus: 'GREEN',
    driverPositions: {}
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const applyDefaultsForYear = (targetYear: number, cache: Record<number, { sessions: SessionData[], upcomingRace: UpcomingRace | null }>) => {
    const data = cache[targetYear];
    if (!data) return;
    const newSessions = data.sessions;
    setScopeIndex(Math.max(0, newSessions.length - 1));

    const globalHist: Record<string, number> = {};
    const teamHist: Record<string, number> = {};
    newSessions.forEach(session => {
      session.results.forEach(r => {
        const dId = r.Driver.driverId;
        const tId = getNormalizedTeamKey(r.Constructor?.constructorId, dId);
        const pts = parseFloat(r.points) || 0;
        globalHist[dId] = (globalHist[dId] || 0) + pts;
        teamHist[tId] = (teamHist[tId] || 0) + pts;
      });
    });
    setSelectedDrivers(new Set(Object.keys(globalHist).sort((a, b) => globalHist[b] - globalHist[a]).slice(0, 5)));
    setSelectedTeams(new Set(Object.keys(teamHist).sort((a, b) => teamHist[b] - teamHist[a]).slice(0, 3)));
  };

  // Auto-select race when timer hits 00:00:00:00
  useEffect(() => {
    const checkCountdown = () => {
      const upcoming = seasonsCache[year]?.upcomingRace;
      if (!upcoming?.time) return;

      const raceTime = new Date(upcoming.time).getTime();
      const now = Date.now();

      if (now >= raceTime && scopeIndex !== (seasonsCache[year]?.sessions.length || 1) - 1) {
        const activeIndex = Math.max(0, (seasonsCache[year]?.sessions.length || 1) - 1);
        setScopeIndex(activeIndex);
      }
    };

    const interval = setInterval(checkCountdown, 1000);
    return () => clearInterval(interval);
  }, [seasonsCache, year, scopeIndex]);

  useEffect(() => {
    let isMounted = true;
    const bootSequence = async () => {
      const years = [2023, 2024, 2025, 2026];
      const cache: Record<number, { sessions: SessionData[], upcomingRace: UpcomingRace | null }> = {};

      const timeline: Record<number, Record<number, Record<string, { poles: number; podiums: number; titles: number; debut: number }>>> = {};
      const teamTimeline: Record<number, Record<number, Record<string, { poles: number; podiums: number; titles: number; debut: number }>>> = {};

      const statsTracker: Record<string, { poles: number; podiums: number; titles: number; debut: number }> = {};
      const teamStatsTracker: Record<string, { poles: number; podiums: number; titles: number; debut: number }> = {};

      Object.keys(BASELINE_STATS).forEach(id => { statsTracker[id.toLowerCase()] = { ...BASELINE_STATS[id] }; });
      Object.keys(CONSTRUCTOR_BASELINE_STATS).forEach(id => { teamStatsTracker[id.toLowerCase()] = { ...CONSTRUCTOR_BASELINE_STATS[id] }; });

      for (const y of years) {
        if (!isMounted) return;

        setLoadingMsg(`Calculating ${y} Results...`);
        await sleep(300);

        timeline[y] = {};
        teamTimeline[y] = {};

        try {
          const cacheKey = `f1_v5_cache_${y}`;
          const cachedData = localStorage.getItem(cacheKey);
          let data;

          if (cachedData && y !== 2026) {
            data = JSON.parse(cachedData);
            if (!data || !data.sessions || data.sessions.length === 0) {
              data = null;
            }
          }

          if (!data) {
            await sleep(300);
            data = await fetchF1SeasonData(y);

            if (y !== 2026 && data && data.sessions && data.sessions.length > 0) {
              try {
                localStorage.setItem(cacheKey, JSON.stringify(data));
              } catch {
                console.warn('Local storage full, skipping cache save');
              }
            }
          }

          cache[y] = { sessions: data.sessions || [], upcomingRace: data.upcomingRace || null };

          const yearlyPointsMap: Record<string, number> = {};
          const yearlyTeamPointsMap: Record<string, number> = {};

          cache[y].sessions.forEach((s, idx) => {
            s.results.forEach((r: RaceResult) => {
              const dId = r.Driver.driverId.toLowerCase();
              const tId = getNormalizedTeamKey(r.Constructor?.constructorId, dId);
              const p = parseFloat(r.points) || 0;

              if (!statsTracker[dId]) {
                statsTracker[dId] = { poles: 0, podiums: 0, titles: 0, debut: y };
              }
              if (!teamStatsTracker[tId]) {
                teamStatsTracker[tId] = { poles: 0, podiums: 0, titles: 0, debut: y };
              }

              if (!s.isSprint) {
                if (r.grid === "1") statsTracker[dId].poles += 1;
                if (["1", "2", "3"].includes(r.positionText)) statsTracker[dId].podiums += 1;

                if (r.grid === "1") teamStatsTracker[tId].poles += 1;
                if (["1", "2", "3"].includes(r.positionText)) teamStatsTracker[tId].podiums += 1;
              }

              yearlyPointsMap[dId] = (yearlyPointsMap[dId] || 0) + p;
              yearlyTeamPointsMap[tId] = (yearlyTeamPointsMap[tId] || 0) + p;
            });

            timeline[y][idx] = JSON.parse(JSON.stringify(statsTracker));
            teamTimeline[y][idx] = JSON.parse(JSON.stringify(teamStatsTracker));
          });

          if (y < 2026 && Object.keys(yearlyPointsMap).length > 0) {
            const champ = Object.keys(yearlyPointsMap).reduce((a, b) => yearlyPointsMap[a] > yearlyPointsMap[b] ? a : b);
            if (statsTracker[champ]) {
              statsTracker[champ].titles += 1;
              const lastIdx = cache[y].sessions.length - 1;
              if (timeline[y][lastIdx] && timeline[y][lastIdx][champ]) {
                timeline[y][lastIdx][champ].titles = statsTracker[champ].titles;
              }
            }

            const champTeam = Object.keys(yearlyTeamPointsMap).reduce((a, b) => yearlyTeamPointsMap[a] > yearlyTeamPointsMap[b] ? a : b);
            if (teamStatsTracker[champTeam]) {
              teamStatsTracker[champTeam].titles += 1;
              const lastIdx = cache[y].sessions.length - 1;
              if (teamTimeline[y][lastIdx] && teamTimeline[y][lastIdx][champTeam]) {
                teamTimeline[y][lastIdx][champTeam].titles = teamStatsTracker[champTeam].titles;
              }
            }
          }
        } catch (e) {
          console.error(`Encountered error calculating F1 data maps for year ${y}:`, e);
        }
      }

      if (isMounted) {
        setGlobalHistoricalStats(timeline);
        setGlobalTeamHistoricalStats(teamTimeline);
        setSeasonsCache(cache);
        setDriverStats(statsTracker);
        setTeamStats(teamStatsTracker);
        applyDefaultsForYear(2026, cache);
        setLoadingMsg('');
      }
    };
    bootSequence();
    return () => { isMounted = false; };
  }, []);

  const handleYearChange = (newYear: number) => { setYear(newYear); applyDefaultsForYear(newYear, seasonsCache); };
  const sessions = useMemo(() => seasonsCache[year]?.sessions || [], [seasonsCache, year]);

  // Real-Time Standings & Graph State Calculation
  const processedState = useMemo<ProcessedSeasonState>(() => {
    const state: ProcessedSeasonState = {
      globalNames: {}, driverTeamMap: {}, globalHistory: {}, teamHistory: {}, roundScores: [],
      historicalStats: globalHistoricalStats[year] || {},
      driverStats: globalHistoricalStats[year]?.[scopeIndex] || driverStats,
      teamStats: globalTeamHistoricalStats[year]?.[scopeIndex] || teamStats
    };

    sessions.forEach((session) => {
      session.results.forEach(r => {
        const dId = r.Driver.driverId;
        const tId = getNormalizedTeamKey(r.Constructor?.constructorId, dId);
        state.globalNames[dId] = `${r.Driver.givenName} ${r.Driver.familyName}`;
        state.driverTeamMap[dId] = tId;

        if (!state.globalHistory[dId]) state.globalHistory[dId] = Array(sessions.length).fill(0);
        if (!state.teamHistory[tId]) state.teamHistory[tId] = Array(sessions.length).fill(0);
      });
    });

    sessions.forEach((session, idx) => {
      state.roundScores[idx] = {};

      Object.keys(state.globalHistory).forEach(dId => {
        state.globalHistory[dId][idx] = idx > 0 ? state.globalHistory[dId][idx - 1] : 0;
      });
      Object.keys(state.teamHistory).forEach(tId => {
        state.teamHistory[tId][idx] = idx > 0 ? state.teamHistory[tId][idx - 1] : 0;
      });

      // Live updates apply to the active scopeIndex while race is ongoing
      const isCurrentScopeLive = liveState.isRaceOngoing && idx === scopeIndex;

      if (isCurrentScopeLive && liveState.currentLap >= 2) {
        // Real-time position and points calculation
        Object.values(liveState.driverPositions).forEach(driver => {
          const dId = driver.driverId;
          const tId = state.driverTeamMap[dId] || getNormalizedTeamKey(undefined, dId);
          const pts = F1_POINTS_MAP[driver.position] || 0;

          state.roundScores[idx][dId] = pts;
          state.globalHistory[dId][idx] = (idx > 0 ? state.globalHistory[dId][idx - 1] : 0) + pts;
          state.teamHistory[tId][idx] = (idx > 0 ? state.teamHistory[tId][idx - 1] : 0) + pts;
        });
      } else {
        // Standard session calculation (Lap 1 or past completed races)
        session.results.forEach(r => {
          const dId = r.Driver.driverId;
          const tId = getNormalizedTeamKey(r.Constructor?.constructorId, dId);
          const pts = parseFloat(r.points) || 0;

          state.globalHistory[dId][idx] += pts;
          state.teamHistory[tId][idx] += pts;
          state.roundScores[idx][dId] = pts;
        });
      }
    });

    return state;
  }, [sessions, globalHistoricalStats, globalTeamHistoricalStats, year, driverStats, teamStats, scopeIndex, liveState]);

  if (loadingMsg) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-slate-300 text-lg font-black tracking-widest uppercase animate-pulse">{loadingMsg}</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-[2560px] mx-auto p-6 flex flex-col gap-8">
      <DashboardControls year={year} setYear={handleYearChange} sessions={sessions} scopeIndex={scopeIndex} setScopeIndex={setScopeIndex} upcomingRace={seasonsCache[year]?.upcomingRace || null} />
      {sessions.length > 0 && (
        <>

          <div className="flex flex-row gap-8">
            <div className="w-1/3">
              <StandingsTables state={processedState} scopeIndex={scopeIndex} selectedDrivers={selectedDrivers} setSelectedDrivers={setSelectedDrivers} setTooltipState={setTooltipState} />
            </div>
            <div className="w-2/3">
              <ProgressionCharts state={processedState} sessions={sessions} scopeIndex={scopeIndex} selectedDrivers={selectedDrivers} type="drivers" />
            </div>
          </div>

          <div className="flex flex-row gap-8">
            <div className="w-1/3">
              <ConstructorStandings state={processedState} scopeIndex={scopeIndex} selectedTeams={selectedTeams} setSelectedTeams={setSelectedTeams} year={year} setTooltipState={setTooltipState} />
            </div>
            <div className="w-2/3">
              <ProgressionCharts state={processedState} sessions={sessions} scopeIndex={scopeIndex} selectedTeams={selectedTeams} type="constructors" />
            </div>
          </div>

          <DetailedBreakdown session={sessions[scopeIndex]} state={processedState} scopeIndex={scopeIndex} liveState={liveState} />

          <div className="w-full">
            <SessionHighlights sessions={sessions} scopeIndex={scopeIndex} state={processedState} year={year} liveState={liveState} />
          </div>

          {/* Head-to-Head Comparison Tool */}
          <HeadToHeadComparison state={processedState} />

          {year === 2026 && (
            <RacePredictions
              state={processedState}
              scopeIndex={scopeIndex + 1}
              sessions={sessions}
              upcomingRace={seasonsCache[year]?.upcomingRace}
              liveState={liveState}
            />
          )}

          <DriversGrid state={processedState} scopeIndex={scopeIndex} />

          <div className="flex flex-col gap-8 w-full">
            <div className="w-full">
              <F1CarViewer />
            </div>
            <div className="w-full h-auto">
              {(() => {
                interface ApiSession {
                  title?: string;
                }
                const currentSession = sessions[scopeIndex] as unknown as ApiSession;

                return (
                  <CircuitMap
                    circuitName={currentSession?.title}
                    raceName={currentSession?.title}
                  />
                );
              })()}
            </div>
          </div>
        </>
      )}
      <GlobalTooltip tooltip={tooltipState} state={processedState} scopeIndex={scopeIndex} />

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-800/60 bg-[#060b14] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase">
            Engineered by Aayush Khanna
          </p>
          <div className="w-12 h-[2px] bg-red-600/50 rounded-full"></div>
          <p className="text-[10px] text-slate-600 font-bold tracking-wider uppercase">
            F1 Telemetry & Analytics Dashboard © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}