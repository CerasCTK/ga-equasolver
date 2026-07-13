const TokenType = {
    NUMBER: "NUMBER",
    VARIABLE: "VARIABLE",
    DOT: "DOT",
    LEFT_PARENTHESIS: "LEFT_PARENTHESIS",
    RIGHT_PARENTHESIS: "RIGHT_PARENTHESIS",
    EQUAL: "EQUAL",
    PLUS: "PLUS",
    MINUS: "MINUS",
    ASTERISK: "ASTERISK",
    SLASH: "SLASH",
    SQRT: "SQRT",
    CARET: "CARET",
};

const input = "   (2x/3) + y^2 + sqrt(z) = 20     ";

export function tokenize(input){
    const tokens = [];
    let index = 0;
    input = input.trim();
    while(index <= input.length){
        const token = input[index];
        // space
        if(token === " "){
            index++;
            continue;
        }
        // number
        if(token >= "0" && token <= "9"){
            const start = index;
            while(input[index] >= "0" && input[index] <= "9"){
                index++;
            }
            tokens.push({
                type: TokenType.NUMBER,
                value: input.slice(start, index),
            });
            continue;
        }
        // variable & sqrt
        if(token >= "a" && token <= "z"){
            // sqrt
            if(input.slice(index, index + 4) === "sqrt"){
                tokens.push({
                    type: TokenType.SQRT,
                    value: input.slice(index, index + 4),
                });
                index = index + 4;
                continue;
            }
            // variable
            const start = index;
            tokens.push({
                type: TokenType.VARIABLE,
                value: input[index],
            });
            index++;
            while(input[index] >= "a" && input[index] <= "z"){
                tokens.push({
                    type: TokenType.ASTERISK,
                    value: "*",
                });
                tokens.push({
                    type: TokenType.VARIABLE,
                    value: input[index],
                });
                index++;
            }
            continue;
        }
        switch(token){
            case ".":
                tokens.push({
                    type: TokenType.DOT,
                    value: ".",
                });
                break;
            case "(":
                tokens.push({
                    type: TokenType.LEFT_PARENTHESIS,
                    value: "(",
                });
                break;
            case ")":
                tokens.push({
                    type: tokentype.RIGHT_PARENTHESIS,
                    value: ")",
                });
                break;
            case "=":
                tokens.push({
                    type: tokentype.EQUAL,
                    value: "=",
                });
                break;
            case "+":
                tokens.push({
                    type: tokentype.PLUS,
                    value: "+",
                });
                break;
            case "-":
                tokens.push({
                    type: tokentype.MINUS,
                    value: "-",
                });
                break;
            case "*":
                tokens.push({
                    type: tokentype.ASTERISK,
                    value: "*",
                });
                break;
            case "/":
                tokens.push({
                    type: tokentype.SLASH,
                    value: "/",
                });
                break;
            case "^":
                tokens.push({
                    type: tokentype.CARET,
                    value: "^",
                });
                break;
        }
        index++;
    }
    return tokens;
}
