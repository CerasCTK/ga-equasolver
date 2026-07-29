import { describe, expect, it } from "vitest";
import { TournamentSelection } from "./tournament-selection.js";

describe("TournamentSelection", () => {
    it("với tournamentSize = 1, chọn đúng cá thể tại chỉ số random() trả về", () => {
        const population = [[1], [2], [3], [4]];
        const fitnesses = [0.1, 0.9, 0.2, 0.3];
        // random() = 0.5 -> floor(0.5 * 4) = 2
        const selection = new TournamentSelection({
            tournamentSize: 1,
            random: () => 0.5,
        });
        expect(selection.select(population, fitnesses)).toBe(population[2]);
    });

    it("với tournamentSize = toàn bộ quần thể, luôn chọn cá thể có fitness cao nhất", () => {
        const population = [[1], [2], [3], [4]];
        const fitnesses = [0.1, 0.9, 0.2, 0.3];
        // Trải đều random() để tournament duyệt qua tất cả chỉ số 0,1,2,3.
        const sequence = [0, 0.25, 0.5, 0.75];
        let i = 0;
        const random = () => sequence[i++ % sequence.length];

        const selection = new TournamentSelection({
            tournamentSize: 4,
            random,
        });
        expect(selection.select(population, fitnesses)).toBe(population[1]);
    });

    it("chỉ trả về một cá thể có sẵn trong quần thể (theo tham chiếu)", () => {
        const population = [[10], [20]];
        const fitnesses = [1, 1];
        const selection = new TournamentSelection({ tournamentSize: 2 });
        const picked = selection.select(population, fitnesses);
        expect(population).toContain(picked);
    });
});
