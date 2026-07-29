import { MutationStrategy } from "./mutation-strategy.js";

/** Perturbs each gene by Gaussian noise (mean 0, standard deviation `sigma`) with probability `geneRate`. */
export class GaussianMutation extends MutationStrategy {
    #sigma;
    #geneRate;
    #random;

    constructor({ sigma = 1, geneRate = 0.5, random = Math.random } = {}) {
        super();
        this.#sigma = sigma;
        this.#geneRate = geneRate;
        this.#random = random;
    }

    mutate(individual) {
        return individual.map((gene) =>
            this.#random() < this.#geneRate
                ? gene + this.#sampleGaussian() * this.#sigma
                : gene,
        );
    }

    /** Box-Muller transform */
    #sampleGaussian() {
        let u = 0;
        let v = 0;
        while (u === 0) u = this.#random();
        while (v === 0) v = this.#random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
}
