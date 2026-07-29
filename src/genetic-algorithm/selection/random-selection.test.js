import { describe, expect, it } from "vitest";
import { RandomSelection } from "./random-selection.js";

describe("RandomSelection", () => {
    it("chọn đúng cá thể tại chỉ số mà random() trỏ tới", () => {
        const population = [[1], [2], [3], [4]];
        // random() = 0.5 -> floor(0.5 * 4) = 2
        const selection = new RandomSelection({ random: () => 0.5 });
        expect(selection.select(population)).toBe(population[2]);
    });

    it("bỏ qua fitness hoàn toàn - vẫn có thể chọn cá thể có fitness thấp nhất", () => {
        const population = [[1], [2]];
        const fitnesses = [0.99, 0.01]; // index 1 rất tệ nhưng vẫn có thể được chọn
        // random() = 0.9 -> floor(0.9 * 2) = 1
        const selection = new RandomSelection({ random: () => 0.9 });
        expect(selection.select(population, fitnesses)).toBe(population[1]);
    });

    it("luôn trả về một cá thể có sẵn trong quần thể", () => {
        const population = [[10], [20], [30]];
        const selection = new RandomSelection({ random: () => 0.99 });
        expect(population).toContain(selection.select(population));
    });
});
