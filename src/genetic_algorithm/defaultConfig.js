export const DEFAULT_CONFIG = Object.freeze({
    termination: {
        maxGenerations: 200,
        targetFitness: 0.98,
    },
    population: {
        size: 100,
        initializer: undefined,
    },
    fitness: {
        fitnessFunction: undefined,
    },
    selection: {
        operator: undefined,
    },
    crossover: {
        operator: undefined,
        probability: 0.8,
    },
    mutation: {
        operator: undefined,
        probability: 0.05,
    },
});
