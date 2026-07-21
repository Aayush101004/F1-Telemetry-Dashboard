import { useEffect, useState } from 'react';
import type { SessionData, UpcomingRace } from '../types';

interface Props {
    year: number; 
    setYear: (y: number) => void;
    sessions: SessionData[];
    scopeIndex: number; 
    setScopeIndex: (idx: number) => void;
    upcomingRace: UpcomingRace | null;
}

export default function DashboardControls({ year, setYear, sessions, scopeIndex, setScopeIndex, upcomingRace }: Props) {
    const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (!upcomingRace || year !== 2026) return;
        const interval = setInterval(() => {
            const gap = upcomingRace.time.getTime() - new Date().getTime();
            if (gap <= 0) {
                setIsLive(true);
                clearInterval(interval);
            } else {
                setTimeLeft({
                    d: String(Math.floor(gap / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                    h: String(Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
                    m: String(Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
                    s: String(Math.floor((gap % (1000 * 60)) / 1000)).padStart(2, '0')
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [upcomingRace, year]);

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-red-600 rounded-full"></div>
                <h1 className="text-2xl font-black text-white uppercase tracking-wider">F1 Telemetry Dashboard</h1>
            </div>

            {/* The Live Countdown Timer */}
            <div className="flex flex-col mx-auto bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 shadow-inner">
                {year !== 2026 ? (
                    <span className="text-slate-500 font-bold uppercase text-xs text-center tracking-widest">F1 {year} Season Complete</span>
                ) : !upcomingRace ? (
                    <span className="text-slate-500 font-bold uppercase text-xs text-center tracking-widest">Season Complete</span>
                ) : isLive ? (
                    <span className="text-emerald-500 font-bold uppercase text-xs text-center tracking-widest">Session Live 🏎️</span>
                ) : (
                    <>
                        <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest text-center mb-1 block leading-none">NEXT: {upcomingRace.name}</span>
                        <div className="flex items-center gap-2 font-mono font-bold text-lg leading-none">
                            <span className="text-red-500">{timeLeft.d}<span className="text-slate-600 text-[10px] ml-0.5">D</span></span> <span className="text-slate-700">:</span>
                            <span className="text-white">{timeLeft.h}<span className="text-slate-600 text-[10px] ml-0.5">H</span></span> <span className="text-slate-700">:</span>
                            <span className="text-white">{timeLeft.m}<span className="text-slate-600 text-[10px] ml-0.5">M</span></span> <span className="text-slate-700">:</span>
                            <span className="text-slate-400">{timeLeft.s}<span className="text-slate-600 text-[10px] ml-0.5">S</span></span>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-3 ml-auto w-full md:w-auto">
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-slate-950 border border-slate-700 text-white font-bold p-2.5 rounded-lg w-full md:w-auto cursor-pointer focus:ring-2 focus:ring-red-600 outline-none">
                    {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y} Season</option>)}
                </select>
                <select value={scopeIndex} onChange={e => setScopeIndex(Number(e.target.value))} className="bg-slate-950 border border-slate-700 text-white font-bold p-2.5 rounded-lg w-full md:w-auto cursor-pointer focus:ring-2 focus:ring-red-600 outline-none">
                    {sessions.map((s, i) => <option key={i} value={i}>{s.title}</option>)}
                </select>
            </div>
        </div>
    );
}