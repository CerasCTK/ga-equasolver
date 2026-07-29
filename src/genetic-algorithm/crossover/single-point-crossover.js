import { CrossoverStrategy } from "./crossover-strategy.js";

export class SinglePointCrossover extends CrossoverStrategy {
    #random;

    constructor({ random = Math.random } = {}) {
        super();
        this.#random = random;
    }

    crossover(parentA, parentB) {
        const length = parentA.length;
        if (length < 2) {
            return [[...parentA], [...parentB]];
        }

        const point = 1 + Math.floor(this.#random() * (length - 1));
        return [
            [...parentA.slice(0, point), ...parentB.slice(point)],
            [...parentB.slice(0, point), ...parentA.slice(point)],
        ];
    }
}
