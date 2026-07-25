import { TokenType, Token } from "./token.js"

export class Lexer{
    constructor(equation){
        this.equation = equation;
        this.startIndex = 0;
        this.currentIndex = 0;
    }

    tokenize(){
        const rawTokens = this.scanTokens();

        const tokens = this.insertMultiply(rawTokens);

        tokens.push(new Token(TokenType.END, ""));

        return tokens;
    }

    checkForMultiply(lhs, rhs){
        if(lhs == TokenType.NUMBER && rhs == TokenType.VARIABLE){
            return true;
        }
        if(lhs == TokenType.NUMBER && rhs == TokenType.OPEN_PARENTHESIS){
            return true;
        }
        if(lhs == TokenType.VARIABLE && rhs == TokenType.VARIABLE){
            return true;
        }
        if(lhs == TokenType.VARIABLE && rhs == TokenType.OPEN_PARENTHESIS){
            return true;
        }
        if(lhs == TokenType.CLOSE_PARENTHESIS && rhs == TokenType.VARIABLE){
            return true;
        }
        if(lhs == TokenType.CLOSE_PARENTHESIS && rhs == TokenType.OPEN_PARENTHESIS){
            return true;
        }
        return false;
    }

    insertMultiply(rawTokens){
        const tokens = [];
        for(let i=0;i<rawTokens.length;++i){
            tokens.push(rawTokens.at(i));
            if(i+1 >= rawTokens.length){
                continue;
            }
            const lhs = rawTokens.at(i);
            const rhs = rawTokens.at(i + 1);
            if(this.checkForMultiply(lhs.type, rhs.type)){
                tokens.push(new Token(TokenType.ASTERISK, "*"));
            }
        }
        return tokens;
    }

    scanTokens(){
        const tokens = [];
        while(!this.isAtEnd()){
            this.startIndex = this.currentIndex;
            const char = this.advance();
            switch(char){
                case " ":
                    break;
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
                    tokens.push(new Token(TokenType.ASTERISK, "*"));
                    break;
                case "/":
                    tokens.push(new Token(TokenType.SLASH, "/"));
                    break;
                case "^":
                    tokens.push(new Token(TokenType.CARET, "^"));
                    break;
                default:
                    if(this.isNumber(char)){
                        tokens.push(this.scanNumber());
                    }else if(this.isLetter(char)){
                        tokens.push(this.scanVariable());
                    }else{
                        throw new Error("Invalid token");
                    }
                    break;
            }
        }
        return tokens;
    }

    scanNumber(){
        while(this.isNumber(this.peek())){
            this.advance();
        }
        if(this.peek() == "."){
            this.advance();
            if(!this.isNumber(this.peek())){
                throw new Error("Invalid decimal");
            }
            while(this.isNumber(this.peek())){
                this.advance();
            }
        }
        return new Token(TokenType.NUMBER, this.equation.slice(this.startIndex, this.currentIndex));
    }

    scanVariable(){
        return new Token(TokenType.VARIABLE, this.equation.slice(this.startIndex, this.currentIndex));
    }

    isNumber(char){
        return char >= "0" && char <= "9";
    }

    isLetter(char){
        return char >= "a" && char <= "z";
    }

    isAtEnd(){
        return this.currentIndex >= this.equation.length;
    }

    peek(){
        if(this.isAtEnd()){
            return "\0";
        }
        return this.equation[this.currentIndex];
    }

    advance(){
        return this.equation[this.currentIndex++];
    }
}
