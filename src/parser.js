import { Operator, Unary, NumberExpr, BinaryExpr, VariableExpr, UnaryExpr, Equation } from "./ast.js"

export class Parser{
	static parse(tokens){
		const equation = this.#parseEquation(tokens);
		return equation;
	}

	static #parseEquation(tokens){
		let currentIndex = 0;
		const { lhs, newIndex } = this.#parseExpression(tokens, currentIndex);
		currentIndex = newIndex;

		if(tokens[currentIndex].type !== TokenType.EQUAL){
			throw new Error("Expected = in equation");
		}else{
			currentIndex++;
		}
		const { rhs, newIndex } = this.#parseExpression(tokens, currentIndex);
		return new Equation(lhs, rhs);
	}

	static #parseExpression(tokens, currentIndex){
		const lhs = parseTerm(tokens);
		while(true){
			if(tokens[tokens.currentIndex].type === TokenType.PLUS){
				const rhs = parseTerm(tokens);
				lhs = new BinaryExpr(Operator.ADD, lhs, rhs);
			}else if(tokens[tokens.currentIndex].type == TokenType.MINUS){
				const rhs = parseTerm(tokens);
				lhs = new BinaryExpr(Operator.SUBTRACT, left, right);
			}else{
				break;
			}
		}
		return lhs;
	}

	static #parseTerm(tokens){
		const lhs = parseUnary(tokens);
		while(true){
			if(tokens[tokens.currentIndex].type === TokenType.ASTERISK){
				const rhs = parseUnary(tokens);
				lhs = new BinaryExpr(Operator.MULTIPLY, lhs, rhs);
			}else if(tokens[tokens.currentIndex].type === TokenType.SLASH){
				const rhs = parseUnary(tokens);
				lhs = new BinaryExpr(Operator.DIVIDE, lhs, rhs);
			}else{
				break;
			}
		}
		return lhs;
	}

	static #parseUnary(tokens, currentIndex){

	}

	static #parsePower(tokens, currentIndex){
		const { result as lhs, newIndex } = this.#parseFactor(tokens, currentIndex);
		currentIndex = newIndex;
		if(tokens[currentIndex].type == TokenType.CARET){
			const { result as rhs, newIndex } = this.#parseUnary(token, currentIndex);
			currentIndex = newIndex;
			return {
				result: new BinaryExpr(Operator.POWER, lhs, rhs),
				newIndex: currentIndex + 1,
			}
		}
		return lhs;
	}

	static #parseFactor(tokens, currentIndex){
		if(tokens[currentIndex].type === TokenType.NUMBER){
			const numberExpr = new NumberExpr(Number(tokens[currentIndex].value));
			return {
				result: numberExpr,
				newIndex: currentIndex + 1,
			};
		}
		if(tokens[currentIndex].type === TokenType.VARIABLE){
			const variableExpr = new VariableExpr(tokens[currentIndex].value);
			return {
				result: variableExpr,
				newIndex: currentIndex + 1,
			}
		}
		if(tokens[currentIndex].type === TokenType.OPEN_PARENTHESIS){
			const { expression, newIndex } = this.#parseExpression(tokens, currentIndex);
			currentIndex = newIndex;
			if(tokens[currentIndex].type !== TokenType.CLOSE_PARENTHESIS){
				throw new Error("Expected ')'");
			}
			return {
				result: expression,
				newIndex: currentIndex + 1,
			};
		}
		throw new Error("Parse factor error");
	}
}
