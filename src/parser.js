import { Operator, Unary, NumberExpr, BinaryExpr, VariableExpr, UnaryExpr, Equation } from "./ast.js"
import { TokenType } from "./token.js"

export class Parser{
    constructor(tokens){
        this.tokens = tokens;
        this.currentIndex = 0;
    }

	parse(){
		const equation = this.parseEquation();
		return equation;
	}

	parseEquation(){
		const lhs = this.parseExpression();

		if(tokens[this.currentIndex].type !== TokenType.EQUAL){
			throw new Error("Expected = in equation");
		}else{
			this.currentIndex++;
		}
		const rhs = this.parseExpression();
		return new Equation(lhs, rhs);
	}

	parseExpression(){
		const lhs = this.parseTerm();
		while(true){
			if(this.tokens[this.currentIndex].type === TokenType.PLUS){
                this.currentIndex++;
				const rhs = this.parseTerm();
				lhs = new BinaryExpr(Operator.ADD, lhs, rhs);
			}else if(this.tokens[this.currentIndex].type == TokenType.MINUS){
                this.currentIndex++;
				const rhs = this.parseTerm();
				lhs = new BinaryExpr(Operator.SUBTRACT, lhs, rhs);
			}else{
				break;
			}
		}
		return lhs;
	}

    parseTerm(){
        const lhs = this.parseUnary();
        while(true){
            if(this.tokens[this.currentIndex].type === TokenType.ASTERISK){
                this.currentIndex++;
                const rhs = this.parseUnary();
                lhs = new BinaryExpr(Operator.MULTIPLY, lhs, rhs);
            }else if(this.tokens[this.currentIndex].type === TokenType.SLASH){
                this.currentIndex++;
                const rhs = this.parseUnary();
                lhs = new BinaryExpr(Operator.DIVIDE, lhs, rhs);
            }else{
                break;
            }
        }
        return lhs;
    }

	parseUnary(){
        if(this.tokens[this.currentIndex].type === TokenType.PLUS){
            this.currentIndex++;
            return new UnaryExpr(Unary.PLUS, this.parseUnary());
        }
        if(this.tokens[this.currentIndex].type === TokenType.MINUS){
            this.currentIndex++;
            return new UnaryExpr(Unary.MINUS, this.parseUnary());
        }

        return this.parsePower();
	}

	parsePower(){
		const lhs = this.parseFactor();
		if(this.tokens[this.currentIndex].type === TokenType.CARET){
            this.currentIndex++;
			const rhs = this.parseUnary();
			return new BinaryExpr(Operator.POWER, lhs, rhs);
		}
		return lhs;
	}

	parseFactor(){
		if(this.tokens[this.currentIndex].type === TokenType.NUMBER){
			return new NumberExpr(Number(this.tokens[this.currentIndex++].value));
		}
		if(this.tokens[this.currentIndex].type === TokenType.VARIABLE){
			return new VariableExpr(this.tokens[this.currentIndex++].value);
		}
		if(this.tokens[this.currentIndex].type === TokenType.OPEN_PARENTHESIS){
            this.currentIndex++;
			const expression = this.parseExpression();
			if(this.tokens[this.currentIndex].type !== TokenType.CLOSE_PARENTHESIS){
				throw new Error("Expected ')'");
			}else{
                this.currentIndex++;
            }
            return expression;
		}
		throw new Error("Parse factor error");
	}
}
