import { useEffect, useRef, useState } from 'react';

export default function F1Loader({ onLoaded }: { onLoaded?: () => void }) {
    const [step, setStep] = useState<number>(0);
    const [isExtinguishing, setIsExtinguishing] = useState<boolean>(false);

    // Store the latest onLoaded function to prevent interval resets
    const onLoadedRef = useRef(onLoaded);
    useEffect(() => {
        onLoadedRef.current = onLoaded;
    }, [onLoaded]);

    // 1. Light up sequence (0 to 5)
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => {
                if (prev < 5) {
                    return prev + 1;
                } else {
                    clearInterval(interval);
                    return prev; // Stop at 5
                }
            });
        }, 700); // 700ms gives just enough time to read each year

        return () => clearInterval(interval);
    }, []);

    // 2. Lights out sequence triggered ONLY when step hits 5
    useEffect(() => {
        if (step === 5) {
            // Hold the 5 lights and 2026 text for 1 second so it's readable
            const extinguishTimer = setTimeout(() => {
                setIsExtinguishing(true);

                // Trigger the actual site load 500ms after the lights go dark
                const loadTimer = setTimeout(() => {
                    if (onLoadedRef.current) onLoadedRef.current();
                }, 500);

                return () => clearTimeout(loadTimer);
            }, 1000);

            return () => clearTimeout(extinguishTimer);
        }
    }, [step]);

    // 3. Exact mapping for your requested text sequence
    const getStatusText = () => {
        if (isExtinguishing) return 'Lights Out & Away We Go!';

        switch (step) {
            case 1:
                return 'Initializing Telemetry Grid...';
            case 2:
                return 'Calculating 2023 Results...';
            case 3:
                return 'Calculating 2024 Results...';
            case 4:
                return 'Calculating 2025 Results...';
            case 5:
                return 'Calculating 2026 Results...';
            default:
                return 'Warming up tyres...'; // Covers step 0 before the first light hits
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0f18] flex flex-col items-center justify-center font-sans select-none">
            {/* F1 Starting Lights Gantry Container */}
            <div className="bg-[#121824] border border-slate-800/80 px-8 py-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex gap-4 items-center justify-center mb-10">
                {[0, 1, 2, 3, 4].map((colIndex) => {
                    // Column lights up if its index is less than the current step (e.g., step 1 lights index 0)
                    const isLit = colIndex < step && !isExtinguishing;
                    return (
                        <div key={colIndex} className="flex flex-col gap-3">
                            {/* Top Bulb */}
                            <div className={`w-8 h-8 rounded-full transition-all duration-300 border ${isLit
                                    ? 'bg-red-600 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.9)] scale-105'
                                    : 'bg-[#1a2230] border-slate-700/60 shadow-inner'
                                }`} />
                            {/* Bottom Bulb */}
                            <div className={`w-8 h-8 rounded-full transition-all duration-300 border ${isLit
                                    ? 'bg-red-600 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.9)] scale-105'
                                    : 'bg-[#1a2230] border-slate-700/60 shadow-inner'
                                }`} />
                        </div>
                    );
                })}
            </div>

            {/* Loading text status */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-white font-black tracking-[0.3em] text-sm uppercase animate-pulse">
                    {getStatusText()}
                </div>
                <div className="text-slate-500 font-mono text-[10px] tracking-[0.2em] uppercase">
                    FIA World Championship Engine
                </div>
            </div>
        </div>
    );
}