import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';
import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:8000/api/analyze-speech';

const convertBlobToFile = (blob) => {
    return new File([blob], "recording.webm", { type: "audio/webm" });
};

const GapAnalysis = () => {
    const { recordedAudio, setAnalysisResults, setGameState } = useGameStore();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const analyze = async () => {
            if (!recordedAudio) {
                // If accessed without audio, likely testing or error, redirect or show mock
                // For now, redirect to landing
                // setGameState('landing');
                // But specifically for dev flow, maybe we want to allow staying here if we mock it? 
                // Let's assume flow is Landing -> Diagnostic -> GapAnalysis
                return;
            }

            try {
                const formData = new FormData();
                const file = convertBlobToFile(recordedAudio);
                formData.append('audio', file);

                const response = await axios.post(API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const data = response.data;
                setResults(data);
                setAnalysisResults(data);
                setLoading(false);

            } catch (err) {
                console.error("Analysis Error:", err);
                setError("Neural Link Severed. Is the backend running?");
                setLoading(false);
            }
        };

        analyze();
    }, [recordedAudio, setAnalysisResults]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-synapse-darker via-synapse-dark to-synapse-darker flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-20 h-20 border-4 border-synapse-purple border-t-transparent rounded-full mx-auto mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <h2 className="text-3xl font-bold glow-text mb-2">REVERSE ENGINEERING...</h2>
                    <p className="text-gray-400">Analyzing neural pathways and detecting gaps</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-synapse-darker text-red-500">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">CRITICAL SYSTEM FAILURE</h2>
                    <p className="text-xl mb-6">{error}</p>
                    <button
                        onClick={() => setGameState('landing')}
                        className="px-6 py-3 bg-red-900/50 border border-red-500 rounded hover:bg-red-800 transition"
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        );
    }

    if (!results) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-synapse-darker via-synapse-dark to-synapse-darker p-4 py-12">
            <div className="max-w-6xl mx-auto">
                <motion.h1
                    className="text-5xl font-black text-center glow-text mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    GAP ANALYSIS COMPLETE
                </motion.h1>

                {/* Band Estimate */}
                <motion.div
                    className="rpg-border bg-synapse-dark/50 backdrop-blur-sm p-8 rounded-2xl mb-8 text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-6xl font-['Orbitron'] font-black text-synapse-gold mb-2">
                        {results.bandEstimate.toFixed(1)}
                    </div>
                    <div className="text-xl text-gray-400">Current IELTS Band Estimate</div>
                </motion.div>

                {/* Gap Graph */}
                <motion.div
                    className="rpg-border bg-synapse-dark/50 backdrop-blur-sm p-8 rounded-2xl mb-8"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-synapse-cyan mb-6">Neural Void Map</h2>
                    <div className="space-y-4">
                        {Object.entries(results.gapGraph).map(([skill, score], idx) => (
                            <div key={skill}>
                                <div className="flex justify-between mb-2">
                                    <span className="capitalize text-lg">{skill}</span>
                                    <span className="text-synapse-gold font-bold">{Math.round(score)}%</span>
                                </div>
                                <div className="bg-gray-800/50 rounded-full h-4 overflow-hidden">
                                    <motion.div
                                        className={`h-full ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score}%` }}
                                        transition={{ delay: 0.6 + idx * 0.1, duration: 1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Enemy Spawned */}
                <motion.div
                    className={`rpg-border bg-gradient-to-br ${results.enemy.color} p-8 rounded-2xl mb-8 relative overflow-hidden`}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10">
                        <div className="text-center mb-6">
                            <div className="text-7xl mb-4">{results.enemy.image}</div>
                            <h3 className="text-4xl font-black mb-2">{results.enemy.name}</h3>
                            <div className="text-xl text-gray-200 mb-4">{results.enemy.type}</div>
                            <p className="text-gray-300 italic">"{results.enemy.description}"</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <div className="text-sm text-gray-300 mb-1">HP</div>
                                <div className="text-2xl font-bold">{results.enemy.hp}</div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <div className="text-sm text-gray-300 mb-1">Weakness</div>
                                <div className="text-2xl font-bold">{results.enemy.weakness}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Error Details */}
                <motion.div
                    className="rpg-border bg-synapse-dark/50 backdrop-blur-sm p-8 rounded-2xl mb-8"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <h2 className="text-2xl font-bold text-synapse-red mb-6">Detected Errors</h2>
                    {results.errors.length > 0 ? (
                        results.errors.map((error, idx) => (
                            <div key={idx} className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-red-400 font-bold">{error.type}</span>
                                    <span className="text-xs bg-red-500/30 px-2 py-1 rounded">{error.category}</span>
                                </div>
                                <div className="mb-2">
                                    <div className="text-sm text-gray-400 mb-1">Your Speech:</div>
                                    <div className="text-red-300 line-through">"{error.example}"</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Correction:</div>
                                    <div className="text-green-400">"{error.correction}"</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 italic">No significant errors detected. The system has generated advanced training simulations.</div>
                    )}
                </motion.div>

                {/* CTA */}
                <motion.button
                    onClick={() => setGameState('combat')}
                    className="w-full py-6 bg-gradient-to-r from-synapse-purple to-synapse-blue rounded-xl font-bold text-2xl hover:scale-105 transition-transform"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    ENGAGE IN COMBAT →
                </motion.button>
            </div>
        </div>
    );
};

export default GapAnalysis;
