import {
    Operator,
    Unary,
    NumberExpr,
    BinaryExpr,
    VariableExpr,
    UnaryExpr,
    Equation,
} from "./ast.js";
import { TokenType } from "./token.js";
import { Lexer } from "./lexer.js";

/**
 * Recursive-descent parser: turns a token list into an Equation AST.
 * Parsing is its only responsibility - evaluation lives on the AST nodes
 * themselves (see ast.js), and tokenizing lives in Lexer.
 *
 * Grammar (lowest to highest precedence):
 *   equation   -> expression "=" expression
 *   expression -> term (("+" | "-") term)*
 *   term       -> unary (("*" | "/") unary)*
 *   unary      -> ("+" | "-") unary | power
 *   power      -> factor ("^" unary)?      // right-associative
 *   factor     -> NUMBER | VARIABLE | "(" expression ")"
 */
export class Parser {
    #tokens;
    #currentIndex = 0;
    #variables = new Set();

    constructor(tokens) {
        this.#tokens = tokens;
    }

    /** Convenience factory: tokenize and parse an equation string in one call. */
    static parseEquation(equation) {
        const tokens = new Lexer(equation).tokenize();
        return new Parser(tokens).parse();
    }

    parse() {
        const lhs = this.#parseExpression();

        if (!this.#match(TokenType.EQUAL)) {
            throw new Error('Expected "=" in equation');
        }
        this.#advance();

        const rhs = this.#parseExpression();
        return new Equation(lhs, rhs);
    }

    /** Variable names encountered while parsing, in first-seen order. */
    getVariables() {
        return [...this.#variables];
    }

    #parseExpression() {
        let lhs = this.#parseTerm();
        while (true) {
            if (this.#match(TokenType.PLUS)) {
                this.#advance();
                lhs = new BinaryExpr(Operator.ADD, lhs, this.#parseTerm());
            } else if (this.#match(TokenType.MINUS)) {
                this.#advance();
                lhs = new BinaryExpr(Operator.SUBTRACT, lhs, this.#parseTerm());
            } else {
                return lhs;
            }
        }
    }

    #parseTerm() {
        let lhs = this.#parseUnary();
        while (true) {
            if (this.#match(TokenType.ASTERISK)) {
                this.#advance();
                lhs = new BinaryExpr(
                    Operator.MULTIPLY,
                    lhs,
                    this.#parseUnary(),
                );
            } else if (this.#match(TokenType.SLASH)) {
                this.#advance();
                lhs = new BinaryExpr(Operator.DIVIDE, lhs, this.#parseUnary());
            } else {
                return lhs;
            }
        }
    }

    #parseUnary() {
        if (this.#match(TokenType.PLUS)) {
            this.#advance();
            return new UnaryExpr(Unary.POSITIVE, this.#parseUnary());
        }
        if (this.#match(TokenType.MINUS)) {
            this.#advance();
            return new UnaryExpr(Unary.NEGATIVE, this.#parseUnary());
        }
        return this.#parsePower();
    }

    #parsePower() {
        const lhs = this.#parseFactor();
        if (this.#match(TokenType.CARET)) {
            this.#advance();
            return new BinaryExpr(Operator.POWER, lhs, this.#parseUnary());
        }
        return lhs;
    }

    #parseFactor() {
        if (this.#match(TokenType.NUMBER)) {
            this.#advance();
            return new NumberExpr(Number(this.#previous().value));
        }
        if (this.#match(TokenType.VARIABLE)) {
            this.#advance();
            const name = this.#previous().value;
            this.#variables.add(name);
            return new VariableExpr(name);
        }
        if (this.#match(TokenType.OPEN_PARENTHESIS)) {
            this.#advance();
            const expression = this.#parseExpression();
            if (!this.#match(TokenType.CLOSE_PARENTHESIS)) {
                throw new Error('Expected ")"');
            }
            this.#advance();
            return expression;
        }
        throw new Error(`Unexpected token "${this.#peek().value}"`);
    }

    #match(type) {
        return this.#peek().type === type;
    }

    #peek() {
        return this.#tokens.at(this.#currentIndex);
    }

    #previous() {
        return this.#tokens.at(this.#currentIndex - 1);
    }

    #isAtEnd() {
        return this.#peek().type === TokenType.END;
    }

    #advance() {
        if (!this.#isAtEnd()) {
            this.#currentIndex++;
        }
    }
}
