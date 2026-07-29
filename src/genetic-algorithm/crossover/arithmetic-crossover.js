import { CrossoverStrategy } from "./crossover-strategy.js";

/**
 * Blends both parents gene-by-gene: childA = alpha*A + (1-alpha)*B and
 * vice-versa.
 */
export class ArithmeticCrossover extends CrossoverStrategy {
    #alpha;

    constructor({ alpha = 0.5 } = {}) {
        super();
        this.#alpha = alpha;
    }

    crossover(parentA, parentB) {
        const childA = parentA.map(
            (gene, i) => this.#alpha * gene + (1 - this.#alpha) * parentB[i],
        );
        const childB = parentA.map(
            (gene, i) => (1 - this.#alpha) * gene + this.#alpha * parentB[i],
        );
        return [childA, childB];
    }
}
