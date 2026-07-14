const TokenType = {
    NUMBER: "NUMBER",
    DECIMAL_NUMBER: "DECIMAL_NUMBER",
    VARIABLE: "VARIABLE",
    OPEN_PARENTHESIS: "OPEN_PARENTHESIS",
    CLOSE_PARENTHESIS: "CLOSE_PARENTHESIS",
    EQUAL: "EQUAL",
    PLUS: "PLUS",
    MINUS: "MINUS",
    ASTERISK: "ASTERISK",
    SLASH: "SLASH",
    SQRT: "SQRT",
    CARET: "CARET",
};

class Token{
    constructor(type, value){
        this.type = type;
        this.value = value;
    }
}

export class Lexer{
    constructor(equation){
        this.tokens = [];
        this.equation = equation.trim();
        this.#tokenize();
    }
    #index = 0;

    #scanVariableAndSqrt(){
        const start = this.#index;
        if(this.#index + 4 <= this.equation.length && this.#chop(this.#index, this.#index + 4) == "sqrt"){
            this.#index += 4;
            return new Token(TokenType.SQRT, "sqrt");
        }
        if(this.#isLetter(this.#currChar())){
            while(this.#inBound() && this.#isLetter(this.#currChar())){
                this.#index++;
            }
        }
        if(start === this.#index){
            return null;
        }else{
            const result = this.#chop(start, this.#index).split("").join("*").split("");
            return result.map((char) => {
                if(char === "*"){
                    return new Token(TokenType.ASTERISK, "*");
                }else{
                    return new Token(TokenType.VARIABLE, char);
                }
            });
        }
    }

    #scanNumber(){
        let isDecimalNumber = false, isVariableTerm = false;

        const start = this.#index;
        if(this.#isNumber(this.#currChar())){
            while(this.#inBound() && this.#isNumber(this.#currChar())){
                this.#index++;
            }
        }

        if(this.#currChar() === "." && this.#index + 1 < this.equation.length && this.#isNumber(this.equation[this.#index + 1])){
            isDecimalNumber = true;
            this.#index++;
            while(this.#inBound() && this.#isNumber(this.#currChar())){
                this.#index++;
            }
        }

        if(start === this.#index){
            return null;
        }

        let number;
        if(isDecimalNumber){
            number = new Token(TokenType.DECIMAL_NUMBER, this.#chop(start, this.#index));
        }else{
            number = new Token(TokenType.NUMBER, this.#chop(start, this.#index));
        }

        let result = this.#scanVariableAndSqrt();
        result = Array.isArray(result) ? result : [result];
        if(result !== null && result.type != TokenType.SQRT){
            return [
                number,
                new Token(TokenType.ASTERISK, "*"),
                ...result
            ];
        }else{
            return number;
        }
    }

    #inBound(){
        return this.#index < this.equation.length;
    }

    #currChar(){
        return this.equation[this.#index];
    }

    #chop(start, end){
        return this.equation.slice(start, end);
    }

    #isNumber(char){
        return char >= "0" && char <= "9";
    }
    #isLetter(char){
        return char >= "a" && char <= "z";
    }

    #tokenize(){
        while(this.#inBound()){
            if(this.#currChar() === " "){
                this.#index++;
                continue;
            }

            const number = this.#scanNumber();
            if(number !== null){
                // when scan number it may return an array of tokens for example 2x = [2, *, x]
                this.tokens.push(...(Array.isArray(number) ? number : [number]));
                continue;
            }

            const variable = this.#scanVariableAndSqrt();
            if(variable !== null){
                this.tokens.push(...(Array.isArray(variable) ? variable : [variable]));
                continue;
            }

            switch(this.#currChar()){
                case "(":
                    this.tokens.push(new Token(TokenType.OPEN_PARENTHESIS, "("));
                    break;
                case ")":
                    this.tokens.push(new Token(TokenType.CLOSE_PARENTHESIS, ")"));
                    break;
                case "=":
                    this.tokens.push(new Token(TokenType.EQUAL, "="));
                    break;
                case "+":
                    this.tokens.push(new Token(TokenType.PLUS, "+"));
                    break;
                case "-":
                    this.tokens.push(new Token(TokenType.MINUS, "-"));
                    break;
                case "*":
                    this.tokens.push(new Token(TokenType.ASTERISK, "*"));
                    break;
                case "/":
                    this.tokens.push(new Token(TokenType.SLASH, "/"));
                    break;
                case "^":
                    this.tokens.push(new Token(TokenType.CARET, "^"));
                    break;
            }
            this.#index++;
        }
    }
}
