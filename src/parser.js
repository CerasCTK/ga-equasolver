import { Operator, Unary, NumberExpr, BinaryExpr, VariableExpr, UnaryExpr } from "./ast.js"
import { TokenType } from "./token.js"

export class Parser{
    constructor(tokens){
        this.tokens = tokens;
        this.currentIndex = 0;
		this.variables = new Set();
		this.ast = {};
    }

    peek(){
        return this.tokens.at(this.currentIndex);
    }

    previous(){
        return this.tokens.at(this.currentIndex - 1);
    }

    isAtEnd(){
        return this.peek().type === TokenType.END;
    }

    advance(){
        if(!this.isAtEnd()){
            this.currentIndex++;
        }
    }

    match(type){
        if(this.isAtEnd()){
            return type === TokenType.END;
        }
        return this.peek().type === type;
    }

	parse(){
		const lhs = this.parseExpression();

		if(!this.match(TokenType.EQUAL)){
            console.log(JSON.stringify(lhs, null, 4));
			throw new Error("Expected = in equation");
		}else{
            this.advance();
		}
		const rhs = this.parseExpression();
		this.ast = new BinaryExpr(Operator.EQUAL, lhs, rhs);
	}

	parseExpression(){
		let lhs = this.parseTerm();
		while(true){
			if(this.match(TokenType.PLUS)){
                this.advance();
				const rhs = this.parseTerm();
				lhs = new BinaryExpr(Operator.ADD, lhs, rhs);
			}else if(this.match(TokenType.MINUS)){
                this.advance();
				const rhs = this.parseTerm();
				lhs = new BinaryExpr(Operator.SUBTRACT, lhs, rhs);
			}else{
				break;
			}
		}
		return lhs;
	}

    parseTerm(){
        let lhs = this.parseUnary();
        while(true){
            if(this.match(TokenType.ASTERISK)){
                this.advance();
                const rhs = this.parseUnary();
                lhs = new BinaryExpr(Operator.MULTIPLY, lhs, rhs);
            }else if(this.match(TokenType.SLASH)){
                this.advance();
                const rhs = this.parseUnary();
                lhs = new BinaryExpr(Operator.DIVIDE, lhs, rhs);
            }else{
                break;
            }
        }
        return lhs;
    }

	parseUnary(){
        if(this.match(TokenType.PLUS)){
            this.advance();
            return new UnaryExpr(Unary.POSITIVE, this.parseUnary());
        }
        if(this.match(TokenType.MINUS)){
            this.advance();
            return new UnaryExpr(Unary.NEGATIVE, this.parseUnary());
        }

        return this.parsePower();
	}

	parsePower(){
		const lhs = this.parseFactor();
		if(this.match(TokenType.CARET)){
            this.advance();
			const rhs = this.parseUnary();
			return new BinaryExpr(Operator.POWER, lhs, rhs);
		}
		return lhs;
	}

	parseFactor(){
		if(this.match(TokenType.NUMBER)){
            this.advance();
			return new NumberExpr(Number(this.previous().value));
		}
		if(this.match(TokenType.VARIABLE)){
            this.advance();
			this.variables.add(this.previous().value);
			return new VariableExpr(this.previous().value);
		}
		if(this.match(TokenType.OPEN_PARENTHESIS)){
            this.advance();
			const expression = this.parseExpression();
			if(!this.match(TokenType.CLOSE_PARENTHESIS)){
				throw new Error("Expected ')'");
			}else{
                this.advance();
            }
            return expression;
		}
		throw new Error("Parse factor error");
	}

	evaluate(variablesMap){
		if(!(this.ast instanceof BinaryExpr) || this.ast.op !== Operator.EQUAL){
			throw new Error("Invalid AST");
		}
		const lhs = this.recursion(this.ast.lhs, variablesMap);
		const rhs = this.recursion(this.ast.rhs, variablesMap);
		return lhs === rhs;
	}

	recursion(node, variablesMap){
		if(node instanceof NumberExpr){
			return node.value;
		}
		if(node instanceof VariableExpr){
			return variablesMap.get(node.name);
		}
		if(node instanceof UnaryExpr){
			const value = this.recursion(node.operand, variablesMap);
			return node.op === Unary.POSITIVE ? value : -value;
		}
		if(node instanceof BinaryExpr){
			const lhs = this.recursion(node.lhs, variablesMap);
			const rhs = this.recursion(node.rhs, variablesMap);
			switch(node.op){
				case Operator.ADD:
					return lhs + rhs;
				case Operator.SUBTRACT:
					return lhs - rhs;
				case Operator.MULTIPLY:
					return lhs * rhs;
				case Operator.DIVIDE:
					if(rhs === 0){
						throw new Error("divide by zero");
					}
					return lhs / rhs;
				case Operator.POWER:
					return lhs ** rhs;
				default:
					throw new Error("This should not be happened!");
			}
		}
		throw new Error("This should not be happened!");
	}
}
