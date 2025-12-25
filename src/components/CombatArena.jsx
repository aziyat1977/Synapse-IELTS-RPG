import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';

const CombatArena = () => {
    const {
        analysisResults,
        combatActive,
        timeRemaining,
        decrementTime,
        submitAnswer,
        submitVoiceAttack,
        setGameState,
        currentQuestion,
        nextQuestion,
        combatQueue,
        currentQuestionIndex,
        totalDamageDealt
    } = useGameStore();

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [roundDamage, setRoundDamage] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceFeedback, setVoiceFeedback] = useState(null); // Feedback from AI

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // Recording Logic
    const startVoiceAttack = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                handleVoiceSubmit(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic Error:", err);
            alert("Microphone access denied!");
        }
    };

    const stopVoiceAttack = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleVoiceSubmit = async (audioBlob) => {
        if (!combatActive) return;

        // Show "Processing" state
        setVoiceFeedback("Analyzing Voice Attack...");

        const result = await submitVoiceAttack(audioBlob);

        if (result) {
            setRoundDamage(result.damage);
            setVoiceFeedback(result.feedback);

            // Show result after a moment
            setShowResult(true);
        } else {
            alert("Voice Attack Fizzled!");
        }
    };

    // Timer Logic
    useEffect(() => {
        let timer;
        // Pause timer while recording to give user time to speak
        if (combatActive && timeRemaining > 0 && currentQuestion && !showResult && !isRecording) {
            timer = setInterval(() => {
                decrementTime();
            }, 100);
        } else if (timeRemaining <= 0 && combatActive && !showResult && !isRecording) {
            handleTimeout();
        }
        return () => clearInterval(timer);
    }, [combatActive, timeRemaining, currentQuestion, showResult, isRecording, decrementTime]); // Added dependency

    const handleTimeout = () => {
        if (!combatActive) return;
        setShowResult(true);
        setRoundDamage(0);
    };

    const handleAnswerSubmit = (answer) => {
        if (!combatActive) return;
        setSelectedAnswer(answer);
        const damage = submitAnswer(answer);
        setRoundDamage(damage);
        setShowResult(true);
    };

    const handleContinue = () => {
        setShowResult(false);
        setSelectedAnswer(null);
        setVoiceFeedback(null);

        const hasNext = nextQuestion();
        if (!hasNext) {
            setGameState('landing');
        }
    };

    if (!analysisResults) return null;

    const { enemy } = analysisResults;
    const maxHP = 300;
    const currentHP = Math.max(0, maxHP - totalDamageDealt);
    const enemyHPPercent = (currentHP / maxHP) * 100;

    const isCriticalHit = roundDamage >= 80;
    const isHit = roundDamage > 0;
    const question = currentQuestion;

    return (
        <div className="min-h-screen bg-gradient-to-br from-synapse-darker via-synapse-dark to-synapse-darker p-4 py-12 overflow-hidden">
            <div className="max-w-5xl mx-auto">
                {/* Enemy Display */}
                <motion.div
                    className={`mb-8 ${showResult && isCriticalHit ? 'combat-hit' : ''}`}
                    animate={showResult && isHit ? { x: [0, -20, 20, -10, 10, 0], y: [0, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <div className={`rpg-border bg-gradient-to-br ${enemy.color} p-8 rounded-2xl relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10 text-center">
                            <motion.div
                                className="text-8xl mb-4"
                                animate={isRecording ? { scale: [1, 1.2, 1] } : (showResult && isHit ? { scale: [1, 0.8, 1.1, 1] } : {})}
                                transition={{ duration: isRecording ? 1 : 0.5, repeat: isRecording ? Infinity : 0 }}
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
                                        className={`h-full ${enemyHPPercent > 50 ? 'bg-green-500' : enemyHPPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${enemyHPPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Voice Feedback Overlay */}
                        <AnimatePresence>
                            {isRecording && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-red-500/30 flex items-center justify-center backdrop-blur-sm"
                                >
                                    <div className="text-center">
                                        <div className="text-4xl font-black text-white animate-pulse mb-2">RECORDING VOICE ATTACK</div>
                                        <div className="text-white">Speak your answer clearly...</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Question Progress */}
                <div className="mb-4 text-center text-synapse-cyan font-bold">
                    ROUND {currentQuestionIndex + 1} / {combatQueue.length || 3}
                </div>

                {/* Combat Interface */}
                {!showResult && question ? (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rpg-border bg-synapse-dark/90 backdrop-blur-sm p-8 rounded-2xl"
                    >
                        {/* Timer */}
                        <div className="text-center mb-8">
                            <motion.div
                                className={`text-7xl font-['Orbitron'] font-black ${timeRemaining < 1 ? 'text-red-500' : 'text-synapse-cyan'}`}
                                animate={timeRemaining < 1 ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                {isRecording ? "MIC ON" : `${timeRemaining.toFixed(1)}s`}
                            </motion.div>
                        </div>

                        {/* Question */}
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold mb-4 text-synapse-purple">Complete the sentence:</h3>
                            <p className="text-3xl font-['Orbitron'] text-white leading-relaxed">
                                {question.prompt}
                            </p>
                        </div>

                        {/* Answer Options & Voice Button */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {question.options.map((option, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleAnswerSubmit(option)}
                                    className="py-4 px-4 bg-synapse-purple/20 hover:bg-synapse-purple/40 border-2 border-synapse-purple/50 rounded-lg font-bold text-xl transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!combatActive || isRecording}
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </div>

                        {/* Voice Attack Button */}
                        <motion.button
                            onMouseDown={startVoiceAttack}
                            onMouseUp={stopVoiceAttack}
                            onTouchStart={startVoiceAttack}
                            onTouchEnd={stopVoiceAttack}
                            className={`w-full py-6 rounded-xl font-black text-2xl uppercase tracking-widest transition-all ${isRecording ? 'bg-red-600 animate-pulse scale-95' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                                } text-white shadow-lg shadow-red-900/50`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isRecording ? 'RELEASE TO ATTACK' : '🎙️ HOLD TO VOICE ATTACK'}
                        </motion.button>

                    </motion.div>
                ) : (
                    /* Result Screen */
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rpg-border bg-synapse-dark/90 backdrop-blur-sm p-8 rounded-2xl text-center"
                    >
                        {/* Voice Feedback Message */}
                        {voiceFeedback && (
                            <div className="mb-6 p-4 bg-blue-900/40 border border-blue-500/50 rounded-xl">
                                <div className="text-xs uppercase text-blue-300 mb-1">Combat Log</div>
                                <div className="text-lg font-bold text-white italic">"{voiceFeedback}"</div>
                            </div>
                        )}

                        {showResult ? (
                            <>
                                {isCriticalHit ? (
                                    <>
                                        <div className="text-9xl mb-4">💥</div>
                                        <h2 className="text-5xl font-black text-yellow-400 glow-text mb-4">CRITICAL HIT!</h2>
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
                                    <div className="text-6xl font-['Orbitron'] font-black text-synapse-gold mb-2">{roundDamage}</div>
                                    <div className="text-xl text-gray-400">Damage Dealt</div>
                                </div>

                                <motion.button
                                    onClick={handleContinue}
                                    className="w-full py-4 bg-gradient-to-r from-synapse-purple to-synapse-blue rounded-lg font-bold text-xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {(currentQuestionIndex < combatQueue.length - 1) ? 'NEXT ROUND →' : 'FINISH BATTLE →'}
                                </motion.button>
                            </>
                        ) : (
                            <div>Loading next round...</div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Critical Hit Particles */}
            <AnimatePresence>
                {showResult && isCriticalHit && Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                        style={{ left: '50%', top: '30%' }}
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
            </AnimatePresence>
        </div>
    );
};

export default CombatArena;
