import { PopulationInitializer } from "./population-initializer.js";

export class FixedValuePopulationInitializer extends PopulationInitializer {
    #value;

    constructor({ value = 0 } = {}) {
        super();
        this.#value = value;
    }

    initialize(size, geneCount) {
        return Array.from({ length: size }, () =>
            Array.from({ length: geneCount }, () => this.#value),
        );
    }
}
