export const AI_DIFFICULTY = Object.freeze({
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
});

export const DIFFICULTY_CONFIG = Object.freeze({
    easy: {
        usePartnerAwareness: false,
        useCardMemory: false,
        useVoidInference: false,
        simulations: 0,
    },
    medium: {
        usePartnerAwareness: true,
        useCardMemory: true,
        useVoidInference: true,
        simulations: 0,
    },
    hard: {
        usePartnerAwareness: true,
        useCardMemory: true,
        useVoidInference: true,
        simulations: 1500,
    },
});
