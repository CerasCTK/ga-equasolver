export const TokenType = Object.freeze({
    NUMBER: "NUMBER",
    VARIABLE: "VARIABLE",
    OPEN_PARENTHESIS: "OPEN_PARENTHESIS",
    CLOSE_PARENTHESIS: "CLOSE_PARENTHESIS",
    EQUAL: "EQUAL",
    PLUS: "PLUS",
    MINUS: "MINUS",
    ASTERISK: "ASTERISK",
    SLASH: "SLASH",
    CARET: "CARET",
});

export class Token{
    constructor(type, value){
        this.type = type;
        this.value = value;
    }
}

