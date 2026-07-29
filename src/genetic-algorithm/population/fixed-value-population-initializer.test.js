import { describe, expect, it } from "vitest";
import { FixedValuePopulationInitializer } from "./fixed-value-population-initializer.js";

describe("FixedValuePopulationInitializer", () => {
    it("mặc định mọi gene đều bằng 0", () => {
        const initializer = new FixedValuePopulationInitializer();
        const population = initializer.initialize(3, 2);
        expect(population).toEqual([
            [0, 0],
            [0, 0],
            [0, 0],
        ]);
    });

    it("mọi gene đều bằng giá trị được cấu hình", () => {
        const initializer = new FixedValuePopulationInitializer({ value: 7 });
        const population = initializer.initialize(2, 3);
        expect(population).toEqual([
            [7, 7, 7],
            [7, 7, 7],
        ]);
    });

    it("tạo đúng số cá thể theo size", () => {
        const initializer = new FixedValuePopulationInitializer();
        expect(initializer.initialize(5, 1)).toHaveLength(5);
    });

    it("geneCount = 0 thì mỗi cá thể là mảng rỗng", () => {
        const initializer = new FixedValuePopulationInitializer();
        expect(initializer.initialize(2, 0)).toEqual([[], []]);
    });
});
