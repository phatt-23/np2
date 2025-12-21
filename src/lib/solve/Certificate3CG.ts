import type { Id } from "$lib/core/Id";
import Serializer from "$lib/core/Serializer";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass("Certificate3CG")
export class Certificate3CG implements Certificate {
    constructor(public coloring: Map<Id, number>) {

    }
}
