import { Parser } from "./equation/parser.js";
import { GeneticAlgorithm } from "./genetic-algorithm/genetic-algorithm.js";
import { RandomPopulationInitializer } from "./genetic-algorithm/population/random-population-initializer.js";
import { FixedValuePopulationInitializer } from "./genetic-algorithm/population/fixed-value-population-initializer.js";
import { TournamentSelection } from "./genetic-algorithm/selection/tournament-selection.js";
import { RouletteWheelSelection } from "./genetic-algorithm/selection/roulette-wheel-selection.js";
import { RandomSelection } from "./genetic-algorithm/selection/random-selection.js";
import { ArithmeticCrossover } from "./genetic-algorithm/crossover/arithmetic-crossover.js";
import { SinglePointCrossover } from "./genetic-algorithm/crossover/single-point-crossover.js";
import { UniformCrossover } from "./genetic-algorithm/crossover/uniform-crossover.js";
import { GaussianMutation } from "./genetic-algorithm/mutation/gaussian-mutation.js";
import { UniformMutation } from "./genetic-algorithm/mutation/uniform-mutation.js";
import { StepMutation } from "./genetic-algorithm/mutation/step-mutation.js";

// Names of the variables of the equation being analyzed most recently - used to know
// how many rows of "initialization intervals" need to be displayed and to detect when
// the user edits the equation but forgets to click "Analyze" again.
let currentVariableNames = [];

function renderApp() {
    document.querySelector("#app").innerHTML = `
        <style>
            body { font-family: sans-serif; max-width: 640px; margin: 24px auto; padding: 0 16px; }
            fieldset { margin-bottom: 16px; }
            label { display: block; margin: 8px 0 4px; }
            input, select { width: 100%; padding: 4px; box-sizing: border-box; }
            .row { display: flex; gap: 12px; }
            .row > div { flex: 1; }
            button { margin-top: 12px; padding: 8px 16px; }
            pre { background: #f4f4f4; padding: 8px; white-space: pre-wrap; }
            .error { color: #b00020; }
            #variables-section, #config-section, #result-section { display: none; }
        </style>

        <h1>Giải phương trình bằng thuật toán di truyền (GA)</h1>

        <fieldset>
            <legend>1. Phương trình</legend>
            <label for="equation-input">Nhập phương trình (ví dụ: 2x + y = 10)</label>
            <input id="equation-input" type="text" value="2x + y = 10" />
            <button id="parse-btn" type="button">Phân tích</button>
            <p id="parse-error" class="error"></p>
        </fieldset>

        <fieldset id="variables-section">
            <legend>2. Khoảng khởi tạo cho từng biến</legend>
            <div id="variable-ranges"></div>
        </fieldset>

        <fieldset id="config-section">
            <legend>3. Cấu hình thuật toán</legend>

            <div class="row">
                <div>
                    <label for="population-size">Kích thước quần thể</label>
                    <input id="population-size" type="number" min="1" value="100" />
                </div>
                <div>
                    <label for="max-generations">Số thế hệ tối đa</label>
                    <input id="max-generations" type="number" min="1" value="200" />
                </div>
            </div>

            <label for="target-fitness">Độ thích nghi mục tiêu (0 - 1, càng gần 1 nghiệm càng chính xác)</label>
            <input id="target-fitness" type="number" min="0" max="1" step="0.001" value="0.98" />

            <label for="population-initializer">Cách khởi tạo quần thể</label>
            <select id="population-initializer">
                <option value="random">Ngẫu nhiên trong khoảng (RandomPopulationInitializer)</option>
                <option value="fixed">Bắt đầu từ 1 giá trị cố định (FixedValuePopulationInitializer)</option>
            </select>
            <div id="fixed-value-row" style="display: none">
                <label for="fixed-value">Giá trị cố định cho mọi biến</label>
                <input id="fixed-value" type="number" value="0" />
            </div>

            <label for="selection-strategy">Cách chọn lọc (Selection)</label>
            <select id="selection-strategy">
                <option value="tournament">Đấu loại (TournamentSelection)</option>
                <option value="roulette">Vòng quay may mắn (RouletteWheelSelection)</option>
                <option value="random">Ngẫu nhiên hoàn toàn (RandomSelection)</option>
            </select>

            <div class="row">
                <div>
                    <label for="crossover-strategy">Cách lai tạo (Crossover)</label>
                    <select id="crossover-strategy">
                        <option value="arithmetic">Trộn trung bình (ArithmeticCrossover)</option>
                        <option value="single-point">Cắt 1 điểm (SinglePointCrossover)</option>
                        <option value="uniform">Tung đồng xu từng gene (UniformCrossover)</option>
                    </select>
                </div>
                <div>
                    <label for="crossover-probability">Xác suất lai tạo (0 - 1)</label>
                    <input id="crossover-probability" type="number" min="0" max="1" step="0.01" value="0.8" />
                </div>
            </div>

            <div class="row">
                <div>
                    <label for="mutation-strategy">Cách đột biến (Mutation)</label>
                    <select id="mutation-strategy">
                        <option value="gaussian">Nhiễu ngẫu nhiên (GaussianMutation)</option>
                        <option value="uniform">Thay giá trị mới hoàn toàn (UniformMutation)</option>
                        <option value="step">Nhích từng bước nhỏ (StepMutation)</option>
                    </select>
                </div>
                <div>
                    <label for="mutation-probability">Xác suất đột biến (0 - 1)</label>
                    <input id="mutation-probability" type="number" min="0" max="1" step="0.01" value="0.05" />
                </div>
            </div>

            <button id="run-btn" type="button">Chạy</button>
        </fieldset>

        <fieldset id="result-section">
            <legend>4. Kết quả</legend>
            <pre id="result-output"></pre>
        </fieldset>
    `;
}

