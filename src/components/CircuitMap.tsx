import { useState } from 'react';

interface CircuitMapProps {
    circuitId?: string;
    circuitName?: string;
    raceName?: string;
}

interface TrackDetails {
    name: string;
    length: string;
    firstGp: string;
    laps: number;
    recordTime: string;
    recordDriver: string;
    recordYear: string;
}

// REGISTRY: Keys perfectly match your filenames
const TRACK_REGISTRY: Record<string, TrackDetails> = {
    Bahrain_GP: { name: 'Bahrain International Circuit', length: '5.412 km', firstGp: '2004', laps: 57, recordTime: '1:31.447', recordDriver: 'P. de la Rosa', recordYear: '2005' },
    SaudiArabian_GP: { name: 'Jeddah Corniche Circuit', length: '6.174 km', firstGp: '2021', laps: 50, recordTime: '1:30.734', recordDriver: 'L. Hamilton', recordYear: '2021' },
    Australian_GP: { name: 'Albert Park Circuit', length: '5.278 km', firstGp: '1996', laps: 58, recordTime: '1:19.813', recordDriver: 'C. Leclerc', recordYear: '2024' },
    Japanese_GP: { name: 'Suzuka International Racing Course', length: '5.807 km', firstGp: '1987', laps: 53, recordTime: '1:30.983', recordDriver: 'L. Hamilton', recordYear: '2019' },
    Chinese_GP: { name: 'Shanghai International Circuit', length: '5.451 km', firstGp: '2004', laps: 56, recordTime: '1:32.238', recordDriver: 'M. Schumacher', recordYear: '2004' },
    Miami_GP: { name: 'Miami International Autodrome', length: '5.410 km', firstGp: '2022', laps: 57, recordTime: '1:29.708', recordDriver: 'M. Verstappen', recordYear: '2023' },
    EmiliaRomagna_GP: { name: 'Autodromo Enzo e Dino Ferrari', length: '4.909 km', firstGp: '1980', laps: 63, recordTime: '1:15.484', recordDriver: 'L. Hamilton', recordYear: '2020' },
    Monaco_GP: { name: 'Circuit de Monaco', length: '3.337 km', firstGp: '1950', laps: 78, recordTime: '1:12.909', recordDriver: 'L. Hamilton', recordYear: '2021' },
    Canadian_GP: { name: 'Circuit Gilles-Villeneuve', length: '4.361 km', firstGp: '1978', laps: 70, recordTime: '1:13.078', recordDriver: 'V. Bottas', recordYear: '2019' },
    Spanish_GP: { name: 'Circuit de Barcelona-Catalunya', length: '4.657 km', firstGp: '1991', laps: 66, recordTime: '1:16.330', recordDriver: 'M. Verstappen', recordYear: '2023' },
    Austrian_GP: { name: 'Red Bull Ring', length: '4.318 km', firstGp: '1970', laps: 71, recordTime: '1:05.619', recordDriver: 'C. Sainz', recordYear: '2020' },
    British_GP: { name: 'Silverstone Circuit', length: '5.891 km', firstGp: '1950', laps: 52, recordTime: '1:27.097', recordDriver: 'M. Verstappen', recordYear: '2020' },
    Hungarian_GP: { name: 'Hungaroring', length: '4.381 km', firstGp: '1986', laps: 70, recordTime: '1:16.627', recordDriver: 'L. Hamilton', recordYear: '2020' },
    Belgian_GP: { name: 'Circuit de Spa-Francorchamps', length: '7.004 km', firstGp: '1950', laps: 44, recordTime: '1:46.286', recordDriver: 'V. Bottas', recordYear: '2018' },
    Dutch_GP: { name: 'Circuit Zandvoort', length: '4.259 km', firstGp: '1952', laps: 72, recordTime: '1:11.097', recordDriver: 'L. Hamilton', recordYear: '2021' },
    Italian_GP: { name: 'Autodromo Nazionale Monza', length: '5.793 km', firstGp: '1950', laps: 53, recordTime: '1:21.046', recordDriver: 'R. Barrichello', recordYear: '2004' },
    Azerbaijan_GP: { name: 'Baku City Circuit', length: '6.003 km', firstGp: '2016', laps: 51, recordTime: '1:43.009', recordDriver: 'C. Leclerc', recordYear: '2019' },
    Singaporean_GP: { name: 'Marina Bay Street Circuit', length: '4.940 km', firstGp: '2008', laps: 62, recordTime: '1:35.867', recordDriver: 'L. Hamilton', recordYear: '2023' },
    US_GP: { name: 'Circuit of The Americas', length: '5.513 km', firstGp: '2012', laps: 56, recordTime: '1:36.169', recordDriver: 'C. Leclerc', recordYear: '2019' },
    Mexican_GP: { name: 'Autódromo Hermanos Rodríguez', length: '4.304 km', firstGp: '1963', laps: 71, recordTime: '1:17.774', recordDriver: 'V. Bottas', recordYear: '2021' },
    Brazilian_GP: { name: 'Autódromo José Carlos Pace', length: '4.309 km', firstGp: '1973', laps: 71, recordTime: '1:10.540', recordDriver: 'V. Bottas', recordYear: '2018' },
    LV_GP: { name: 'Las Vegas Strip Circuit', length: '6.201 km', firstGp: '2023', laps: 50, recordTime: '1:35.490', recordDriver: 'O. Piastri', recordYear: '2023' },
    Qatar_GP: { name: 'Lusail International Circuit', length: '5.419 km', firstGp: '2021', laps: 57, recordTime: '1:24.319', recordDriver: 'M. Verstappen', recordYear: '2023' },
    AbuDhabi_GP: { name: 'Yas Marina Circuit', length: '5.281 km', firstGp: '2009', laps: 58, recordTime: '1:26.103', recordDriver: 'M. Verstappen', recordYear: '2021' },
    default: { name: 'Standard Loop', length: '5.000 km', firstGp: '2026', laps: 50, recordTime: '1:20.000', recordDriver: 'SYSTEM', recordYear: '2026' }
};

