import { PopulationInitializer } from "./population-initializer.js";

export class RandomPopulationInitializer extends PopulationInitializer {
    #min;
    #max;
    #ranges;
    #random;

    constructor({
        min = -10,
        max = 10,
        ranges = null,
        random = Math.random,
    } = {}) {
        super();
        this.#min = min;
        this.#max = max;
        this.#ranges = ranges;
        this.#random = random;
    }

    initialize(size, geneCount) {
        return Array.from({ length: size }, () =>
            Array.from({ length: geneCount }, (_gene, index) =>
                this.#randomGene(index),
            ),
        );
    }

    #randomGene(index) {
        const [min, max] = this.#ranges?.[index] ?? [this.#min, this.#max];
        return min + this.#random() * (max - min);
    }
}
