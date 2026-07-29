import { describe, expect, it } from "vitest";
import { GeneticAlgorithm } from "./genetic-algorithm.js";
import { SinglePointCrossover } from "./crossover/single-point-crossover.js";
import { UniformCrossover } from "./crossover/uniform-crossover.js";
import { UniformMutation } from "./mutation/uniform-mutation.js";
import { StepMutation } from "./mutation/step-mutation.js";
import { RandomSelection } from "./selection/random-selection.js";
import { FixedValuePopulationInitializer } from "./population/fixed-value-population-initializer.js";

/**
 * Deterministic PRNG (mulberry32) so integration tests never flake: with a
 * fixed seed, GeneticAlgorithm always explores the same sequence of
 * candidates and produces the exact same result.
 */
function createSeededRandom(seed) {
    let state = seed >>> 0;
    return function () {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

describe("GeneticAlgorithm - giải phương trình", () => {
    it("giải phương trình 1 biến (2x = 10) hội tụ gần đúng x = 5", () => {
        const ga = new GeneticAlgorithm("2x = 10", {
            random: createSeededRandom(12345),
            termination: { maxGenerations: 100, targetFitness: 0.999 },
        });
        const result = ga.run();
        expect(result.fitness).toBeGreaterThanOrEqual(0.999);
        expect(result.variables.x).toBeCloseTo(5, 1);
    });

    it("giải phương trình 2 biến (x + y = 10) cho residual gần 0", () => {
        const ga = new GeneticAlgorithm("x + y = 10", {
            random: createSeededRandom(999),
            termination: { maxGenerations: 100, targetFitness: 0.99 },
        });
        const result = ga.run();
        expect(result.fitness).toBeGreaterThanOrEqual(0.99);
        expect(Math.abs(result.residual)).toBeLessThan(0.1);
    });

    it("chạy được ngay với cấu hình mặc định, không cần truyền initializer/operator", () => {
        const ga = new GeneticAlgorithm("x = 5", {
            random: createSeededRandom(7),
            termination: { maxGenerations: 30, targetFitness: 0.9 },
        });
        expect(() => ga.run()).not.toThrow();
        expect(ga.getResult().fitness).toBeGreaterThanOrEqual(0.9);
    });

    it("chỉ override population.size vẫn giữ nguyên initializer mặc định", () => {
        const ga = new GeneticAlgorithm("x = 5", {
            random: createSeededRandom(7),
            population: { size: 10 },
            termination: { maxGenerations: 30, targetFitness: 0.9 },
        });
        expect(() => ga.run()).not.toThrow();
    });
});

describe("GeneticAlgorithm - đổi crossover/mutation chỉ bằng cách thay class", () => {
    it("đổi crossover sang SinglePointCrossover vẫn chạy đúng, không cần sửa GeneticAlgorithm", () => {
        const ga = new GeneticAlgorithm("x + y = 10", {
            crossover: { operator: new SinglePointCrossover() },
            termination: { maxGenerations: 100, targetFitness: 0.9 },
        });
        const result = ga.run();
        expect(result.fitness).toBeGreaterThan(0);
        expect(Object.keys(result.variables)).toEqual(["x", "y"]);
    });

    it("đổi mutation sang UniformMutation vẫn chạy đúng, không cần sửa GeneticAlgorithm", () => {
        const ga = new GeneticAlgorithm("x + y = 10", {
            mutation: { operator: new UniformMutation({ geneRate: 0.3 }) },
            termination: { maxGenerations: 100, targetFitness: 0.9 },
        });
        const result = ga.run();
        expect(result.fitness).toBeGreaterThan(0);
    });

    it("đổi cả crossover lẫn mutation cùng lúc vẫn chạy đúng", () => {
        const ga = new GeneticAlgorithm("x + y = 10", {
            crossover: { operator: new SinglePointCrossover() },
            mutation: { operator: new UniformMutation({ geneRate: 0.3 }) },
            termination: { maxGenerations: 50, targetFitness: 0.9 },
        });
        expect(() => ga.run()).not.toThrow();
    });

    it("dùng cả 4 strategy đơn giản (khởi tạo cố định, chọn ngẫu nhiên, lai đồng xu, đột biến từng bước) vẫn giải được phương trình", () => {
        const random = createSeededRandom(42);
        const ga = new GeneticAlgorithm("x = 5", {
            random,
            population: {
                size: 50,
                initializer: new FixedValuePopulationInitializer({ value: 0 }),
            },
            selection: { operator: new RandomSelection({ random }) },
            crossover: {
                operator: new UniformCrossover({ random }),
                probability: 0.5,
            },
            mutation: {
                operator: new StepMutation({
                    step: 0.2,
                    geneRate: 0.8,
                    random,
                }),
                probability: 0.9,
            },
            termination: { maxGenerations: 300, targetFitness: 0.9 },
        });
        const result = ga.run();
        expect(result.fitness).toBeGreaterThanOrEqual(0.9);
        expect(result.variables.x).toBeCloseTo(5, 0);
    });
});

describe("GeneticAlgorithm - vòng đời run()/stop()/getResult()", () => {
    it("onGeneration được gọi với đúng dữ liệu và cho phép dừng sớm bằng stop()", () => {
        const ga = new GeneticAlgorithm("x + y = 10", {
            random: createSeededRandom(1),
            // targetFitness > 1 là không thể đạt được -> vòng lặp chỉ dừng nhờ stop().
            termination: { maxGenerations: 50, targetFitness: 1.1 },
        });

        const reportedGenerations = [];
        ga.run((stats) => {
            expect(stats).toHaveProperty("generation");
            expect(stats).toHaveProperty("bestFitness");
            expect(stats).toHaveProperty("bestVariables");
            reportedGenerations.push(stats.generation);
            if (stats.generation >= 2) {
                ga.stop();
            }
        });

        expect(reportedGenerations).toEqual([0, 1, 2]);
        expect(ga.getResult().generation).toBe(2);
    });

    it("getResult() ném lỗi nếu gọi trước khi run()", () => {
        const ga = new GeneticAlgorithm("x = 5");
        expect(() => ga.getResult()).toThrow();
    });

    it("getVariableNames() trả về đúng tên biến của phương trình", () => {
        const ga = new GeneticAlgorithm("2x + 3y - z = 0");
        expect(ga.getVariableNames()).toEqual(["x", "y", "z"]);
    });
});

describe("GeneticAlgorithm - xác thực cấu hình (validateConfig)", () => {
    it("population.size <= 0 thì ném lỗi", () => {
        expect(
            () => new GeneticAlgorithm("x = 5", { population: { size: 0 } }),
        ).toThrow();
    });

    it("crossover.probability ngoài [0, 1] thì ném lỗi", () => {
        expect(
            () =>
                new GeneticAlgorithm("x = 5", {
                    crossover: { probability: 1.5 },
                }),
        ).toThrow();
    });

    it("mutation.probability ngoài [0, 1] thì ném lỗi", () => {
        expect(
            () =>
                new GeneticAlgorithm("x = 5", {
                    mutation: { probability: -0.1 },
                }),
        ).toThrow();
    });

    it("crossover.operator không implement crossover() thì ném lỗi", () => {
        expect(
            () =>
                new GeneticAlgorithm("x = 5", { crossover: { operator: {} } }),
        ).toThrow();
    });

    it("mutation.operator không implement mutate() thì ném lỗi", () => {
        expect(
            () => new GeneticAlgorithm("x = 5", { mutation: { operator: {} } }),
        ).toThrow();
    });

    it("termination.maxGenerations không phải số nguyên dương thì ném lỗi", () => {
        expect(
            () =>
                new GeneticAlgorithm("x = 5", {
                    termination: { maxGenerations: -5 },
                }),
        ).toThrow();
    });
});
