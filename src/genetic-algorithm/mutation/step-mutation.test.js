import { describe, expect, it } from "vitest";
import { StepMutation } from "./step-mutation.js";

describe("StepMutation", () => {
    it("geneRate = 0 thì không thay đổi gene nào", () => {
        const mutation = new StepMutation({ geneRate: 0 });
        expect(mutation.mutate([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("geneRate = 1 và luôn đi lên (random < 0.5) thì mọi gene tăng thêm đúng 1 step", () => {
        const mutation = new StepMutation({
            step: 0.5,
            geneRate: 1,
            random: () => 0.1, // < geneRate (áp dụng) và < 0.5 (đi lên)
        });
        expect(mutation.mutate([1, 2, 3])).toEqual([1.5, 2.5, 3.5]);
    });

    it("geneRate = 1 và luôn đi xuống (random >= 0.5) thì mọi gene giảm đúng 1 step", () => {
        // Lần gọi random() thứ nhất (kiểm tra geneRate) phải < 1 để áp dụng,
        // lần gọi thứ hai (kiểm tra hướng) phải >= 0.5 để đi xuống.
        const sequence = [0.1, 0.9, 0.1, 0.9, 0.1, 0.9];
        let i = 0;
        const mutation = new StepMutation({
            step: 0.5,
            geneRate: 1,
            random: () => sequence[i++],
        });
        expect(mutation.mutate([1, 2, 3])).toEqual([0.5, 1.5, 2.5]);
    });

    it("không thay đổi mảng gốc (immutability)", () => {
        const original = [1, 2, 3];
        const mutation = new StepMutation({ geneRate: 1 });
        mutation.mutate(original);
        expect(original).toEqual([1, 2, 3]);
    });
});
