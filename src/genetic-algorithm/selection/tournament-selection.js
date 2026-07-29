import { SelectionStrategy } from "./selection-strategy.js";

export class TournamentSelection extends SelectionStrategy {
    #tournamentSize;
    #random;

    constructor({ tournamentSize = 3, random = Math.random } = {}) {
        super();
        this.#tournamentSize = tournamentSize;
        this.#random = random;
    }

    select(population, fitnesses) {
        let bestIndex = this.#randomIndex(population.length);
        for (let i = 1; i < this.#tournamentSize; i++) {
            const candidateIndex = this.#randomIndex(population.length);
            if (fitnesses[candidateIndex] > fitnesses[bestIndex]) {
                bestIndex = candidateIndex;
            }
        }
        return population[bestIndex];
    }

    #randomIndex(length) {
        return Math.floor(this.#random() * length);
    }
}
