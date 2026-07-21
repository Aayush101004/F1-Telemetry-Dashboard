export interface RaceResult {
    position: string;
    positionText: string;
    points: string;
    grid: string;
    laps: string;
    status: string;
    Driver: { driverId: string; givenName: string; familyName: string; };
    Constructor?: { constructorId: string; };
    Time?: { time: string; };
    FastestLap?: {
        rank?: string;
        Time?: { time: string; };
        AverageSpeed?: { speed: string; units: string; };
    };
}

export interface QualifyingResult {
    number: string;
    position: string;
    Driver: { driverId: string; givenName: string; familyName: string; };
    Constructor: { constructorId: string; };
    Q1?: string;
    Q2?: string;
    Q3?: string;
}

export interface SessionData {
    title: string;
    results: RaceResult[];
    qualifyingResults?: QualifyingResult[];
    isSprint: boolean;
    Circuit?: {
        circuitId: string;
        circuitName: string;
    };
}

export interface UpcomingRace {
    name: string;
    time: Date;
    date?: string;
}

export interface ProcessedSeasonState {
    globalNames: Record<string, string>;
    driverTeamMap: Record<string, string>;
    globalHistory: Record<string, number[]>;
    teamHistory: Record<string, number[]>;
    roundScores: Record<string, number>[];
    historicalStats: Record<number, Record<string, { poles: number; podiums: number; titles: number }>>;
    driverStats: Record<string, { poles: number; podiums: number; titles: number; debut: number }>;
    teamStats: Record<string, { poles: number; podiums: number; titles: number; debut: number }>;
}

export interface PredictionData {
    id: string;
    total: number;
    momentum: number;
    score: number;
}

export interface TooltipState {
    type: 'driver' | 'team' | 'prediction' | 'driver-stats' | null;
    id: string | null;
    x: number;
    y: number;
    data?: PredictionData;
    message?: string;
}

// Real-Time Live Race Telemetry Types
export type RaceFlagStatus = 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'VSC' | 'SC' | 'RED';

export interface LiveDriverPosition {
    driverId: string;
    position: number;
    startPosition: number;
    positionDelta: number;
    currentLapTime?: string;
    status: 'RACING' | 'PIT' | 'DNF';
}

export interface LiveRaceSessionState {
    isRaceOngoing: boolean;
    currentLap: number;
    totalLaps: number;
    flagStatus: RaceFlagStatus;
    driverPositions: Record<string, LiveDriverPosition>;
}