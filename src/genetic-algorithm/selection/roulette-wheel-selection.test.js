import { describe, expect, it } from "vitest";
import { RouletteWheelSelection } from "./roulette-wheel-selection.js";

describe("RouletteWheelSelection", () => {
    it("chọn cá thể theo đúng ngưỡng tích luỹ (cumulative threshold)", () => {
        const population = [[1], [2]];
        const fitnesses = [1, 3]; // total = 4
        // random() = 0.99 -> threshold = 0.99*4 = 3.96
        // trừ fitness[0]=1 -> 2.96 (chưa <=0)
        // trừ fitness[1]=3 -> -0.04 (<=0) -> chọn index 1
        const selection = new RouletteWheelSelection({ random: () => 0.99 });
        expect(selection.select(population, fitnesses)).toBe(population[1]);
    });

    it("random() nhỏ thì có xu hướng chọn cá thể đầu tiên có fitness đủ lớn", () => {
        const population = [[1], [2]];
        const fitnesses = [1, 3]; // total = 4
        // random() = 0.1 -> threshold = 0.4, trừ fitness[0]=1 -> -0.6 <=0 -> chọn index 0
        const selection = new RouletteWheelSelection({ random: () => 0.1 });
        expect(selection.select(population, fitnesses)).toBe(population[0]);
    });

    it("tổng fitness = 0 thì vẫn trả về một cá thể hợp lệ, không lỗi", () => {
        const population = [[1], [2], [3]];
        const fitnesses = [0, 0, 0];
        const selection = new RouletteWheelSelection({ random: () => 0.5 });
        const picked = selection.select(population, fitnesses);
        expect(population).toContain(picked);
    });
});
