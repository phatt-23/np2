// Created by phatt-23 on 21/10/2025

import Serializer from "$lib/core/Serializer";
import type { GraphNode } from "$lib/instance/Graph";
import type { CertificateGraphPath } from "./CertificateGraphPath";

@Serializer.SerializableClass()
export class CertificateHCIRCUIT implements CertificateGraphPath {
    public constructor(public path: Array<GraphNode>) {
    }
}
