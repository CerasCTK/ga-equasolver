import { RandomPopulationInitializer } from "./population/random-population-initializer.js";
import { TournamentSelection } from "./selection/tournament-selection.js";
import { ArithmeticCrossover } from "./crossover/arithmetic-crossover.js";
import { GaussianMutation } from "./mutation/gaussian-mutation.js";

export const DEFAULT_CONFIG = Object.freeze({
    random: Math.random,

    termination: Object.freeze({
        maxGenerations: 200,
        targetFitness: 0.98,
    }),

    population: Object.freeze({
        size: 100,
        initializer: new RandomPopulationInitializer(),
    }),

    fitness: Object.freeze({
        fitnessFunction: undefined,
    }),

    selection: Object.freeze({
        operator: new TournamentSelection(),
    }),

    crossover: Object.freeze({
        operator: new ArithmeticCrossover(),
        probability: 0.8,
    }),

    mutation: Object.freeze({
        operator: new GaussianMutation(),
        probability: 0.05,
    }),
});
