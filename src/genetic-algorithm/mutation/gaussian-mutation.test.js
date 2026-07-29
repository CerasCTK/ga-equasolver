import { describe, expect, it } from "vitest";
import { GaussianMutation } from "./gaussian-mutation.js";

/** Sequence-based fake random(): returns values[0], values[1], ... in order. */
function sequenceRandom(values) {
    let i = 0;
    return () => values[i++ % values.length];
}

describe("GaussianMutation", () => {
    it("geneRate = 0 thì không thay đổi gene nào", () => {
        const mutation = new GaussianMutation({ geneRate: 0 });
        expect(mutation.mutate([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("khớp đúng công thức Box-Muller với u, v xác định", () => {
        // sqrt(-2*ln(0.5)) * cos(2*pi*0.5) = sqrt(1.386294...) * (-1) ≈ -1.17741
        const mutation = new GaussianMutation({
            sigma: 1,
            geneRate: 1,
            random: sequenceRandom([0.5, 0.5]),
        });
        const [gene] = mutation.mutate([0]);
        expect(gene).toBeCloseTo(-1.17741, 4);
    });

    it("sigma càng lớn thì độ lệch khỏi gene gốc càng lớn theo đúng tỉ lệ", () => {
        const small = new GaussianMutation({
            sigma: 1,
            geneRate: 1,
            random: sequenceRandom([0.5, 0.5]),
        });
        const large = new GaussianMutation({
            sigma: 3,
            geneRate: 1,
            random: sequenceRandom([0.5, 0.5]),
        });
        const [deltaSmall] = small.mutate([0]);
        const [deltaLarge] = large.mutate([0]);
        expect(deltaLarge).toBeCloseTo(deltaSmall * 3, 6);
    });

    it("không thay đổi mảng gốc (immutability)", () => {
        const original = [1, 2, 3];
        const mutation = new GaussianMutation({ geneRate: 1 });
        mutation.mutate(original);
        expect(original).toEqual([1, 2, 3]);
    });
});
