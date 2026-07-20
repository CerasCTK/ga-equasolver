const TokenType = {
    NUMBER: "NUMBER",
    VARIABLE: "VARIABLE",
    OPEN_PARENTHESIS: "OPEN_PARENTHESIS",
    CLOSE_PARENTHESIS: "CLOSE_PARENTHESIS",
    EQUAL: "EQUAL",
    PLUS: "PLUS",
    MINUS: "MINUS",
    MULTIPLY: "MULTIPLY",
    DIVIDE: "DIVIDE",
    POWER: "POWER",
};

Object.freeze(TokenType);

class Token{
    constructor(type, value){
        this.type = type;
        this.value = value;
    }
}

export class Lexer{
	static #scanVariables(equation, currentIndex){
		const start = currentIndex;
		if(this.#isLetter(equation[currentIndex])){
			while(currentIndex < equation.length && this.#isLetter(equation[currentIndex])){
				currentIndex++;
			}
		}
		if(start === currentIndex){
			return null;
		}else{
			const tokens = equation
				.slice(start, currentIndex)
				.split("")
				.join("*")
				.split("")
				.map((char) => {
					if(char === "*"){
						return new Token(TokenType.MULTIPLY, "*");
					}else{
						return new Token(TokenType.VARIABLE, char);
					}
				});
			return {
				tokens: tokens,
				newIndex: currentIndex,
			};
		}
	}

	static #scanNumber(equation, currentIndex){
		const start = currentIndex;

		if(this.#isNumber(equation[currentIndex])){
			while(currentIndex < equation.length && this.#isNumber(equation[currentIndex])){
				currentIndex++;
			}
		}

		if(equation[currentIndex] === "." && currentIndex + 1 < equation.length && this.#isNumber(equation[currentIndex + 1])){
			currentIndex++;
			while(currentIndex < equation.length && this.#isNumber(equation[currentIndex])){
				currentIndex++;
			}
		}

		if(start === currentIndex){
			return null;
		}else{
			const tokens = [];
			tokens.push(new Token(TokenType.NUMBER, equation.slice(start, currentIndex)));

			const variables = this.#scanVariables(equation, currentIndex);
			if(variables !== null){
				currentIndex = variables.newIndex;
                tokens.push(new Token(TokenType.MULTIPLY, "*"));
				tokens.push(...variables.tokens);
			}

			return {
				tokens: tokens,
				newIndex: currentIndex
			};
		}
	}

    static #isNumber(char){
        return char >= "0" && char <= "9";
    }

    static #isLetter(char){
        return char >= "a" && char <= "z";
    }

	static tokenize(equation){
		let currentIndex = 0;
		const tokens = [];

        while(currentIndex < equation.length){
            if(equation[currentIndex] === " "){
				currentIndex++;
                continue;
            }

			const numbers = this.#scanNumber(equation, currentIndex);

			if(numbers !== null){
				currentIndex = numbers.newIndex;
				tokens.push(...numbers.tokens);
				continue;
			}

			const variables = this.#scanVariables(equation, currentIndex);
			if(variables !== null){
				currentIndex = variables.newIndex;
				tokens.push(...variables.tokens);
				continue;
			}

            switch(equation[currentIndex]){
                case "(":
                    tokens.push(new Token(TokenType.OPEN_PARENTHESIS, "("));
                    break;
                case ")":
                    tokens.push(new Token(TokenType.CLOSE_PARENTHESIS, ")"));
                    break;
                case "=":
                    tokens.push(new Token(TokenType.EQUAL, "="));
                    break;
                case "+":
                    tokens.push(new Token(TokenType.PLUS, "+"));
                    break;
                case "-":
                    tokens.push(new Token(TokenType.MINUS, "-"));
                    break;
                case "*":
                    tokens.push(new Token(TokenType.MULTIPLY, "*"));
                    break;
                case "/":
                    tokens.push(new Token(TokenType.DIVIDE, "/"));
                    break;
                case "^":
                    tokens.push(new Token(TokenType.POWER, "^"));
                    break;
				default:
					return null;
            }
			currentIndex++;
        }
		return tokens;
    }
}
