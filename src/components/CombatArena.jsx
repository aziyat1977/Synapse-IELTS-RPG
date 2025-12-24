import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';

const CombatArena = () => {
    const {
        analysisResults,
        combatActive,
        timeRemaining,
        masteryScore,
        decrementTime,
        submitAnswer,
        setGameState,
    } = useGameStore();

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [damageDealt, setDamageDealt] = useState(0);

    // Mock combat question based on enemy
    const question = {
        prompt: 'He ___ (be) a gladiator for ten years.',
        options: ['was', 'has been', 'is', 'had been'],
        correctAnswer: 'has been',
        complexity: 6.5,
        explanation: 'Present Perfect is used for actions that started in the past and continue to the present.'
    };

    useEffect(() => {
        let timer;
        if (combatActive && timeRemaining > 0) {
            timer = setInterval(() => {
                decrementTime();
            }, 100);
        } else if (timeRemaining <= 0 && combatActive) {
            handleTimeout();
        }
        return () => clearInterval(timer);
    }, [combatActive, timeRemaining]);

    const handleTimeout = () => {
        setShowResult(true);
        setDamageDealt(0);
    };

    const handleAnswerSubmit = (answer) => {
        if (!combatActive) return;

        setSelectedAnswer(answer);
        const score = submitAnswer(answer, question.complexity);

        // Calculate damage based on mastery score
        const damage = Math.round(score * 100);
        setDamageDealt(damage);
        setShowResult(true);
    };

    const handleContinue = () => {
        setShowResult(false);
        setSelectedAnswer(null);
        setGameState('landing');
    };

    if (!analysisResults) return null;

    const { enemy } = analysisResults;
    const enemyHPPercent = Math.max(0, 100 - damageDealt);
    const isCriticalHit = damageDealt >= 80;
    const isHit = damageDealt > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-synapse-darker via-synapse-dark to-synapse-darker p-4 py-12 overflow-hidden">
            <div className="max-w-5xl mx-auto">
                {/* Enemy Display */}
                <motion.div
                    className={`mb-8 ${showResult && isCriticalHit ? 'combat-hit' : ''}`}
                    animate={
                        showResult && isHit
                            ? { x: [0, -20, 20, -10, 10, 0], y: [0, -10, 0] }
                            : {}
                    }
                    transition={{ duration: 0.5 }}
                >
                    <div className={`rpg-border bg-gradient-to-br ${enemy.color} p-8 rounded-2xl relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10 text-center">
                            <motion.div
                                className="text-8xl mb-4"
                                animate={showResult && isHit ? { scale: [1, 0.8, 1.1, 1] } : {}}
                                transition={{ duration: 0.5 }}
                            >
                                {enemy.image}
                            </motion.div>
                            <h2 className="text-4xl font-black mb-2">{enemy.name}</h2>
                            <div className="text-sm text-gray-300 mb-4">{enemy.type}</div>

                            {/* HP Bar */}
                            <div className="max-w-md mx-auto">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>HP</span>
                                    <span>{Math.round(enemyHPPercent)}%</span>
                                </div>
                                <div className="bg-gray-900/50 rounded-full h-6 overflow-hidden border-2 border-white/20">
                                    <motion.div
                                        className={`h-full ${enemyHPPercent > 50 ? 'bg-green-500' : enemyHPPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${enemyHPPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Combat Interface */}
                {!showResult ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rpg-border bg-synapse-dark/90 backdrop-blur-sm p-8 rounded-2xl"
                    >
                        {/* Timer */}
                        <div className="text-center mb-8">
                            <motion.div
                                className={`text-7xl font-['Orbitron'] font-black ${timeRemaining < 1 ? 'text-red-500' : 'text-synapse-cyan'
                                    }`}
                                animate={timeRemaining < 1 ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                {timeRemaining.toFixed(1)}s
                            </motion.div>
                            <div className="text-gray-400 text-sm mt-2">Quick-Time Event Active</div>
                        </div>

                        {/* Question */}
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold mb-4 text-synapse-purple">Complete the sentence:</h3>
                            <p className="text-3xl font-['Orbitron'] text-white leading-relaxed">
                                {question.prompt}
                            </p>
                        </div>

                        {/* Answer Options */}
                        <div className="grid grid-cols-2 gap-4">
                            {question.options.map((option, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleAnswerSubmit(option)}
                                    className="py-6 px-4 bg-synapse-purple/20 hover:bg-synapse-purple/40 border-2 border-synapse-purple/50 rounded-lg font-bold text-xl transition-all"
                                    whileHover={{ scale: 1.05, borderColor: '#8b5cf6' }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!combatActive}
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </div>

                        {/* Hint */}
                        <motion.div
                            className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="text-blue-400 text-sm">
                                💡 <strong>Hint:</strong> Enemy Weakness: {enemy.weakness}
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    /* Result Screen */
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rpg-border bg-synapse-dark/90 backdrop-blur-sm p-8 rounded-2xl text-center"
                    >
                        {isCriticalHit ? (
                            <>
                                <motion.div
                                    className="text-9xl mb-4"
                                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6 }}
                                >
                                    💥
                                </motion.div>
                                <h2 className="text-5xl font-black text-yellow-400 glow-text mb-4">
                                    CRITICAL HIT!
                                </h2>
                            </>
                        ) : isHit ? (
                            <>
                                <div className="text-7xl mb-4">⚔️</div>
                                <h2 className="text-4xl font-black text-green-400 mb-4">HIT!</h2>
                            </>
                        ) : (
                            <>
                                <div className="text-7xl mb-4">❌</div>
                                <h2 className="text-4xl font-black text-red-400 mb-4">MISSED!</h2>
                            </>
                        )}

                        <div className="mb-6">
                            <div className="text-6xl font-['Orbitron'] font-black text-synapse-gold mb-2">
                                {damageDealt}
                            </div>
                            <div className="text-xl text-gray-400">Damage Dealt</div>
                        </div>

                        {/* Mastery Score Breakdown */}
                        <div className="bg-synapse-purple/10 border border-synapse-purple/30 rounded-lg p-6 mb-6 text-left">
                            <h3 className="text-xl font-bold text-synapse-cyan mb-4">Mastery Score Formula:</h3>
                            <code className="text-sm text-gray-300 block mb-4">
                                MasteryScore = (Accuracy × (TimeLimit - ResponseTime)) / Complexity
                            </code>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Accuracy:</span>
                                    <span className="text-white font-mono">{selectedAnswer === question.correctAnswer ? '1' : '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Time Limit:</span>
                                    <span className="text-white font-mono">3.0s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Response Time:</span>
                                    <span className="text-white font-mono">{(3 - timeRemaining).toFixed(2)}s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Complexity (Band):</span>
                                    <span className="text-white font-mono">{question.complexity}</span>
                                </div>
                            </div>
                        </div>

                        {/* Correct Answer */}
                        {selectedAnswer !== question.correctAnswer && (
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                                <div className="text-sm text-gray-400 mb-1">Correct Answer:</div>
                                <div className="text-2xl text-green-400 font-bold">{question.correctAnswer}</div>
                                <div className="text-sm text-gray-300 mt-2">{question.explanation}</div>
                            </div>
                        )}

                        <motion.button
                            onClick={handleContinue}
                            className="w-full py-4 bg-gradient-to-r from-synapse-purple to-synapse-blue rounded-lg font-bold text-xl"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {enemyHPPercent <= 0 ? 'VICTORY! →' : 'CONTINUE TRAINING →'}
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Particle Effects on Critical Hit */}
            <AnimatePresence>
                {showResult && isCriticalHit && (
                    <>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                                style={{
                                    left: '50%',
                                    top: '30%',
                                }}
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: (Math.random() - 0.5) * 400,
                                    y: (Math.random() - 0.5) * 400,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CombatArena;
