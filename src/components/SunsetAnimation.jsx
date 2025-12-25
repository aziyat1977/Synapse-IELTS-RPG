import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';

const SunsetAnimation = () => {
    const showSunsetAnimation = useGameStore((state) => state.showSunsetAnimation);
    const closeSunsetAnimation = useGameStore((state) => state.closeSunsetAnimation);

    return (
        <AnimatePresence>
            {showSunsetAnimation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
                >
                    {/* Gradient Background - Day to Night */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{
                            background: 'linear-gradient(to bottom, #87CEEB 0%, #FFB347 50%, #FF6B6B 100%)'
                        }}
                        animate={{
                            background: [
                                'linear-gradient(to bottom, #87CEEB 0%, #FFB347 50%, #FF6B6B 100%)', // Day
                                'linear-gradient(to bottom, #FF6B6B 0%, #8B4789 50%, #2C1B47 100%)', // Golden Hour
                                'linear-gradient(to bottom, #1a0933 0%, #0a0118 50%, #000000 100%)'  // Night
                            ]
                        }}
                        transition={{ duration: 3, times: [0, 0.5, 1] }}
                    />

                    {/* Floating Particles */}
                    <div className="absolute inset-0">
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white/30 rounded-full"
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: window.innerHeight + 20,
                                    opacity: 0
                                }}
                                animate={{
                                    y: -20,
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1.5, 0.5]
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    delay: Math.random() * 2,
                                    repeat: Infinity
                                }}
                            />
                        ))}
                    </div>

                    {/* Sun/Moon Transition */}
                    <motion.div
                        className="absolute"
                        initial={{ top: '50%', opacity: 1 }}
                        animate={{
                            top: '120%',
                            opacity: 0
                        }}
                        transition={{ duration: 3 }}
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-2xl shadow-orange-500/50" />
                    </motion.div>

                    {/* Moon Rising */}
                    <motion.div
                        className="absolute"
                        initial={{ top: '-20%', opacity: 0 }}
                        animate={{
                            top: '30%',
                            opacity: 1
                        }}
                        transition={{ duration: 3, delay: 1.5 }}
                    >
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-2xl shadow-blue-300/30" />
                            {/* Moon craters */}
                            <div className="absolute top-4 left-6 w-4 h-4 rounded-full bg-gray-400/30" />
                            <div className="absolute top-8 right-5 w-3 h-3 rounded-full bg-gray-400/20" />
                        </div>
                    </motion.div>

                    {/* Main Message */}
                    <motion.div
                        className="relative z-10 text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                    >
                        <motion.h1
                            className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent"
                            animate={{
                                textShadow: [
                                    '0 0 20px rgba(147, 51, 234, 0.5)',
                                    '0 0 40px rgba(147, 51, 234, 0.8)',
                                    '0 0 20px rgba(147, 51, 234, 0.5)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Time to Rest, Warrior
                        </motion.h1>

                        <p className="text-2xl text-gray-300 mb-8">
                            You've reached your daily 2-hour limit
                        </p>

                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                        >
                            <p className="text-lg text-purple-300">
                                💜 Your neural pathways need recovery
                            </p>
                            <p className="text-sm text-gray-400 mb-6">
                                Return tomorrow, or purchase a Sanity Potion to continue
                            </p>

                            <motion.button
                                onClick={closeSunsetAnimation}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                I Understand
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Stars appearing */}
                    <div className="absolute inset-0">
                        {[...Array(100)].map((_, i) => (
                            <motion.div
                                key={`star-${i}`}
                                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`
                                }}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: [0, 1, 0.5, 1],
                                    scale: [0, 1, 1.5, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    delay: 1.5 + Math.random() * 2,
                                    repeat: Infinity,
                                    repeatDelay: Math.random() * 3
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SunsetAnimation;
