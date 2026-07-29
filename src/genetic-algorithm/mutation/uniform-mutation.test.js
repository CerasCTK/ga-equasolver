import { describe, expect, it } from "vitest";
import { UniformMutation } from "./uniform-mutation.js";

describe("UniformMutation", () => {
    it("geneRate = 0 thì không thay đổi gene nào", () => {
        const mutation = new UniformMutation({ geneRate: 0 });
        expect(mutation.mutate([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("geneRate = 1 thì mọi gene đều được thay bằng giá trị ngẫu nhiên mới", () => {
        const mutation = new UniformMutation({
            min: 0,
            max: 10,
            geneRate: 1,
            random: () => 0.5,
        });
        expect(mutation.mutate([1, 2, 3])).toEqual([5, 5, 5]);
    });

    it("giá trị gene sau đột biến luôn nằm trong [min, max]", () => {
        const mutation = new UniformMutation({ min: -1, max: 1, geneRate: 1 });
        const mutated = mutation.mutate(new Array(50).fill(0));
        for (const gene of mutated) {
            expect(gene).toBeGreaterThanOrEqual(-1);
            expect(gene).toBeLessThanOrEqual(1);
        }
    });

    it("không thay đổi mảng gốc (immutability)", () => {
        const original = [1, 2, 3];
        const mutation = new UniformMutation({ geneRate: 1 });
        mutation.mutate(original);
        expect(original).toEqual([1, 2, 3]);
    });
});
