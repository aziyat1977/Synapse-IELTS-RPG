import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

// Mock AI Analysis Service
const analyzeAudio = async (audioBlob) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis results
    const mockErrors = [
        {
            type: 'Tense Error',
            category: 'Past Simple',
            example: 'I go to school yesterday',
            correction: 'I went to school yesterday',
            severity: 'high'
        },
        {
            type: 'Article Missing',
            category: 'Determiners',
            example: 'He is doctor',
            correction: 'He is a doctor',
            severity: 'medium'
        },
        {
            type: 'Subject-Verb Agreement',
            category: 'Grammar',
            example: 'She don\'t like coffee',
            correction: 'She doesn\'t like coffee',
            severity: 'high'
        }
    ];

    const randomError = mockErrors[Math.floor(Math.random() * mockErrors.length)];

    return {
        bandEstimate: 5.5 + Math.random() * 2,
        errors: [randomError],
        enemy: generateEnemy(randomError),
        gapGraph: {
            vocabulary: 60 + Math.random() * 30,
            syntax: 50 + Math.random() * 40,
            phonetics: 70 + Math.random() * 20,
            coherence: 65 + Math.random() * 25,
        }
    };
};

const generateEnemy = (error) => {
    const enemies = {
        'Tense Error': {
            name: 'The Chronos Wraith',
            type: 'Syntax Demon',
            description: 'A phantom that distorts the flow of time in your sentences',
            weakness: 'Past Perfect Tense',
            hp: 100,
            image: '⏰',
            color: 'from-purple-600 to-pink-600'
        },
        'Article Missing': {
            name: 'The Void Specter',
            type: 'Grammar Demon',
            description: 'An entity that devours determiners from your speech',
            weakness: 'Definite Articles',
            hp: 80,
            image: '👻',
            color: 'from-blue-600 to-cyan-600'
        },
        'Subject-Verb Agreement': {
            name: 'The Discord Fiend',
            type: 'Syntax Demon',
            description: 'A creature that breaks harmony between subjects and verbs',
            weakness: 'Third Person Singular',
            hp: 90,
            image: '😈',
            color: 'from-red-600 to-orange-600'
        }
    };

    return enemies[error.type] || enemies['Tense Error'];
};

const GapAnalysis = () => {
    const { recordedAudio, setAnalysisResults, setGameState } = useGameStore();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState(null);

    useEffect(() => {
        const analyze = async () => {
            if (recordedAudio) {
                const analysisResults = await analyzeAudio(recordedAudio);
                setResults(analysisResults);
                setAnalysisResults(analysisResults);
                setLoading(false);
            }
        };
        analyze();
    }, [recordedAudio]);

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
                    {results.errors.map((error, idx) => (
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
                    ))}
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
