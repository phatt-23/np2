//
// Created by phatt-23 on 11/10/2025
//

export abstract class ProblemInstance {
    /*
     * Problem specific. Each problem has an empty state.
     */
    public abstract isEmpty(): boolean;

    /*
     * Serializes the problem instance.
     * When using workers, these are the methods that serialize and desearialize 
     * the problem instance. The Serializer class cannot be used. Worker has a 
     * different context to the main thread and the classes are not registered.
     */
    public abstract toSerializedString(): string;
}



