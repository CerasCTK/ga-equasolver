export class SelectionStrategy {
    select(_population, _fitnesses) {
        throw new Error("select() must be implemented by subclass");
    }
}
