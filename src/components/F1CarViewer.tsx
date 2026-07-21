import { animated as a, SpringValue, useSpring } from '@react-spring/three';
import { Center, ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber'; // <--- useFrame added here!
import { Suspense, useState } from 'react';

const CAR_SCALE = 4.5;

// 1. Updated: nodeName is now nodeNames (an array of strings)
const CAR_PARTS = [
    {
        id: 'front-wing',
        nodeNames: ['frontwing_fr_01_0', 'frontwing_fl_01_1', 'frontspoiler_fm_2', 'frontflap_fl_3', 'frontflap_fr_4', 'frontwing_fr_01001_11', 'frontwing_fl_01001_12', 'frontspoiler_fm001_13', 'frontspoiler_fm002_14', 'frontspoiler_fm003_15', 'frontspoiler_fm004_16', 'frontflap_fl001_17', 'frontflap_fl002_18', 'frontflap_fr001_19', 'frontflap_fr002_20'],
        name: 'Front Wing Assembly', region: 'FRONT AERO', position: [0, 0.15, 2.3], explodeDir: [0, 0, 4], description: 'Engineered to slice through clean air, generating high pressure above and low pressure below.'
    },
    {
        id: 'nosecone',
        nodeNames: ['nosecone_6', 'nosecone001_23', 'nosecone002_24', 'nosecone003_25', 'nosecone004_26', 'camera_wing_7', 'camera_wing001_29', 'camera_wing002_30'],
        name: 'Front Crash Structure', region: 'FRONT CHASSIS', position: [0, 0.25, 1.9], explodeDir: [0, 1, 3], description: 'A highly engineered carbon-fiber deformable structure designed to absorb massive frontal impact energy.'
    },
    {
        id: 'rear-wing',
        nodeNames: ['rearwing_top_239', 'rearwing_top_SUB0_237', 'rearwing_top_SUB1_238', 'rearwing_top006_SUB3_240', 'rearwing_top001_241', 'rearwing_top002_242', 'rearwing_top003_243', 'rearwing_top004_244', 'DRS_252', 'DRS2_246', 'rearwingmoving_top_2_245', 'rearwingmoving_top_249', 'rearwingmoving_top_SUB0_247', 'rearwingmoving_top_SUB1_248', 'rearwingmoving_top003_250', 'rearwingmoving_top004_251', 'rearwing_top005_254', 'rearwing_top006_SUB1_253', 'rearwing_top006_154', 'rearwing_top006_SUB4_153'],
        name: 'Rear Wing & DRS', region: 'REAR AERO', position: [0, 0.7, -2.1], explodeDir: [0, 2, -4], description: 'Provides massive aerodynamic downforce for rear traction.'
    },
    {
        id: 'diffuser',
        nodeNames: ['diffuser_bm001_21', 'diffuser_bm003_209'],
        name: 'Rear Diffuser', region: 'UNDERBODY', position: [0, 0.1, -2.2], explodeDir: [0, -1, -3], description: 'Expands the airflow exiting the Venturi floor, recovering pressure.'
    },
    {
        id: 'floor',
        nodeNames: ['W14A_234', 'floor_damage_l005_210', 'floor_damage_l006_211', 'floor_damage_l008_212', 'floor_damage_l009_213', 'floor_damage_r005_214', 'floor_damage_r006_215', 'floor_damage_r007_216', 'floor_damage_r008_217', 'floor_damage_r009_218'],
        name: 'Venturi Floor', region: 'UNDERBODY', position: [0.6, 0.05, -0.2], explodeDir: [0, -2, 0], description: 'Features deep underbody tunnels to accelerate airflow.'
    },
    {
        id: 'halo',
        nodeNames: ['hal_8', 'hal001_31'],
        name: 'Halo Protection', region: 'COCKPIT', position: [0, 0.55, 0], explodeDir: [0, 3, 0], description: 'An aerospace-grade titanium structure capable of withstanding extreme impacts.'
    },
    {
        id: 'mirrors',
        nodeNames: ['wing_mirror_l003_10', 'wing_mirror_l005_88', 'MIRRORL_83', 'wing_mirror_r003_94', 'MIRRORR_89'],
        name: 'Aero Rearview Mirrors', region: 'COCKPIT', position: [0.4, 0.55, 0.4], explodeDir: [2, 1, 0], description: 'Sculpted aerodynamic devices designed to direct turbulent wake away from the helmet.'
    },
    {
        id: 'sidepods',
        nodeNames: ['sidepod_fl001_222', 'sidepod_fl002_223', 'sidepod_fl003_224', 'sidepod_fl004_225', 'sidepod_fl005_226', 'sidepod_fl006_227', 'sidepod_fr003_228', 'sidepod_fr004_229', 'sidepod_fr005_230'],
        name: 'Sidepod Radiators', region: 'COOLING', position: [0.6, 0.3, 0.1], explodeDir: [3, 0, 0], description: 'Sculpted to aggressively channel turbulent wake from the front tires backward.'
    },
    {
        id: 'airbox',
        nodeNames: ['topcanopy_bm005_231', 'topcanopy_bm006_232', 'topcanopy_bm007_233'],
        name: 'Airbox / Roll Hoop', region: 'COOLING', position: [0, 0.85, -0.4], explodeDir: [0, 4, -1], description: 'Ingests ram-air for the internal combustion engine and channels cooling air.'
    },
    {
        id: 'exhaust',
        nodeNames: ['Rain_Lights_152'],
        name: 'Main Tailpipe / Rear', region: 'POWERTRAIN', position: [0, 0.4, -1.8], explodeDir: [0, 1, -2], description: 'Expels high-velocity, high-temperature exhaust gases from the turbocharged V6.'
    },
    {
        id: 'suspension-front',
        nodeNames: ['SUSP_LF_47', 'SUSP_RF_56', 'SUS_WBTOP_FL_165', 'SUS_WBTOP_FR_169', 'SUS_ROD_FL_172', 'SUS_ROD_FR_175', 'SUS_WBBOT_FL_182', 'SUS_WBBOT_FR_189'],
        name: 'Front Suspension', region: 'FRONT AXLE', position: [0.5, 0.25, 1.4], explodeDir: [3, 0, 2], description: 'Carbon-fiber wishbone configuration designed for mechanical grip.'
    },
    {
        id: 'suspension-rear',
        nodeNames: ['SUSP_RR_72', 'SUSP_LR_76', 'susp3_196', 'susp4_203'],
        name: 'Rear Suspension', region: 'REAR AXLE', position: [0.5, 0.3, -1.3], explodeDir: [3, 0, -2], description: 'Complex multi-link rear geometry packaged incredibly tightly.'
    },
    {
        id: 'tire-front',
        nodeNames: ['WHEEL_LF_38', 'WHEEL_RF_62'],
        name: 'Pirelli P-Zero Front', region: 'FRONT AXLE', position: [0.8, 0.3, 1.4], explodeDir: [4, 0, 2], description: '18-inch magnesium alloy wheels wrapped in Pirelli slicks.'
    },
    {
        id: 'tire-rear',
        nodeNames: ['WHEEL_LR_82', 'WHEEL_RR_68'],
        name: 'Pirelli P-Zero Rear', region: 'REAR AXLE', position: [0.8, 0.3, -1.6], explodeDir: [4, 0, -2], description: 'Significantly wider than the front tires to handle massive horsepower.'
    }
];

function CarScene({ activePart, setActivePart, explosionProgress }: {
    activePart: string | null,
    setActivePart: (id: string | null) => void,
    explosionProgress: SpringValue<number>
}) {
    const { nodes, scene } = useGLTF('/f1_car.glb') as unknown as {
        nodes: Record<string, import('three').Object3D>,
        scene: import('three').Group
    };

    // 🚨 FIX 1: Animate meshes entirely in-place to preserve their original 3D transformations
    useFrame(() => {
        const val = explosionProgress.get();

        CAR_PARTS.forEach((part) => {
            part.nodeNames.forEach((nodeName) => {
                const node = nodes[nodeName];
                if (node) {
                    // Save the exact original socket position from Blender once
                    if (!node.userData.origLocalPos) {
                        node.userData.origLocalPos = node.position.clone();
                    }

                    // Start from that exact original position
                    node.position.copy(node.userData.origLocalPos);

                    // Add the explosion direction offset directly to the local coordinate!
                    node.position.x += part.explodeDir[0] * val;
                    node.position.y += part.explodeDir[1] * val;
                    node.position.z += part.explodeDir[2] * val;
                }
            });
        });
    });

    return (
        <group scale={CAR_SCALE}>
            {/* The Full Car renders here as one solid, unbroken piece with its native hierarchy completely intact! */}
            <primitive object={scene} />

            {/* 🚨 FIX 2: Map through parts STRICTLY to position the UI Dots. No 3D meshes exist in this loop anymore! */}
            {CAR_PARTS.map((part) => (
                <a.group
                    key={part.id}
                    position={explosionProgress.to((val: number) => [
                        part.explodeDir[0] * val,
                        part.explodeDir[1] * val,
                        part.explodeDir[2] * val,
                    ]) as unknown as [number, number, number]}
                >
                    <Html position={part.position as [number, number, number]}>
                        <div
                            className="relative cursor-pointer group flex items-center"
                            onClick={() => setActivePart(activePart === part.id ? null : part.id)}
                        >
                            <div className={`absolute -left-3 -top-3 w-6 h-6 rounded-full border-[2px] transition-all duration-300 flex items-center justify-center z-10 ${activePart === part.id ? 'bg-cyan-500/20 border-cyan-400 scale-125 shadow-[0_0_20px_rgba(34,211,238,0.6)]' : 'bg-black/90 border-cyan-500/60 group-hover:bg-cyan-950/80 group-hover:border-cyan-400 group-hover:scale-110'}`}>
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activePart === part.id ? 'bg-cyan-300 shadow-[0_0_10px_#67e8f9]' : 'bg-cyan-400'}`} />
                            </div>
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 pointer-events-none ${activePart === part.id ? 'opacity-100 translate-x-0' : 'opacity-80 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                <div className={`w-8 h-[2px] shadow-lg ${activePart === part.id ? 'bg-cyan-400' : 'bg-slate-400 group-hover:bg-cyan-400'}`} />
                                <div className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap backdrop-blur-md transition-all duration-300 ${activePart === part.id ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'bg-[#05080f]/95 text-slate-200 border border-slate-600/80 shadow-[0_4px_15px_rgba(0,0,0,0.9)] group-hover:text-cyan-300 group-hover:border-cyan-500/50 group-hover:bg-slate-900'}`}>
                                    {part.name}
                                </div>
                            </div>
                        </div>
                    </Html>
                </a.group>
            ))}
        </group>
    );
}

