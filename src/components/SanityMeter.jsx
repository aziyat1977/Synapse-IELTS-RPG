import { useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

const SanityMeter = () => {
    const sanityTime = useGameStore((state) => state.sanityTime);
    const maxSanityTime = useGameStore((state) => state.maxSanityTime);
    const isGameLocked = useGameStore((state) => state.isGameLocked);
    const decrementSanityTime = useGameStore((state) => state.decrementSanityTime);
    const initializeSanityTimer = useGameStore((state) => state.initializeSanityTimer);

    // Initialize timer on mount
    useEffect(() => {
        initializeSanityTimer();
    }, [initializeSanityTimer]);

    // Countdown timer
    useEffect(() => {
        if (isGameLocked) return;

        const timer = setInterval(() => {
            decrementSanityTime();
        }, 1000);

        return () => clearInterval(timer);
    }, [decrementSanityTime, isGameLocked]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate percentage for visual bar
    const percentage = (sanityTime / maxSanityTime) * 100;

    // Color based on remaining time
    const getBarColor = () => {
        if (percentage > 50) return 'from-cyan-500 to-blue-500';
        if (percentage > 25) return 'from-yellow-500 to-orange-500';
        return 'from-red-600 to-red-800';
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 min-w-[200px] shadow-2xl"
            >
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="relative">
                        <svg
                            className="w-8 h-8 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {isGameLocked && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                            />
                        )}
                    </div>

                    {/* Timer Display */}
                    <div className="flex-1">
                        <div className="text-xs text-cyan-400 font-semibold mb-1">
                            SANITY METER
                        </div>
                        <div className={`text-lg font-bold ${isGameLocked ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(sanityTime)}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${getBarColor()}`}
                        initial={{ width: '100%' }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Status Text */}
                <div className="mt-2 text-xs text-center">
                    {isGameLocked ? (
                        <span className="text-red-400 font-semibold">
                            🔒 TIME TO REST, WARRIOR
                        </span>
                    ) : percentage < 25 ? (
                        <span className="text-yellow-400">
                            ⚠️ Sanity running low...
                        </span>
                    ) : (
                        <span className="text-gray-400">
                            Daily limit: 2 hours
                        </span>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SanityMeter;
