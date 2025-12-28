// Created by phatt-23 on 27/12/2025

import Serializer from "$lib/core/Serializer";
import type { GraphNode } from "$lib/instance/Graph";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass()
export class CertificateGraphPath implements Certificate {
    public constructor(public path: GraphNode[]) {
    }
}