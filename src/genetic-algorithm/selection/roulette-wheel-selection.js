import { SelectionStrategy } from "./selection-strategy.js";

export class RouletteWheelSelection extends SelectionStrategy {
    #random;

    constructor({ random = Math.random } = {}) {
        super();
        this.#random = random;
    }

    select(population, fitnesses) {
        const total = fitnesses.reduce((sum, fitness) => sum + fitness, 0);
        if (total <= 0) {
            return population[Math.floor(this.#random() * population.length)];
        }

        let threshold = this.#random() * total;
        for (let i = 0; i < population.length; i++) {
            threshold -= fitnesses[i];
            if (threshold <= 0) {
                return population[i];
            }
        }
        return population[population.length - 1];
    }
}
