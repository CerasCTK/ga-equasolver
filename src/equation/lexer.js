import { TokenType, Token } from "./token.js";

// Single-character symbols map directly to a token type.
const SINGLE_CHAR_TOKENS = Object.freeze({
    "(": TokenType.OPEN_PARENTHESIS,
    ")": TokenType.CLOSE_PARENTHESIS,
    "=": TokenType.EQUAL,
    "+": TokenType.PLUS,
    "-": TokenType.MINUS,
    "*": TokenType.ASTERISK,
    "/": TokenType.SLASH,
    "^": TokenType.CARET,
});

// Adjacent token type pairs that imply a "*" between them,
// e.g. "2x" -> NUMBER VARIABLE, "2(x)" -> NUMBER OPEN_PARENTHESIS.
const IMPLICIT_MULTIPLY_PAIRS = new Set([
    `${TokenType.NUMBER}|${TokenType.VARIABLE}`,
    `${TokenType.NUMBER}|${TokenType.OPEN_PARENTHESIS}`,
    `${TokenType.VARIABLE}|${TokenType.VARIABLE}`,
    `${TokenType.VARIABLE}|${TokenType.OPEN_PARENTHESIS}`,
    `${TokenType.CLOSE_PARENTHESIS}|${TokenType.VARIABLE}`,
    `${TokenType.CLOSE_PARENTHESIS}|${TokenType.OPEN_PARENTHESIS}`,
]);

/**
 * Turns an equation string into a flat list of Tokens.
 * This is the only responsibility of Lexer: the parser never touches
 * the raw string, and nothing outside this class needs its internals.
 */
export class Lexer {
    #equation;
    #startIndex = 0;
    #currentIndex = 0;

    constructor(equation) {
        this.#equation = equation;
    }

    tokenize() {
        const rawTokens = this.#scanTokens();
        const tokens = this.#insertImplicitMultiplications(rawTokens);
        tokens.push(new Token(TokenType.END, ""));
        return tokens;
    }

    #scanTokens() {
        const tokens = [];
        while (!this.#isAtEnd()) {
            this.#startIndex = this.#currentIndex;
            const char = this.#advance();

            if (char === " ") {
                continue;
            }
            if (char in SINGLE_CHAR_TOKENS) {
                tokens.push(new Token(SINGLE_CHAR_TOKENS[char], char));
                continue;
            }
            if (this.#isDigit(char)) {
                tokens.push(this.#scanNumber());
            } else if (this.#isLetter(char)) {
                tokens.push(this.#scanVariable());
            } else {
                throw new Error(`Unexpected character: "${char}"`);
            }
        }
        return tokens;
    }

    #insertImplicitMultiplications(rawTokens) {
        const tokens = [];
        for (let i = 0; i < rawTokens.length; ++i) {
            const current = rawTokens[i];
            const next = rawTokens[i + 1];
            tokens.push(current);
            if (
                next &&
                IMPLICIT_MULTIPLY_PAIRS.has(`${current.type}|${next.type}`)
            ) {
                tokens.push(new Token(TokenType.ASTERISK, "*"));
            }
        }
        return tokens;
    }

    #scanNumber() {
        while (this.#isDigit(this.#peek())) {
            this.#advance();
        }
        if (this.#peek() === ".") {
            this.#advance();
            if (!this.#isDigit(this.#peek())) {
                throw new Error("Invalid decimal number");
            }
            while (this.#isDigit(this.#peek())) {
                this.#advance();
            }
        }
        return new Token(TokenType.NUMBER, this.#currentLexeme());
    }

    #scanVariable() {
        return new Token(TokenType.VARIABLE, this.#currentLexeme());
    }

    #currentLexeme() {
        return this.#equation.slice(this.#startIndex, this.#currentIndex);
    }

    #isDigit(char) {
        return char >= "0" && char <= "9";
    }

    #isLetter(char) {
        return char >= "a" && char <= "z";
    }

    #isAtEnd() {
        return this.#currentIndex >= this.#equation.length;
    }

    #peek() {
        return this.#isAtEnd() ? "\0" : this.#equation[this.#currentIndex];
    }

    #advance() {
        return this.#equation[this.#currentIndex++];
    }
}
