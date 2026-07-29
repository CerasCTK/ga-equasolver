import { describe, expect, it } from "vitest";
import { SinglePointCrossover } from "./single-point-crossover.js";

describe("SinglePointCrossover", () => {
    it("chỉ có 1 gene thì không thể cắt điểm, trả về bản sao nguyên vẹn của cha mẹ", () => {
        const crossover = new SinglePointCrossover();
        const [childA, childB] = crossover.crossover([1], [2]);
        expect(childA).toEqual([1]);
        expect(childB).toEqual([2]);
    });

    it("cắt tại điểm xác định và hoán đổi phần đuôi", () => {
        const parentA = [1, 2, 3, 4];
        const parentB = [10, 20, 30, 40];
        // length=4 -> point = 1 + floor(random()*3); random()=0.34 -> floor(1.02)=1 -> point=2
        const crossover = new SinglePointCrossover({ random: () => 0.34 });
        const [childA, childB] = crossover.crossover(parentA, parentB);
        expect(childA).toEqual([1, 2, 30, 40]);
        expect(childB).toEqual([10, 20, 3, 4]);
    });

    it("không thay đổi mảng cha mẹ gốc (immutability)", () => {
        const parentA = [1, 2, 3];
        const parentB = [4, 5, 6];
        const crossover = new SinglePointCrossover({ random: () => 0.5 });
        crossover.crossover(parentA, parentB);
        expect(parentA).toEqual([1, 2, 3]);
        expect(parentB).toEqual([4, 5, 6]);
    });
});
