import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";

function residualOf(equationText, variableValues) {
    const equation = Parser.parseEquation(equationText);
    return equation.computeResidual(new Map(Object.entries(variableValues)));
}

function parseWith(equationText) {
    const parser = new Parser(new Lexer(equationText).tokenize());
    parser.parse();
    return parser;
}

describe("Parser - cú pháp và độ ưu tiên toán tử", () => {
    it("parse phép cộng hai biến", () => {
        expect(residualOf("x + y = 10", { x: 4, y: 6 })).toBe(0);
    });

    it("parse phép trừ hai biến", () => {
        expect(residualOf("x - y = 3", { x: 5, y: 2 })).toBe(0);
    });

    it("tự thêm dấu nhân ẩn giữa số và biến (2x)", () => {
        expect(residualOf("2x = 4", { x: 2 })).toBe(0);
    });

    it("tự thêm dấu nhân ẩn giữa hai biến (xy)", () => {
        expect(residualOf("xy = 6", { x: 2, y: 3 })).toBe(0);
    });

    it("tự thêm dấu nhân ẩn giữa số và dấu ngoặc: 2(x + 1)", () => {
        expect(residualOf("2(x + 1) = 8", { x: 3 })).toBe(0);
    });

    it("tự thêm dấu nhân ẩn giữa hai cụm ngoặc: (x+1)(y+1)", () => {
        expect(residualOf("(x + 1)(y + 1) = 6", { x: 1, y: 2 })).toBe(0);
    });

    it("parse phép chia", () => {
        expect(residualOf("x / 2 = 3", { x: 6 })).toBe(0);
    });

    it("parse luỹ thừa cơ bản", () => {
        expect(residualOf("x^2 = 9", { x: 3 })).toBe(0);
    });

    it("luỹ thừa kết hợp phải: 2^3^2 = 2^(3^2) = 512", () => {
        expect(residualOf("2^3^2 = 512", {})).toBe(0);
    });

    it("dấu âm đơn nguyên (unary minus)", () => {
        expect(residualOf("-x = -5", { x: 5 })).toBe(0);
    });

    it("dấu ngoặc lồng nhau", () => {
        expect(residualOf("((x + 1)) = 4", { x: 3 })).toBe(0);
    });

    it("độ ưu tiên: nhân được tính trước cộng", () => {
        expect(residualOf("2 + 3 * 4 = 14", {})).toBe(0);
    });

    it("hỗ trợ số thập phân", () => {
        expect(residualOf("1.5x + 2.25 = 9.75", { x: 5 })).toBe(0);
    });
});

describe("Parser - trích xuất danh sách biến", () => {
    it("getVariables() trả về đúng biến, theo thứ tự xuất hiện", () => {
        const parser = parseWith("2x + 3y - z = 0");
        expect(parser.getVariables()).toEqual(["x", "y", "z"]);
    });

    it("getVariables() loại bỏ biến trùng lặp", () => {
        const parser = parseWith("x + x = 2");
        expect(parser.getVariables()).toEqual(["x"]);
    });
});

describe("Parser - xử lý lỗi", () => {
    it('thiếu dấu "=" thì ném lỗi', () => {
        expect(() => Parser.parseEquation("x + y")).toThrow();
    });

    it('thiếu dấu ")" đóng thì ném lỗi', () => {
        expect(() => Parser.parseEquation("(x + 1 = 2")).toThrow();
    });

    it("ký tự không hợp lệ thì ném lỗi", () => {
        expect(() => Parser.parseEquation("x + @ = 1")).toThrow();
    });

    it("chia cho 0 khi evaluate thì ném lỗi", () => {
        expect(() => residualOf("x / y = 1", { x: 1, y: 0 })).toThrow();
    });

    it("thiếu giá trị biến khi evaluate thì ném lỗi", () => {
        expect(() => residualOf("x + y = 1", { x: 1 })).toThrow();
    });
});

describe("Parser - thay giá trị số thực (float) cho biến khi tính residual", () => {
    it("thay giá trị số thực dương cho biến", () => {
        expect(residualOf("x + y = 10", { x: 2.5, y: 7.5 })).toBeCloseTo(0, 10);
    });

    it("thay giá trị số thực âm cho biến", () => {
        expect(residualOf("x - y = 0", { x: -1.5, y: -1.5 })).toBeCloseTo(
            0,
            10,
        );
    });

    it("phép chia cho ra thương là số thực", () => {
        expect(residualOf("x / y = 2.5", { x: 5, y: 2 })).toBeCloseTo(0, 10);
    });

    it("luỹ thừa với cơ số là số thực", () => {
        expect(residualOf("x^2 = 6.25", { x: 2.5 })).toBeCloseTo(0, 10);
    });

    it("biểu thức nhiều biến với hệ số và giá trị đều là số thực", () => {
        expect(
            residualOf("2.5x + 1.5y - z = 0", { x: 2, y: 2, z: 8 }),
        ).toBeCloseTo(0, 10);
    });

    it("sai số dấu phẩy động (floating-point) không bị coi là bằng 0 tuyệt đối", () => {
        // 0.1 + 0.2 !== 0.3 chính xác tuyệt đối trong IEEE754 (~5.55e-17),
        // nên GA cần so sánh residual với một sai số (epsilon) thay vì === 0.
        const residual = residualOf("0.1 + 0.2 = 0.3", {});
        expect(residual).not.toBe(0);
        expect(residual).toBeCloseTo(0, 10);
    });
});

describe("Equation - getVariableNames()", () => {
    it("trả về đúng danh sách biến của cả hai vế phương trình", () => {
        const equation = Parser.parseEquation("2x + y = z - 1");
        expect(equation.getVariableNames()).toEqual(["x", "y", "z"]);
    });

    it("phương trình không có biến thì trả về mảng rỗng", () => {
        const equation = Parser.parseEquation("2 + 2 = 4");
        expect(equation.getVariableNames()).toEqual([]);
    });
});
