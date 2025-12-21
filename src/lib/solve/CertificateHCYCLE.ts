// Created by phatt-23 on 19/10/2025

import Serializer from "$lib/core/Serializer";
import type { GraphNode } from "$lib/instance/Graph";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass()
export class CertificateHCYCLE implements Certificate {
    public path : GraphNode[];

    public constructor(path : GraphNode[]) {
        this.path = path;
    }
}