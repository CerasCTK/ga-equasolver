import { describe, expect, it } from "vitest";
import { Parser } from "../equation/parser.js";
import { createResidualFitness } from "./residual-fitness.js";

describe("createResidualFitness", () => {
    it("residual = 0 thì fitness = 1 (nghiệm hoàn hảo)", () => {
        const equation = Parser.parseEquation("x + y = 10");
        const fitness = createResidualFitness(equation, ["x", "y"]);
        expect(fitness([4, 6])).toBe(1);
    });

    it("residual càng lớn thì fitness càng nhỏ (nhưng luôn > 0)", () => {
        const equation = Parser.parseEquation("x = 0");
        const fitness = createResidualFitness(equation, ["x"]);
        const near = fitness([1]);
        const far = fitness([100]);
        expect(near).toBeGreaterThan(far);
        expect(far).toBeGreaterThan(0);
    });

    it("fitness luôn nằm trong (0, 1]", () => {
        const equation = Parser.parseEquation("x = 0");
        const fitness = createResidualFitness(equation, ["x"]);
        for (const x of [-1000, -1, 0, 1, 1000]) {
            const value = fitness([x]);
            expect(value).toBeGreaterThan(0);
            expect(value).toBeLessThanOrEqual(1);
        }
    });

    it("thứ tự genes phải khớp với thứ tự variableNames được truyền vào", () => {
        const equation = Parser.parseEquation("x - y = 4");
        const fitness = createResidualFitness(equation, ["x", "y"]);
        // x=10, y=6 -> residual = 0
        expect(fitness([10, 6])).toBe(1);
    });
});
