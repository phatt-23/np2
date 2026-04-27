// Created by phatt-23 on 19/10/2025

import Serializer from "$lib/core/Serializer";
import type { GraphNode } from "$lib/instance/Graph";
import type { CertificateGraphPath } from "./CertificateGraphPath";

@Serializer.SerializableClass()
export class CertificateHCYCLE implements CertificateGraphPath {
    public constructor(public path: GraphNode[]) {
    }
}