const SECTOR_DATA = {
    1: { fastest: '27.482', driver: 'VER', status: 'GREEN' },
    2: { fastest: '38.114', driver: 'NOR', status: 'YELLOW' },
    3: { fastest: '22.903', driver: 'LEC', status: 'GREEN' }
};

// RESOLVER: Matches API text to exact filenames
const resolveTrackId = (cId?: string, cName?: string, rName?: string) => {
    const searchStr = `${cId || ''} ${cName || ''} ${rName || ''}`.toLowerCase();

    if (searchStr.includes('belgian') || searchStr.includes('spa')) return 'Belgian_GP';
    if (searchStr.includes('bahrain')) return 'Bahrain_GP';
    if (searchStr.includes('saudi') || searchStr.includes('jeddah')) return 'SaudiArabian_GP';
    if (searchStr.includes('australian') || searchStr.includes('albert')) return 'Australian_GP';
    if (searchStr.includes('japan') || searchStr.includes('suzuka')) return 'Japanese_GP';
    if (searchStr.includes('china') || searchStr.includes('chinese') || searchStr.includes('shanghai') || searchStr.includes('sinopec')) return 'Chinese_GP';    if (searchStr.includes('miami')) return 'Miami_GP';
    if (searchStr.includes('emilia') || searchStr.includes('imola')) return 'EmiliaRomagna_GP';
    if (searchStr.includes('monaco')) return 'Monaco_GP';
    if (searchStr.includes('canada') || searchStr.includes('canadian') || searchStr.includes('villeneuve') || searchStr.includes('montreal')) return 'Canadian_GP';    if (searchStr.includes('spain') || searchStr.includes('spanish') || searchStr.includes('catalunya') || searchStr.includes('barcelona')) return 'Spanish_GP';
    if (searchStr.includes('austria') || searchStr.includes('red bull')) return 'Austrian_GP';
    if (searchStr.includes('brit') || searchStr.includes('silverstone')) return 'British_GP';
    if (searchStr.includes('hungar')) return 'Hungarian_GP';
    if (searchStr.includes('dutch') || searchStr.includes('zandvoort')) return 'Dutch_GP';
    if (searchStr.includes('ital') || searchStr.includes('monza')) return 'Italian_GP';
    if (searchStr.includes('azerbaijan') || searchStr.includes('baku')) return 'Azerbaijan_GP';
    if (searchStr.includes('singapore') || searchStr.includes('marina bay')) return 'Singaporean_GP';
    if (searchStr.includes('united states') || searchStr.includes('usa') || searchStr.includes('americas')) return 'US_GP';
    if (searchStr.includes('mexic') || searchStr.includes('rodriguez')) return 'Mexican_GP';
    if (searchStr.includes('brazil') || searchStr.includes('são paulo') || searchStr.includes('interlagos')) return 'Brazilian_GP';
    if (searchStr.includes('vegas') || searchStr.includes('lv_')) return 'LV_GP';
    if (searchStr.includes('qatar') || searchStr.includes('losail')) return 'Qatar_GP';
    if (searchStr.includes('abu dhabi') || searchStr.includes('yas')) return 'AbuDhabi_GP';

    return 'default';
};