function handleParse() {
    document.querySelector("#parse-error").textContent = "";

    const equationText = document.querySelector("#equation-input").value;
    let equation;
    try {
        equation = Parser.parseEquation(equationText);
    } catch (error) {
        document.querySelector("#parse-error").textContent =
            "Phương trình không hợp lệ: " + error.message;
        document.querySelector("#variables-section").style.display = "none";
        document.querySelector("#config-section").style.display = "none";
        return;
    }

    currentVariableNames = equation.getVariableNames();
    renderVariableRanges(currentVariableNames);

    document.querySelector("#variables-section").style.display = "block";
    document.querySelector("#config-section").style.display = "block";
    document.querySelector("#result-section").style.display = "none";
}

function renderVariableRanges(variableNames) {
    const container = document.querySelector("#variable-ranges");

    if (variableNames.length === 0) {
        container.innerHTML = "<p>Phương trình này không có biến nào.</p>";
        return;
    }

    container.innerHTML = variableNames
        .map(
            (name) => `
            <div class="row" data-variable="${name}">
                <div>
                    <label>Biến "${name}" - nhỏ nhất</label>
                    <input type="number" class="var-min" value="-10" step="any" />
                </div>
                <div>
                    <label>Biến "${name}" - lớn nhất</label>
                    <input type="number" class="var-max" value="10" step="any" />
                </div>
            </div>`,
        )
        .join("");
}

/** Đọc khoảng [min, max] của từng biến, theo đúng thứ tự currentVariableNames. */
function readVariableRanges() {
    const rows = document.querySelectorAll("#variable-ranges [data-variable]");
    return Array.from(rows, (row) => [
        Number(row.querySelector(".var-min").value),
        Number(row.querySelector(".var-max").value),
    ]);
}

function createPopulationInitializer() {
    const kind = document.querySelector("#population-initializer").value;
    if (kind === "fixed") {
        const value = Number(document.querySelector("#fixed-value").value);
        return new FixedValuePopulationInitializer({ value });
    }
    return new RandomPopulationInitializer({ ranges: readVariableRanges() });
}

function createSelectionStrategy() {
    const kind = document.querySelector("#selection-strategy").value;
    if (kind === "roulette") return new RouletteWheelSelection();
    if (kind === "random") return new RandomSelection();
    return new TournamentSelection();
}

function createCrossoverStrategy() {
    const kind = document.querySelector("#crossover-strategy").value;
    if (kind === "single-point") return new SinglePointCrossover();
    if (kind === "uniform") return new UniformCrossover();
    return new ArithmeticCrossover();
}

function createMutationStrategy() {
    const kind = document.querySelector("#mutation-strategy").value;
    if (kind === "uniform") return new UniformMutation();
    if (kind === "step") return new StepMutation();
    return new GaussianMutation();
}

function buildConfigFromForm() {
    return {
        population: {
            size: Number(document.querySelector("#population-size").value),
            initializer: createPopulationInitializer(),
        },
        selection: { operator: createSelectionStrategy() },
        crossover: {
            operator: createCrossoverStrategy(),
            probability: Number(
                document.querySelector("#crossover-probability").value,
            ),
        },
        mutation: {
            operator: createMutationStrategy(),
            probability: Number(
                document.querySelector("#mutation-probability").value,
            ),
        },
        termination: {
            maxGenerations: Number(
                document.querySelector("#max-generations").value,
            ),
            targetFitness: Number(
                document.querySelector("#target-fitness").value,
            ),
        },
    };
}

function formatResult(result) {
    const lines = ["Nghiệm tìm được:"];
    for (const [name, value] of Object.entries(result.variables)) {
        lines.push(`  ${name} = ${value.toFixed(6)}`);
    }
    lines.push(`Sai số (residual): ${result.residual.toFixed(6)}`);
    lines.push(`Độ thích nghi (fitness): ${result.fitness.toFixed(6)}`);
    lines.push(`Số thế hệ đã chạy: ${result.generation}`);
    return lines.join("\n");
}

function showResult(text) {
    document.querySelector("#result-output").textContent = text;
    document.querySelector("#result-section").style.display = "block";
}

function handleRun() {
    const equationText = document.querySelector("#equation-input").value;

    let equation;
    try {
        equation = Parser.parseEquation(equationText);
    } catch (error) {
        showResult("Lỗi: phương trình không hợp lệ - " + error.message);
        return;
    }

    // If the user modifies the equation but forgets to click "Analyze" again, the number
    // variable name displayed in step 2 may no longer match the current equation
    // - prompt them to re-analyze instead of running with incorrect data.
    const variableNames = equation.getVariableNames();
    const namesMatch =
        variableNames.length === currentVariableNames.length &&
        variableNames.every((name, i) => name === currentVariableNames[i]);
    if (!namesMatch) {
        showResult(
            'Phương trình đã thay đổi - bấm "Phân tích" lại trước khi chạy.',
        );
        return;
    }

    try {
        const ga = new GeneticAlgorithm(equationText, buildConfigFromForm());
        const result = ga.run();
        showResult(formatResult(result));
    } catch (error) {
        showResult("Lỗi: " + error.message);
    }
}

function attachEventListeners() {
    document.querySelector("#parse-btn").addEventListener("click", handleParse);
    document.querySelector("#run-btn").addEventListener("click", handleRun);
    document
        .querySelector("#population-initializer")
        .addEventListener("change", (event) => {
            document.querySelector("#fixed-value-row").style.display =
                event.target.value === "fixed" ? "block" : "none";
        });
}

renderApp();
attachEventListeners();
handleParse();
