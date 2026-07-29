import { describe, expect, it } from "vitest";
import { RandomPopulationInitializer } from "./random-population-initializer.js";

describe("RandomPopulationInitializer", () => {
    it("tạo đúng số cá thể, mỗi cá thể đúng số gene", () => {
        const initializer = new RandomPopulationInitializer();
        const population = initializer.initialize(5, 3);
        expect(population).toHaveLength(5);
        for (const individual of population) {
            expect(individual).toHaveLength(3);
        }
    });

    it("giá trị gene nằm trong khoảng [min, max] đã cấu hình", () => {
        const initializer = new RandomPopulationInitializer({
            min: -2,
            max: 2,
        });
        const population = initializer.initialize(50, 4);
        for (const individual of population) {
            for (const gene of individual) {
                expect(gene).toBeGreaterThanOrEqual(-2);
                expect(gene).toBeLessThanOrEqual(2);
            }
        }
    });

    it("geneCount = 0 thì mỗi cá thể là mảng rỗng", () => {
        const initializer = new RandomPopulationInitializer();
        const population = initializer.initialize(3, 0);
        expect(population).toEqual([[], [], []]);
    });

    it("random() được inject dùng để sinh gene xác định (deterministic)", () => {
        const initializer = new RandomPopulationInitializer({
            min: 0,
            max: 10,
            random: () => 0.5,
        });
        const population = initializer.initialize(2, 2);
        expect(population).toEqual([
            [5, 5],
            [5, 5],
        ]);
    });

    it("ranges cho phép mỗi biến (gene) có khoảng init riêng", () => {
        const initializer = new RandomPopulationInitializer({
            ranges: [
                [0, 10],
                [-5, 5],
            ],
            random: () => 0.5,
        });
        const population = initializer.initialize(3, 2);
        for (const individual of population) {
            expect(individual).toEqual([5, 0]);
        }
    });

    it("gene không có trong ranges thì lấy khoảng [min, max] mặc định", () => {
        const initializer = new RandomPopulationInitializer({
            min: 100,
            max: 200,
            ranges: [[0, 10]], // chỉ khai báo cho gene đầu tiên
            random: () => 0.5,
        });
        const [individual] = initializer.initialize(1, 2);
        expect(individual[0]).toBe(5); // dùng ranges[0]
        expect(individual[1]).toBe(150); // dùng [min, max] mặc định
    });
});
