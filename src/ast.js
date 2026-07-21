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
	constructor(op, left, right){
		this.op = op;
		this.left = left;
		this.right = right;
	}
}

export class UnaryExpr{
	constructor(op, operand){
		this.op = op;
		this.operand = operand;
	}
}

export class Equation{
	constructor(left, right){
		this.left = left;
		this.right = right;
	}
}
