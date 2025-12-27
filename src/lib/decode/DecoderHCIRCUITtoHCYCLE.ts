// Created by phatt-23 on 21/10/2025

import { HCYCLE_HCIRCUIT_ID, NODE_ID_PREFIX, type Id } from "$lib/core/Id";
import type { Graph, GraphNode } from "$lib/instance/Graph";
import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
import { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
import type { Decoder } from "./Decoder";

export class DecoderHCIRCUITtoHCYCLE implements Decoder<Graph, CertificateHCIRCUIT, CertificateHCYCLE> {

    decode(_outInstance: Graph, outCert: CertificateHCIRCUIT): CertificateHCYCLE {
        const path = new Array<Id>();

        outCert.path.forEach(node => {
            const nodeName = this.getNodeName(node.id);
            path.push(nodeName);
        });

        // remove duplicate occurences that are next to each other
        const reconstructed = new Array<GraphNode>();

        let p = undefined;
        for (let i = 0; i < path.length; i++) {
            if (p == path[i]) {
                continue;
            }

            p = path[i];
            reconstructed.push({
                id: NODE_ID_PREFIX + p,
            });
        }

        return new CertificateHCYCLE(reconstructed);
    }

    private nodePrefixes = [
        HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX, 
        HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX, 
        HCYCLE_HCIRCUIT_ID.GAP_NODE_PREFIX
    ];

    private getNodeName(nodeId: string): string {
        for (let i = 0; i < this.nodePrefixes.length; i++) {
            const prefix = this.nodePrefixes[i];

            if (nodeId.startsWith(prefix)) {
                return nodeId.slice(prefix.length);
            }
        }

        throw new Error(
            `Encountered node that doesn't start with any of the legal prefixes: ${nodeId}`);
    }
}
