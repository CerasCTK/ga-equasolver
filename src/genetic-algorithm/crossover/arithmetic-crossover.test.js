import { describe, expect, it } from "vitest";
import { ArithmeticCrossover } from "./arithmetic-crossover.js";

describe("ArithmeticCrossover", () => {
    it("alpha = 0.5 (mặc định) thì cả hai con đều là trung bình cộng của cha mẹ", () => {
        const crossover = new ArithmeticCrossover();
        const [childA, childB] = crossover.crossover([0, 10], [10, 0]);
        expect(childA).toEqual([5, 5]);
        expect(childB).toEqual([5, 5]);
    });

    it("alpha = 1 thì childA trùng hoàn toàn parentA, childB trùng hoàn toàn parentB", () => {
        const crossover = new ArithmeticCrossover({ alpha: 1 });
        const [childA, childB] = crossover.crossover([1, 2], [9, 8]);
        expect(childA).toEqual([1, 2]);
        expect(childB).toEqual([9, 8]);
    });

    it("alpha = 0 thì hai con hoán đổi hoàn toàn cho nhau", () => {
        const crossover = new ArithmeticCrossover({ alpha: 0 });
        const [childA, childB] = crossover.crossover([1, 2], [9, 8]);
        expect(childA).toEqual([9, 8]);
        expect(childB).toEqual([1, 2]);
    });

    it("kết quả luôn nằm giữa hai giá trị gene cha mẹ tương ứng", () => {
        const crossover = new ArithmeticCrossover({ alpha: 0.3 });
        const [childA] = crossover.crossover([0, 100], [100, 0]);
        for (const gene of childA) {
            expect(gene).toBeGreaterThanOrEqual(0);
            expect(gene).toBeLessThanOrEqual(100);
        }
    });
});
