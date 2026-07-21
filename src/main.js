import { Lexer } from './lexer.js'
import { Parser } from "./parser.js"

document.querySelector('#app').innerHTML = `
<input id="equation" type="text">
<button id="tokenize" type="button">Tokenize</button>
`

const input = document.querySelector("#equation");
const button = document.querySelector("#tokenize");

button.addEventListener("click", () => {
	const lexer = new Lexer(input.value);
    const tokens = lexer.tokenize();
    console.table(tokens);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 4));
});
