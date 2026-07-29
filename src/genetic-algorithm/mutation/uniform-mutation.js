import { MutationStrategy } from "./mutation-strategy.js";

export class UniformMutation extends MutationStrategy {
    #min;
    #max;
    #geneRate;
    #random;

    constructor({
        min = -10,
        max = 10,
        geneRate = 0.5,
        random = Math.random,
    } = {}) {
        super();
        this.#min = min;
        this.#max = max;
        this.#geneRate = geneRate;
        this.#random = random;
    }

    mutate(individual) {
        return individual.map((gene) =>
            this.#random() < this.#geneRate ? this.#randomGene() : gene,
        );
    }

    #randomGene() {
        return this.#min + this.#random() * (this.#max - this.#min);
    }
}
