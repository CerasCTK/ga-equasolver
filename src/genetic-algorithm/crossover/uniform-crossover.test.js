import { describe, expect, it } from "vitest";
import { UniformCrossover } from "./uniform-crossover.js";

describe("UniformCrossover", () => {
    it("random() luôn < 0.5 -> childA giống hệt parentA, childB giống hệt parentB", () => {
        const crossover = new UniformCrossover({ random: () => 0.1 });
        const [childA, childB] = crossover.crossover([1, 2, 3], [9, 8, 7]);
        expect(childA).toEqual([1, 2, 3]);
        expect(childB).toEqual([9, 8, 7]);
    });

    it("random() luôn >= 0.5 -> hai con hoán đổi hoàn toàn cho nhau", () => {
        const crossover = new UniformCrossover({ random: () => 0.9 });
        const [childA, childB] = crossover.crossover([1, 2, 3], [9, 8, 7]);
        expect(childA).toEqual([9, 8, 7]);
        expect(childB).toEqual([1, 2, 3]);
    });

    it("mỗi gene tung đồng xu riêng - kết quả trộn xen kẽ đúng như dự đoán", () => {
        // random() lần lượt: 0.1 (lấy từ A), 0.9 (lấy từ B), 0.1 (lấy từ A)
        const sequence = [0.1, 0.9, 0.1];
        let i = 0;
        const crossover = new UniformCrossover({
            random: () => sequence[i++],
        });
        const [childA, childB] = crossover.crossover([1, 2, 3], [9, 8, 7]);
        expect(childA).toEqual([1, 8, 3]);
        expect(childB).toEqual([9, 2, 7]);
    });

    it("không thay đổi mảng cha mẹ gốc (immutability)", () => {
        const parentA = [1, 2, 3];
        const parentB = [4, 5, 6];
        const crossover = new UniformCrossover({ random: () => 0.5 });
        crossover.crossover(parentA, parentB);
        expect(parentA).toEqual([1, 2, 3]);
        expect(parentB).toEqual([4, 5, 6]);
    });
});
