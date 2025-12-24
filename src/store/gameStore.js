import { create } from 'zustand';

const useGameStore = create((set, get) => ({
    // Player State
    player: {
        id: null,
        name: '',
        band: 0,
        xp: 0,
        level: 1,
        sanityMeter: 100,
        archetype: null,
    },

    // Game State
    gameState: 'landing', // 'landing', 'diagnostic', 'combat', 'analysis', 'shop'
    currentEnemy: null,
    recordedAudio: null,
    analysisResults: null,

    // Recording State
    isRecording: false,
    recordingTime: 0,
    maxRecordingTime: 30,

    // Combat State
    combatActive: false,
    currentQuestion: null,
    timeRemaining: 3,
    masteryScore: 0,

    // UI State
    showModal: false,
    modalContent: null,

    // Actions
    setPlayer: (player) => set({ player: { ...get().player, ...player } }),

    setGameState: (state) => set({ gameState: state }),

    startRecording: () => set({ isRecording: true, recordingTime: 0 }),

    stopRecording: (audioBlob) => set({
        isRecording: false,
        recordedAudio: audioBlob,
        gameState: 'analysis'
    }),

    updateRecordingTime: (time) => set({ recordingTime: time }),

    setAnalysisResults: (results) => set({
        analysisResults: results,
        currentEnemy: results.enemy
    }),

    startCombat: (question) => set({
        combatActive: true,
        currentQuestion: question,
        timeRemaining: 3,
        gameState: 'combat'
    }),

    submitAnswer: (answer, complexity) => {
        const startTime = Date.now();
        const { currentQuestion, timeRemaining } = get();
        const responseTime = 3 - timeRemaining;
        const accuracy = answer === currentQuestion.correctAnswer ? 1 : 0;

        // Mastery Score Formula: (Accuracy × (TimeLimit - ResponseTime)) / Complexity
        const masteryScore = (accuracy * (3 - responseTime)) / complexity;

        set({
            masteryScore,
            combatActive: false,
            player: {
                ...get().player,
                xp: get().player.xp + (masteryScore * 100)
            }
        });

        return masteryScore;
    },

    decrementTime: () => {
        const current = get().timeRemaining;
        if (current > 0) {
            set({ timeRemaining: current - 0.1 });
        } else {
            set({ combatActive: false, masteryScore: 0 });
        }
    },

    openModal: (content) => set({ showModal: true, modalContent: content }),
    closeModal: () => set({ showModal: false, modalContent: null }),

    resetGame: () => set({
        gameState: 'landing',
        currentEnemy: null,
        recordedAudio: null,
        analysisResults: null,
        isRecording: false,
        recordingTime: 0,
        combatActive: false,
    }),
}));

export default useGameStore;