export default function F1CarViewer() {
    const [activePart, setActivePart] = useState<string | null>(null);
    const [explodeValue, setExplodeValue] = useState(0);
    const activeData = CAR_PARTS.find(p => p.id === activePart);

    const { explosionProgress } = useSpring({
        explosionProgress: explodeValue,
        config: { mass: 1, tension: 120, friction: 14 }
    });

    return (
        <div className="w-full bg-[#0a0f18] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] font-sans">
            <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-950">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <h3 className="text-white font-black uppercase tracking-[0.2em] text-lg drop-shadow-md">Technical Telemetry</h3>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded border border-slate-700/50 shadow-inner">
                    <span className="text-cyan-500 text-[10px] font-bold uppercase tracking-[0.2em]">Exploded View</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={explodeValue}
                        onChange={(e) => setExplodeValue(parseFloat(e.target.value))}
                        className="w-32 accent-cyan-500 cursor-pointer"
                    />
                </div>
            </div>

            <div className="relative w-full flex-grow bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f18] to-black">
                {activeData && (
                    <div className="absolute top-6 left-6 z-10 w-[380px] bg-slate-950/80 backdrop-blur-xl p-6 rounded-xl border border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.8)] pointer-events-none transition-all duration-500 ease-out animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                            <h4 className="text-cyan-400 font-black uppercase text-xl tracking-wide drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                                {activeData.name}
                            </h4>
                            <span className="text-slate-400 text-[10px] uppercase font-mono tracking-widest bg-black/50 px-2 py-0.5 rounded border border-slate-700">
                                {activeData.region}
                            </span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed font-medium">
                            {activeData.description}
                        </p>
                        <div className="mt-5 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                            <span>Coord: [ {activeData.position.map(n => n.toFixed(2)).join(', ')} ]</span>
                            <span className="text-cyan-500/70">Sys. Online</span>
                        </div>
                    </div>
                )}

                <Canvas camera={{ position: [15, 6, 18], fov: 45 }} gl={{ toneMappingExposure: 2.5 }}>
                    <ambientLight intensity={3} />
                    <hemisphereLight args={['#ffffff', '#444444', 2]} />
                    <directionalLight position={[10, 10, 10]} intensity={5} castShadow />
                    <directionalLight position={[-10, 10, -10]} intensity={4} />
                    <directionalLight position={[0, 15, 0]} intensity={4} />
                    <directionalLight position={[0, -5, 0]} intensity={3} />
                    <Environment preset="city" />

                    <Suspense fallback={
                        <Html center>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                <div className="text-cyan-500 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
                                    Initializing 3D Mesh...
                                </div>
                            </div>
                        </Html>
                    }>
                        <Center>
                            <CarScene
                                activePart={activePart}
                                setActivePart={setActivePart}
                                explosionProgress={explosionProgress}
                            />
                        </Center>
                    </Suspense>

                    <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={CAR_SCALE * 15} blur={2.5} far={4} color="#000000" />
                    <OrbitControls
                        enablePan={false}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2 + 0.1}
                        minDistance={5}
                        maxDistance={100}
                        autoRotate={!activePart && explodeValue === 0}
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </div>

            <div className="p-3 bg-slate-950 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em] font-mono border-t border-slate-800/80">
                <span className="text-cyan-500/70">SYS.RDY</span> • Drag to orbit • Scroll to scale • Select nodes for telemetry
            </div>
        </div>
    );
}