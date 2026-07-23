import { Lexer } from './lexer.js'
import { Parser } from "./parser.js"

document.querySelector('#app').innerHTML = `
<input id="equation" type="text" value="2x + y = 10">
<button id="tokenize" type="button">Tokenize</button>
`

const input = document.querySelector("#equation");
const button = document.querySelector("#tokenize");

button.addEventListener("click", () => {
	const lexer = new Lexer(input.value);
    const tokens = lexer.tokenize();
    console.table(tokens);
    const parser = new Parser(tokens);
    parser.parse();
    console.log(JSON.stringify(parser.ast, null, 4));
	console.log(parser.variables);
	const population1 = [2, 6];
	const population2 = [2, 8];
	console.log(parser.computeResidual(population1));
	console.log(parser.computeResidual(population2));
});

// 2xyz + 3x^2y - 4xy^2 = 5(x + y)(z - 2)
// -2x^3(x - 1)^2 + 3(x + 2)(x^2 - 4x + 5) = (x - 1)(2x + 3)^2 - x/2
