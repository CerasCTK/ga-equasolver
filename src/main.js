import { Lexer } from './lexer.js'

document.querySelector('#app').innerHTML = `
<input id="equation" type="text">
<button id="tokenize" type="button">Tokenize</button>
`

const input = document.querySelector("#equation");
const button = document.querySelector("#tokenize");

button.addEventListener("click", () => {
    const lexer = new Lexer(input.value);
    console.table(lexer.tokens);
});
