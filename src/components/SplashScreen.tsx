import React, { useEffect, useState } from 'react';
import { VOBLogoLarge } from './Logo';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Sequence Timeline
        // Sequence Timeline (6s Total)
        // 0.0s: Blank (Step 0)
        // 0.5s: Logo appears (Step 1)
        // 1.5s: "VOB" text slides in (Step 2)
        // 2.5s: "Mandakaru" text fades in (Step 3)
        // 5.0s: Start exit animation (opacity fade)
        // 6.0s: Finish

        const timers: ReturnType<typeof setTimeout>[] = [];

        timers.push(setTimeout(() => setStep(1), 500));
        timers.push(setTimeout(() => setStep(2), 1500));
        timers.push(setTimeout(() => setStep(3), 2500));

        timers.push(setTimeout(() => {
            setIsExiting(true);
        }, 5000)); // Start exit at 5s

        timers.push(setTimeout(() => {
            onFinish();
        }, 6000)); // Finish at 6s

        return () => timers.forEach(clearTimeout);
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Modern Sertão Background Image */}
                <div
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        // Premium Generated Asset
                        backgroundImage: `url('/bg-premium.png')`,
                        filter: 'brightness(0.7) contrast(1.1)'
                    }}
                />

                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black/40 to-black/70 transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} />

                {/* Antigravity particles (simulated with CSS) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite] transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/20 rounded-full animate-[spin_7s_linear_infinite_reverse] transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">

                {/* Logo Container */}
                <div className={`transform transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${step >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}>
                    <div className="mb-8 transform scale-[2.5]">
                        <VOBLogoLarge animated={true} />
                    </div>
                </div>

                {/* Text Container */}
                <div className="overflow-hidden h-24 flex items-center justify-center gap-4">
                    {/* VOB Text */}
                    <h1 className={`text-6xl md:text-8xl font-bold text-white tracking-tighter font-display transform transition-all duration-700 ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        VOB
                    </h1>

                    {/* Mandakaru Text */}
                    <h1 className={`text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tighter font-display transform transition-all duration-1000 ${step >= 3 ? 'translate-x-0 opacity-100 blur-0' : '-translate-x-10 opacity-0 blur-sm'}`}>
                        Mandakaru
                    </h1>
                </div>

                {/* Progress Line */}
                <div className={`w-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full mt-4 transition-all duration-[2000ms] ease-out ${step >= 3 ? 'w-32 opacity-100' : 'w-0 opacity-0'}`} />

                {/* Version Info */}
                <div className={`mt-8 space-y-2 text-gray-400 text-sm font-light tracking-wide transition-all duration-700 delay-300 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <p>Sistema Jurídico de Alta Performance</p>
                    <p className="opacity-75 text-xs">Versão Mandakaru 2.0</p>
                </div>
            </div>
        </div>
    );
};
