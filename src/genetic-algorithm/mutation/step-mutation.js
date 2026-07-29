import { MutationStrategy } from "./mutation-strategy.js";

/**
 * For each gene, there is a probability `geneRate`
 * to add or subtract a fixed small "step".
 */
export class StepMutation extends MutationStrategy {
    #step;
    #geneRate;
    #random;

    constructor({ step = 0.1, geneRate = 0.5, random = Math.random } = {}) {
        super();
        this.#step = step;
        this.#geneRate = geneRate;
        this.#random = random;
    }

    mutate(individual) {
        return individual.map((gene) => {
            if (this.#random() >= this.#geneRate) {
                return gene;
            }
            const goUp = this.#random() < 0.5;
            return goUp ? gene + this.#step : gene - this.#step;
        });
    }
}
