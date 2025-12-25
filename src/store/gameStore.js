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
        tier: 'Initiate', // 'Initiate', 'Gladiator'
        freezeStreak: 0
    },

    // Game State
    gameState: 'landing',
    currentEnemy: null,
    recordedAudio: null,
    analysisResults: null,

    // Recording State
    isRecording: false,
    recordingTime: 0,
    maxRecordingTime: 30,

    // Combat State
    combatActive: false,
    combatQueue: [],
    currentQuestionIndex: 0,
    currentQuestion: null,
    timeRemaining: 3,
    masteryScore: 0,
    totalDamageDealt: 0,
    combatStartTime: 0, // For latency check
    isCheater: false,   // Anti-Cheat Flag

    // World Map / Quest State
    quests: [],
    worldMapStatus: 'locked',
    isUploading: false,

    // UI State
    showModal: false,
    modalContent: null,

    // Sanity Meter State
    sanityTime: 7200,
    maxSanityTime: 7200,
    gameStartTime: null,
    isGameLocked: false,
    showSunsetAnimation: false,

    // Shop/Inventory State
    inventory: [],
    currency: 50000,

    // Actions
    setPlayer: (player) => set({ player: { ...get().player, ...player } }),

    setGameState: (state) => set({ gameState: state }),

    startRecording: () => set({ isRecording: true, recordingTime: 0 }),

    stopRecording: (audioBlob) => set({
        isRecording: false,
        recordedAudio: audioBlob,
        gameState: 'analysis'
    }),

    updateRecordingTime: (updater) => {
        const currentTime = get().recordingTime;
        const newTime = typeof updater === 'function' ? updater(currentTime) : updater;
        set({ recordingTime: newTime });
    },

    setAnalysisResults: (results) => set({
        analysisResults: results,
        currentEnemy: results.enemy
    }),

    startCombat: (questionOverride = null) => {
        let questions = [];
        if (questionOverride) {
            questions = [questionOverride];
        } else {
            const { analysisResults } = get();
            questions = analysisResults?.questions || [];
        }

        if (questions.length === 0) {
            console.warn("No questions found for combat");
            return;
        }

        set({
            combatActive: true,
            combatQueue: questions,
            currentQuestionIndex: 0,
            currentQuestion: questions[0] || null,
            timeRemaining: 3,
            gameState: 'combat',
            totalDamageDealt: 0,
            combatStartTime: Date.now() // Start timer for anti-cheat
        });
    },

    submitAnswer: (answer) => {
        const { currentQuestion, timeRemaining, combatStartTime, isCheater } = get();
        if (!currentQuestion) return 0;

        const now = Date.now();
        const reactionTimeMs = now - combatStartTime;

        // Anti-Fraud Shield
        if (reactionTimeMs < 500) {
            console.warn("Suspicious activity detected: Superhuman reaction.");
            set({ isCheater: true });
        }

        const isInvincible = isCheater || reactionTimeMs < 500;

        const responseTime = 3 - timeRemaining;
        const accuracy = answer === currentQuestion.correctAnswer ? 1 : 0;
        const complexity = currentQuestion.complexity || 6.0;

        // If cheater, damage is ALWAYS 0
        let rawScore = (accuracy * (3 - Math.max(0, responseTime)));
        if (isInvincible) rawScore = 0;

        const damage = Math.round((rawScore / (complexity / 5)) * 100 * 3);

        set({
            masteryScore: rawScore,
            combatActive: false,
            totalDamageDealt: get().totalDamageDealt + damage,
            player: {
                ...get().player,
                xp: get().player.xp + damage
            }
        });

        // Reset timer for next question handled in nextQuestion
        return damage;
    },

    submitVoiceAttack: async (audioBlob) => {
        const { currentQuestion, player } = get();
        if (!currentQuestion) return null;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice_attack.webm');
        formData.append('prompt', currentQuestion.prompt);

        try {
            const response = await fetch('http://localhost:8000/api/combat-voice', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Voice Attack Failed');

            const result = await response.json();
            // result = { damage, isCritical, feedback, recoilType }

            // Apply Damage
            set({
                masteryScore: result.damage / 100, // Normalized
                combatActive: false,
                totalDamageDealt: get().totalDamageDealt + result.damage,
                player: {
                    ...get().player,
                    xp: get().player.xp + result.damage
                }
            });

            // Sanity Penalty / Cognitive Load Logic
            // If damage is low (bad English), Sanity takes a hit
            if (result.damage < 40) {
                const currentSanity = get().sanityTime;
                // Penalty: Lose 5 minutes of sanity for poor speech
                const penalty = 300;
                set({ sanityTime: Math.max(0, currentSanity - penalty) });
                console.log("Cognitive Overload: Sanity Penalty Applied");
            }

            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    nextQuestion: () => {
        const { combatQueue, currentQuestionIndex } = get();
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < combatQueue.length) {
            set({
                currentQuestionIndex: nextIndex,
                currentQuestion: combatQueue[nextIndex],
                combatActive: true,
                timeRemaining: 3,
                masteryScore: 0,
                combatStartTime: Date.now()
            });
            return true;
        } else {
            const { quests } = get();
            if (quests.length > 0) {
                set({ gameState: 'world-map', combatActive: false });
            } else {
                set({ gameState: 'landing', combatActive: false });
            }
            return false;
        }
    },

    decrementTime: () => {
        const current = get().timeRemaining;
        if (current > 0) {
            set({ timeRemaining: current - 0.1 });
        } else {
            set({ combatActive: false, masteryScore: 0 });
        }
    },

    // World Map Actions
    setQuests: (quests) => set({
        quests: quests,
        worldMapStatus: 'unlocked',
        gameState: 'world-map'
    }),

    uploadPDF: async (file) => {
        set({ isUploading: true });
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/refine-content', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const quests = await response.json();

            set({
                quests: quests,
                worldMapStatus: 'unlocked',
                gameState: 'world-map',
                isUploading: false
            });

            return true;
        } catch (e) {
            console.error(e);
            set({ isUploading: false });
            return false;
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
        combatQueue: [],
        currentQuestion: null,
        totalDamageDealt: 0,
        isCheater: false
    }),

    // Sanity Meter & Persistence
    initializeSanityTimer: () => {
        const savedState = localStorage.getItem('synapse_save_v1');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);

                const lastLogin = parsed.lastLogin || Date.now();
                const now = Date.now();
                const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60);

                let newSanityTime = parsed.sanityTime;

                if (hoursSinceLogin >= 24) {
                    console.log("Deep Sleep Cycle Complete. Sanity Restored.");
                    newSanityTime = 7200;
                }

                set({
                    player: { ...get().player, ...parsed.player },
                    quests: parsed.quests || [],
                    inventory: parsed.inventory || [],
                    currency: parsed.currency || 50000,
                    sanityTime: newSanityTime,
                    gameStartTime: now,
                    worldMapStatus: parsed.worldMapStatus || 'locked',
                    isGameLocked: newSanityTime <= 0,
                    showSunsetAnimation: newSanityTime <= 0
                });
            } catch (e) {
                console.error("Save corrupted", e);
                set({ gameStartTime: Date.now() });
            }
        } else {
            set({ gameStartTime: Date.now() });
        }
    },

    decrementSanityTime: () => {
        const { sanityTime } = get();
        if (sanityTime > 0) {
            const newTime = sanityTime - 1;
            set({ sanityTime: newTime });

            if (newTime === 0) {
                set({ showSunsetAnimation: true, isGameLocked: true });
            }
        }
    },

    extendSanity: (hours) => {
        const { sanityTime, maxSanityTime } = get();
        const extension = hours * 3600;
        const newTime = Math.min(sanityTime + extension, maxSanityTime);
        set({
            sanityTime: newTime,
            isGameLocked: false,
            showSunsetAnimation: false
        });
    },

    restoreSanityFull: () => {
        set({ sanityTime: 7200, isGameLocked: false, showSunsetAnimation: false });
    },

    closeSunsetAnimation: () => set({ showSunsetAnimation: false }),
    unlockGame: () => set({ isGameLocked: false }),

    // Shop / Silk Road Actions
    purchaseItem: (item) => {
        const { currency, inventory } = get();
        if (currency >= item.price) {
            set({
                currency: currency - item.price,
                inventory: [...inventory, item]
            });
            // Apply immediate effects if any
            if (item.id === 'sanity_potion') get().restoreSanityFull();
            if (item.id === 'battle_pass') set({ player: { ...get().player, tier: 'Gladiator' } });

            return true;
        }
        return false;
    },
}));

// Auto-save subscription
useGameStore.subscribe((state) => {
    const saveState = {
        player: state.player,
        quests: state.quests,
        inventory: state.inventory,
        currency: state.currency,
        sanityTime: state.sanityTime,
        worldMapStatus: state.worldMapStatus,
        lastLogin: Date.now()
    };
    localStorage.setItem('synapse_save_v1', JSON.stringify(saveState));
});

export default useGameStore;
