// Created by phatt-23 on 21/10/2025

import Serializer from "$lib/core/Serializer";
import type { GraphNode } from "$lib/instance/Graph";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass()
export class CertificateTSP implements Certificate {
    path: GraphNode[]

    constructor(path: GraphNode[]) {
        this.path = path;
    }
}