export default function CircuitMap({ circuitId, circuitName, raceName }: CircuitMapProps) {
    const [activeSector, setActiveSector] = useState<1 | 2 | 3 | null>(null);

    const trackId = resolveTrackId(circuitId, circuitName, raceName);
    const activeTrack = TRACK_REGISTRY[trackId];
    const displayTitle = circuitName || activeTrack.name;

    const fullImageUrl = `${window.location.origin}/tracks/${trackId}.avif`;

    return (
        <div className="bg-[#0a0f18] border border-slate-800 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden shadow-2xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-[#0a0f18] to-black">

            <div className="flex flex-col gap-3 mb-4 relative z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                        <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm drop-shadow-md">Track Telemetry</h3>
                    </div>
                </div>

                <div className="h-8 flex items-center">
                    {activeSector ? (
                        <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded text-xs font-mono animate-in fade-in slide-in-from-left-2 duration-200">
                            <span className="font-bold text-white uppercase tracking-widest">Sector {activeSector} Target:</span>
                            <span className={`text-white px-1.5 py-0.5 rounded ${SECTOR_DATA[activeSector].status === 'YELLOW' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.4)]' :
                                SECTOR_DATA[activeSector].status === 'PURPLE' ? 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)]' :
                                    'bg-green-500 shadow-[0_0_10px_rgba(74,222,128,0.4)]'
                                }`}>{SECTOR_DATA[activeSector].fastest}s</span>
                            <span className="text-slate-400">({SECTOR_DATA[activeSector].driver})</span>
                        </div>
                    ) : (
                        <span className="text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center h-full">
                            Select a sector below to inspect timing
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full flex-grow relative flex items-center justify-center min-h-[400px] bg-[#05080f] rounded-xl border border-slate-800/80 overflow-hidden shadow-inner p-8">

                {/* Container Frame Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-slate-700/50 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-slate-700/50 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-slate-700/50 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-slate-700/50 rounded-br-xl" />
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* IMAGE WRAPPER - Reduced from 65% to 50% for a much smaller, centered track */}
                <div className="relative w-[50%] h-[50%] flex items-center justify-center max-w-2xl">
                    {/* Unified Base Image - Static Cyan Drop Shadow, No Dynamic Highlights */}
                    <img
                        key={trackId}
                        src={fullImageUrl}
                        alt={displayTitle}
                        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                    />
                </div>
            </div>

            {/* METADATA PANEL */}
            <div className="mt-6 flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                    <h4 className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Circuit Metadata</h4>
                    <span className="text-[9px] text-cyan-500/80 font-mono uppercase tracking-[0.2em]">{displayTitle}</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center transition-all hover:bg-slate-800/40">
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-1">Length</span>
                        <span className="text-cyan-400 font-bold font-mono text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">{activeTrack.length}</span>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center transition-all hover:bg-slate-800/40">
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-1">Laps</span>
                        <span className="text-white font-bold font-mono text-sm">{activeTrack.laps}</span>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center transition-all hover:bg-slate-800/40">
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-1">First GP</span>
                        <span className="text-white font-bold font-mono text-sm">{activeTrack.firstGp}</span>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center col-span-2 transition-all hover:bg-slate-800/40">
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-1 flex justify-between">
                            <span>Fastest Lap</span>
                            <span className="text-purple-400/80">YR: {activeTrack.recordYear}</span>
                        </span>
                        <div className="flex items-baseline justify-between mt-0.5">
                            <span className="text-purple-400 font-bold font-mono text-sm drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">{activeTrack.recordTime}</span>
                            <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">{activeTrack.recordDriver}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                    {[1, 2, 3].map((sector) => {
                        const isYellow = sector === 2;
                        return (
                            <div
                                key={sector}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/40 border transition-all duration-300 cursor-pointer ${activeSector === sector ? 'border-slate-500 bg-slate-800 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}
                                onClick={() => setActiveSector(activeSector === sector ? null : (sector as 1 | 2 | 3))}
                            >
                                <span className={`text-[9px] font-bold font-mono mb-1.5 ${activeSector === sector ? 'text-white' : 'text-slate-500'}`}>SECTOR {sector}</span>
                                <div className={`w-full h-1 rounded-full ${isYellow ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-green-400 shadow-[0_0_8px_#4ade80]'}`} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}