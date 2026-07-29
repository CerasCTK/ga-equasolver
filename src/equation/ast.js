export const Operator = Object.freeze({
    ADD: "ADD",
    SUBTRACT: "SUBTRACT",
    MULTIPLY: "MULTIPLY",
    DIVIDE: "DIVIDE",
    POWER: "POWER",
});

export const Unary = Object.freeze({
    POSITIVE: "POSITIVE",
    NEGATIVE: "NEGATIVE",
});

export class Expr {
    evaluate(_variables) {
        throw new Error("evaluate() must be implemented by subclass");
    }

    collectVariableNames(_names) {}
}

export class NumberExpr extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }

    evaluate() {
        return this.value;
    }
}

export class VariableExpr extends Expr {
    constructor(name) {
        super();
        this.name = name;
    }

    evaluate(variables) {
        if (!variables.has(this.name)) {
            throw new Error(`Missing value for variable "${this.name}"`);
        }
        return variables.get(this.name);
    }

    collectVariableNames(names) {
        names.add(this.name);
    }
}

export class UnaryExpr extends Expr {
    constructor(op, operand) {
        super();
        this.op = op;
        this.operand = operand;
    }

    evaluate(variables) {
        const value = this.operand.evaluate(variables);
        return this.op === Unary.POSITIVE ? value : -value;
    }

    collectVariableNames(names) {
        this.operand.collectVariableNames(names);
    }
}

const BINARY_EVALUATORS = Object.freeze({
    [Operator.ADD]: (lhs, rhs) => lhs + rhs,
    [Operator.SUBTRACT]: (lhs, rhs) => lhs - rhs,
    [Operator.MULTIPLY]: (lhs, rhs) => lhs * rhs,
    [Operator.DIVIDE]: (lhs, rhs) => {
        if (rhs === 0) {
            throw new Error("Division by zero");
        }
        return lhs / rhs;
    },
    [Operator.POWER]: (lhs, rhs) => lhs ** rhs,
});

export class BinaryExpr extends Expr {
    constructor(op, lhs, rhs) {
        super();
        this.op = op;
        this.lhs = lhs;
        this.rhs = rhs;
    }

    evaluate(variables) {
        const evaluator = BINARY_EVALUATORS[this.op];
        if (!evaluator) {
            throw new Error(`Unsupported operator: ${this.op}`);
        }
        return evaluator(
            this.lhs.evaluate(variables),
            this.rhs.evaluate(variables),
        );
    }

    collectVariableNames(names) {
        this.lhs.collectVariableNames(names);
        this.rhs.collectVariableNames(names);
    }
}

export class Equation {
    constructor(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    computeResidual(variables) {
        return this.lhs.evaluate(variables) - this.rhs.evaluate(variables);
    }

    getVariableNames() {
        const names = new Set();
        this.lhs.collectVariableNames(names);
        this.rhs.collectVariableNames(names);
        return [...names];
    }
}
