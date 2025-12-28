// Created by phatt-23 on 21/10/2025

import { HCYCLE_HCIRCUIT_ID, NODE_ID_PREFIX, type Id } from "$lib/core/Id";
import type { Graph, GraphNode } from "$lib/instance/Graph";
import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
import { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
import type { Decoder } from "./Decoder";

export class DecoderHCIRCUITtoHCYCLE implements Decoder<Graph, CertificateHCIRCUIT, CertificateHCYCLE> {

    decode(_outInstance: Graph, outCert: CertificateHCIRCUIT): CertificateHCYCLE {
        const path: { id: string; label: string }[] = [];

        outCert.path.forEach(node => {
            const { id, label } = this.getNodeId(node);
            path.push({ id, label });
        });

        // remove duplicate occurences that are next to each other
        const reconstructed = new Array<GraphNode>();

        let p = undefined;
        for (let i = 0; i < path.length; i++) {
            if (p && p.id == path[i].id) {
                continue;
            }

            p = path[i];
            reconstructed.push({
                id: p.id,
                label: p.label,
            });
        }

        return new CertificateHCYCLE(reconstructed);
    }

    private nodePrefixes = [
        [HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX, '_{i}'], 
        [HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX, '_{o}'], 
        [HCYCLE_HCIRCUIT_ID.GAP_NODE_PREFIX, '_{b}']
    ];

    private getNodeId(node: GraphNode) {
        const nodeId: string = node.id;
        
        for (let i = 0; i < this.nodePrefixes.length; i++) {
            const prefix = this.nodePrefixes[i];

            if (nodeId.startsWith(prefix[0])) {
                return {
                    id: nodeId.slice(prefix[0].length),
                    label: node.label!.slice(0, node.label!.length - prefix[1].length)
                } 
            }
        }

        throw new Error(
            `Encountered node that doesn't start with any of the legal prefixes: ${nodeId}`);
    }
}
