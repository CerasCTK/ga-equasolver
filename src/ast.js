export const Operator = Object.freeze({
	ADD: "ADD",
	SUBTRACT: "SUBTRACT",
	MULTIPLY: "MULTIPLY",
	DIVIDE: "DIVIDE",
	POWER: "POWER"
});

export const Unary = Object.freeze({
	PLUS: "PLUS",
	NEGATIVE: "NEGATIVE"
});

export class NumberExpr{
	constructor(value){
		this.value = value;
	}
}

export class VariableExpr{
	constructor(name){
		this.name = name;
	}
}

export class BinaryExpr{
	constructor(op, lhs, rhs){
		this.op = op;
		this.lhs = lhs;
		this.rhs = rhs;
	}
}

export class UnaryExpr{
	constructor(op, operand){
		this.op = op;
		this.operand = operand;
	}
}

export class Equation{
	constructor(lhs, rhs){
		this.lhs = lhs;
		this.rhs = rhs;
	}
}
