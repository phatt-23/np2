// Created by phatt-23 on 21/10/2025

import Serializer from "$lib/core/Serializer";
import type { GraphNode } from "$lib/instance/Graph";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass()
export class CertificateHCIRCUIT implements Certificate {
    public path: Array<GraphNode>;

    public constructor(circuit: Array<GraphNode>) {
        this.path = circuit;
    }

}
