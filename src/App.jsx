import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, Float, Environment, ContactShadows, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Model as Gun } from './Gun';

function App() {
  const [isInspecting, setInspecting] = useState(false);
  
  // --- ЗВУКОВАЯ СИСТЕМА ---
  const audioRef = useRef(null); // Ссылка на фоновую музыку
  const clickSfx = useRef(null); // Ссылка на звук клика

  // Функция для проигрывания клика
  const playClick = () => {
    if (clickSfx.current) {
      clickSfx.current.currentTime = 0; // Перемотать в начало
      clickSfx.current.play().catch(() => {}); // Игнорировать ошибки, если браузер блокирует
    }
  };

  // Запуск фоновой музыки при первом взаимодействии
  const startAmbience = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Тихая громкость (30%)
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    // ФИКС ПРОКРУТКИ: fixed inset-0
    <div 
      onClick={() => { startAmbience(); }} // Любой клик включает атмосферу
      className="fixed inset-0 w-full h-full bg-black overflow-hidden overscroll-none touch-none font-sans select-none"
    >
      
      {/* АУДИО ЭЛЕМЕНТЫ (Невидимые) */}
      <audio ref={audioRef} loop src="./bg.mp3" /> 
      <audio ref={clickSfx} src="./click.mp3" />

      {/* --- UI СЛОЙ --- */}
      <div className={`absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12 transition-all duration-700 ${isInspecting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
        
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-white mb-2 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
              APEX <span className="text-red-600">ARMORY</span>
            </h1>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                <div className="text-xs font-mono text-gray-400 tracking-[0.3em]">AVAILABLE NOW</div>
            </div>
          </div>
        </header>

        <div className="pointer-events-auto max-w-md">
            <h2 className="text-4xl text-white font-bold mb-2">TOMMY GUN</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
               Click on the weapon for a detailed inspection.
            </p>
            
            <button 
               onClick={(e) => { 
                 e.stopPropagation(); // Чтобы не триггерить клик по фону
                 setInspecting(true); 
                 playClick(); 
               }}
               className="px-10 py-4 bg-red-600 text-black font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
               Осмотреть (Inspect)
            </button>
        </div>
      </div>

      {/* КНОПКА НАЗАД */}
      {isInspecting && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-bounce">
           <button 
             onClick={(e) => { 
                e.stopPropagation();
                setInspecting(false); 
                playClick(); 
             }}
             className="text-white text-xs font-mono border border-white/30 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all bg-black/50 backdrop-blur cursor-pointer"
           >
             EXIT INSPECTION MODE [ESC]
           </button>
        </div>
      )}

      {/* --- 3D СЦЕНА --- */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        /* near: 0.1 — чтобы камеру не "слепило", если подлететь в упор 
         far: 1000 — чтобы дальние части не исчезали
        */
        camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 1000 }} 
        gl={{ antialias: false }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 20]} />

        <SpotLight position={[5, 0, -5]} angle={0.4} penumbra={1} intensity={30} color="#ff0000" distance={15} />
        <SpotLight position={[-5, 0, -5]} angle={0.4} penumbra={1} intensity={30} color="#ff0000" distance={15} />
        <SpotLight position={[0, 5, 2]} angle={0.5} penumbra={1} intensity={10} color="#cceeff" castShadow />
        
        <Environment preset="city" />

        <PresentationControls 
          enabled={true}
          global 
          config={{ mass: 2, tension: 500 }} 
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, -Math.PI / 4, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
        >
            <Float 
              rotationIntensity={isInspecting ? 0 : 0.2} 
              floatIntensity={isInspecting ? 0 : 0.5} 
              speed={2}
            >
              <group onClick={() => { setInspecting(!isInspecting); playClick(); }}>
                 <Gun 
                    scale={isInspecting ? 4.5 : 2.5} 
                    position={isInspecting ? [0, 0, 0] : [0, -1, 0]}
                 />
              </group>
            </Float>
        </PresentationControls>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.7} scale={20} blur={2.5} far={4} color="red" />

        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} radius={0.5} />
            <Noise opacity={0.06} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

      </Canvas>
    </div>
  );
}

export default App;