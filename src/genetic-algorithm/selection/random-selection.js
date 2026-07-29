import { SelectionStrategy } from "./selection-strategy.js";

/**
 * Cách chọn đơn giản nhất có thể: bốc thăm ngẫu nhiên một cá thể bất kỳ
 * trong quần thể - không quan tâm cá thể đó tốt (fitness cao) hay xấu
 * (fitness thấp).
 */
export class RandomSelection extends SelectionStrategy {
    #random;

    constructor({ random = Math.random } = {}) {
        super();
        this.#random = random;
    }

    select(population) {
        const index = Math.floor(this.#random() * population.length);
        return population[index];
    }
}
