export class MutationStrategy {
    mutate(_individual) {
        throw new Error("mutate() must be implemented by subclass");
    }
}
