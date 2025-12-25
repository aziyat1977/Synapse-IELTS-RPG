import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';

const LandingScreen = () => {
    const { setGameState } = useGameStore();
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Generate random particles for background
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 2,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-synapse-darker via-synapse-dark to-synapse-darker flex items-center justify-center">
            {/* Animated Background Particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-synapse-purple/20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 3 + particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: particle.delay,
                    }}
                />
            ))}

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="text-7xl md:text-9xl font-black mb-4 glow-text tracking-wider">
                        SYNAPSE
                    </h1>
                    <h2 className="text-2xl md:text-4xl text-synapse-cyan mb-2 font-light tracking-widest">
                        THE IELTS RPG
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl mb-12 font-light">
                        Reverse-engineer your gaps. Slay your demons. Master the system.
                    </p>
                </motion.div>

                {/* Neural Circuit Animation */}
                <motion.div
                    className="my-12 flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                >
                    <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="8"
                            fill="#8b5cf6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                            cx="150"
                            cy="50"
                            r="8"
                            fill="#06b6d4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                        <motion.path
                            d="M 50 50 Q 100 20, 150 50"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </svg>
                </motion.div>

                {/* World Map Button */}
                <motion.button
                    onClick={() => setGameState('world-map')}
                    className="relative group px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl mb-4 block mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <span className="relative z-10 tracking-wide">ENTER NEURAL MAP</span>
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40" />
                </motion.button>

                {/* CTA Button */}
                <motion.button
                    onClick={() => setGameState('diagnostic')}
                    className="relative group px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-synapse-purple to-synapse-blue rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-synapse-cyan to-synapse-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <span className="relative z-10 tracking-wide">BEGIN DIAGNOSTIC RAID</span>

                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-synapse-cyan" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-synapse-cyan" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-synapse-cyan" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-synapse-cyan" />
                </motion.button>

                {/* Shop Button */}
                <motion.button
                    onClick={() => setGameState('shop')}
                    className="mt-4 px-8 py-3 text-lg font-semibold text-cyan-400 border-2 border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                >
                    🛍️ SYNAPSE BAZAAR
                </motion.button>

                {/* Stats Preview */}
                <motion.div
                    className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    {[
                        { label: 'Neural Voids Tracked', value: '4 Domains' },
                        { label: 'Combat Reflex', value: '3.0s' },
                        { label: 'Mastery Algorithm', value: 'Active' },
                    ].map((stat, idx) => (
                        <div key={idx} className="rpg-border bg-synapse-dark/50 p-4 backdrop-blur-sm">
                            <div className="text-synapse-gold text-2xl font-bold font-['Orbitron']">
                                {stat.value}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="mt-12 text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    Powered by GPT-4o-mini × Whisper API × <span className="text-synapse-purple">Cognitive Science</span>
                </motion.p>
            </div>
        </div>
    );
};

export default LandingScreen;
