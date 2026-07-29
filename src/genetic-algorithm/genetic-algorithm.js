import { DEFAULT_CONFIG } from "./default-config.js";
import { Parser } from "../equation/parser.js";
import { createResidualFitness } from "./residual-fitness.js";

function isPlainObject(value) {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        value.constructor === Object
    );
}

function mergeConfig(defaults, overrides) {
    const merged = { ...defaults };
    for (const key of Object.keys(overrides)) {
        const defaultValue = defaults[key];
        const overrideValue = overrides[key];
        merged[key] =
            isPlainObject(defaultValue) && isPlainObject(overrideValue)
                ? { ...defaultValue, ...overrideValue }
                : overrideValue;
    }
    return merged;
}

function isProbability(value) {
    return typeof value === "number" && value >= 0 && value <= 1;
}

/**
 * Solves an equation by evolving a population of candidate variable
 * assignments toward a residual of 0.
 *
 * GeneticAlgorithm is the orchestrator only: it never contains the actual
 * initialization / selection / crossover / mutation logic. Each of those
 * is a small Strategy object read from `config` (see population/,
 * selection/, crossover/ and mutation/). To add a new crossover or
 * mutation method, write a new class implementing the same interface and
 * pass an instance of it in `config` - nothing here needs to change.
 */
export class GeneticAlgorithm {
    #config;
    #equation;
    #variableNames;
    #fitnessFunction;
    #random;

    #population = [];
    #generation = 0;
    #best = null;
    #running = false;

    constructor(equationText, config = {}) {
        this.#config = mergeConfig(DEFAULT_CONFIG, config);
        this.#random = this.#config.random;

        this.#equation = Parser.parseEquation(equationText);
        this.#variableNames = this.#equation.getVariableNames();
        this.#fitnessFunction =
            this.#config.fitness.fitnessFunction ??
            createResidualFitness(this.#equation, this.#variableNames);

        this.#validateConfig();
    }

    #validateConfig() {
        const { population, selection, crossover, mutation, termination } =
            this.#config;

        if (!Number.isInteger(population.size) || population.size <= 0) {
            throw new Error("population.size must be a positive integer");
        }
        if (typeof population.initializer?.initialize !== "function") {
            throw new Error(
                "population.initializer must implement initialize(size, geneCount)",
            );
        }
        if (typeof selection.operator?.select !== "function") {
            throw new Error(
                "selection.operator must implement select(population, fitnesses)",
            );
        }
        if (typeof crossover.operator?.crossover !== "function") {
            throw new Error(
                "crossover.operator must implement crossover(parentA, parentB)",
            );
        }
        if (!isProbability(crossover.probability)) {
            throw new Error(
                "crossover.probability must be a number between 0 and 1",
            );
        }
        if (typeof mutation.operator?.mutate !== "function") {
            throw new Error(
                "mutation.operator must implement mutate(individual)",
            );
        }
        if (!isProbability(mutation.probability)) {
            throw new Error(
                "mutation.probability must be a number between 0 and 1",
            );
        }
        if (
            !Number.isInteger(termination.maxGenerations) ||
            termination.maxGenerations <= 0
        ) {
            throw new Error(
                "termination.maxGenerations must be a positive integer",
            );
        }
        if (typeof termination.targetFitness !== "number") {
            throw new Error("termination.targetFitness must be a number");
        }
    }

    run(onGeneration) {
        this.#running = true;
        this.#generation = 0;
        this.#best = null;

        this.#population = this.#createInitialPopulation();
        this.#updateBest();
        this.#report(onGeneration);

        while (this.#running && !this.#hasConverged()) {
            this.#population = this.#createNextGeneration();
            this.#generation++;
            this.#updateBest();
            this.#report(onGeneration);
        }

        this.#running = false;
        return this.getResult();
    }

    #createInitialPopulation() {
        const genesList = this.#config.population.initializer.initialize(
            this.#config.population.size,
            this.#variableNames.length,
        );
        return genesList.map((genes) => this.#toIndividual(genes));
    }

    #updateBest() {
        for (const individual of this.#population) {
            if (!this.#best || individual.fitness > this.#best.fitness) {
                this.#best = individual;
            }
        }
    }

    #report(onGeneration) {
        if (typeof onGeneration !== "function") {
            return;
        }
        onGeneration({
            generation: this.#generation,
            bestFitness: this.#best.fitness,
            bestVariables: this.#toVariableMap(this.#best.genes),
        });
    }

    #hasConverged() {
        const { maxGenerations, targetFitness } = this.#config.termination;
        if (this.#generation >= maxGenerations) {
            return true;
        }
        return this.#best !== null && this.#best.fitness >= targetFitness;
    }

    #createNextGeneration() {
        const genesPool = this.#population.map(
            (individual) => individual.genes,
        );
        const fitnessPool = this.#population.map(
            (individual) => individual.fitness,
        );

        const nextPopulation = [];
        while (nextPopulation.length < this.#config.population.size) {
            const parentA = this.#config.selection.operator.select(
                genesPool,
                fitnessPool,
            );
            const parentB = this.#config.selection.operator.select(
                genesPool,
                fitnessPool,
            );

            let [childA, childB] = this.#shouldApply(
                this.#config.crossover.probability,
            )
                ? this.#config.crossover.operator.crossover(parentA, parentB)
                : [[...parentA], [...parentB]];

            childA = this.#maybeMutate(childA);
            nextPopulation.push(this.#toIndividual(childA));

            if (nextPopulation.length < this.#config.population.size) {
                childB = this.#maybeMutate(childB);
                nextPopulation.push(this.#toIndividual(childB));
            }
        }
        return nextPopulation;
    }

    #maybeMutate(genes) {
        return this.#shouldApply(this.#config.mutation.probability)
            ? this.#config.mutation.operator.mutate(genes)
            : genes;
    }

    #shouldApply(probability) {
        return this.#random() < probability;
    }

    #toIndividual(genes) {
        return { genes, fitness: this.#fitnessFunction(genes) };
    }

    #toVariableMap(genes) {
        return Object.fromEntries(
            this.#variableNames.map((name, i) => [name, genes[i]]),
        );
    }

    #residualOf(genes) {
        const variables = new Map(
            this.#variableNames.map((name, i) => [name, genes[i]]),
        );
        return this.#equation.computeResidual(variables);
    }

    stop() {
        this.#running = false;
    }

    getVariableNames() {
        return [...this.#variableNames];
    }

    getResult() {
        if (!this.#best) {
            throw new Error("No result yet - call run() first");
        }
        return {
            variables: this.#toVariableMap(this.#best.genes),
            fitness: this.#best.fitness,
            residual: this.#residualOf(this.#best.genes),
            generation: this.#generation,
        };
    }
}
