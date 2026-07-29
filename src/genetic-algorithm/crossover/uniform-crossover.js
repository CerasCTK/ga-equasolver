import { CrossoverStrategy } from "./crossover-strategy.js";

/**
 * For each gene, flip a coin (50/50) to decide whether
 * child A receives that gene from the father or the
 * mother - child B always receives the other gene.
 */
export class UniformCrossover extends CrossoverStrategy {
    #random;

    constructor({ random = Math.random } = {}) {
        super();
        this.#random = random;
    }

    crossover(parentA, parentB) {
        const childA = [];
        const childB = [];

        for (let i = 0; i < parentA.length; i++) {
            const takeFromA = this.#random() < 0.5;
            childA.push(takeFromA ? parentA[i] : parentB[i]);
            childB.push(takeFromA ? parentB[i] : parentA[i]);
        }

        return [childA, childB];
    }
}
