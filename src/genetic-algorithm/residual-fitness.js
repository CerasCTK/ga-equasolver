export function createResidualFitness(equation, variableNames) {
    return (genes) => {
        const variables = new Map(
            variableNames.map((name, i) => [name, genes[i]]),
        );
        const residual = equation.computeResidual(variables);
        return 1 / (1 + Math.abs(residual));
    };
}
