// Created by phatt-23 on 21/10/2025

import { EDGE_ID_PREFIX, HCYCLE_HCIRCUIT_ID, NODE_ID_PREFIX } from "$lib/core/Id";
import { Graph, type GraphNode, type Position } from "$lib/instance/Graph";
import { Reducer } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

export class ReducerHCYCLEtoHCIRCUIT extends Reducer<Graph, Graph> {
    private nodeDist = 80;  // vzdalenost mezi vrcholy v trojici
    private tripletDist = 2 * 3 * this.nodeDist;  // vzdalenost mezi trojicemi vrcholu
    private nodeCount: number;
    private circum: number;
    private radius: number;
    private radStep: number;
    private startRot: number;

    constructor(instance: Graph) {
        super(instance);

        if (instance.isEmpty()) {
            throw new Error("Reducer doesn't accept empty graphs (Graph with node nodes).");
        }

        this.nodeCount = instance.nodes.length; 

        // obvod kruhu: o = 2 * pi * r
        // r = o / (2 * pi)
        this.circum = this.tripletDist * this.nodeCount;
        
        // radius
        this.radius = this.circum / (2 * Math.PI);

        // step in radians
        this.radStep = (2 * Math.PI) / this.nodeCount;

        // in radians
        this.startRot = 0.5 * Math.PI;  
    }

    protected doReduce(): { outInstance: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        const step1 = this.createNodeTriplets();
        steps.push(...step1.steps);

        const step2 = this.connectEdges(step1.graph.copy());
        steps.push(...step2.steps);
        
        const outInstance = step2.graph;

        return { outInstance, steps };
    }

    private connectEdges(graph: Graph): { graph: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        const cutNodeIdPrefix = (id: string) => id.slice(NODE_ID_PREFIX.length);

        type Conn = {
            from: string;
            to: string;
        };

        const edgesConns = new Array<Conn>();

        this.inInstance.edges.forEach(e => {
            const fromName = cutNodeIdPrefix(e.from);
            const toName = cutNodeIdPrefix(e.to); 

            edgesConns.push({ from: fromName, to: toName });

            const fromId = HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX + fromName;
            const toId = HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX + toName;

            graph.addEdge({
                id: EDGE_ID_PREFIX + `${fromId}-${toId}`,
                from: fromId,
                to: toId,
            });
        });

        steps.push({
            id: `connect-edges`,
            title: `Connect edges`,
            description: `
                <p> 
                    For every original edge from node <i>a</i> to node <i>b</i>,
                    connect the node <i>a_out</i> with the node <i>b_in</i>.
                </p>
                <p>
                    In this particular case, add these edges:
                    <ul>
                        ${edgesConns.map(conn => 
                            `<li>(${conn.from}_out, ${conn.to}_in)</li>`
                        ).join('')}
                    </ul>
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
            mapping: {},
        });

        return { graph, steps };
    }

    private createNodeTriplets(): { graph: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        const graph = new Graph();

        this.inInstance.nodes.forEach((n,i) => {
            const nodeName = n.id.slice(NODE_ID_PREFIX.length);

            const inPos: Position = {
                x: this.radius * Math.cos(i * this.radStep - this.startRot - 0.2 * this.radStep),
                y: this.radius * Math.sin(i * this.radStep - this.startRot - 0.2 * this.radStep),
            }
            const gapPos: Position = {
                x: this.radius * Math.cos(i * this.radStep - this.startRot),
                y: this.radius * Math.sin(i * this.radStep - this.startRot),
            }
            const outPos: Position = {
                x: this.radius * Math.cos(i * this.radStep - this.startRot + 0.2 * this.radStep),
                y: this.radius * Math.sin(i * this.radStep - this.startRot + 0.2 * this.radStep),
            }
            
            const triplet: Record<string, GraphNode> = {
                'in': {
                    id: HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX + nodeName,
                    position: inPos,
                    classes: n.classes
                },
                'gap': {
                    id: HCYCLE_HCIRCUIT_ID.GAP_NODE_PREFIX + nodeName,
                    position: gapPos,
                    classes: n.classes
                },
                'out': {
                    id: HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX + nodeName,
                    position: outPos,
                    classes: n.classes
                }
            }

            // add triplet nodes
            Object.values(triplet).forEach(n => graph.addNode(n));

            // connect the in-coming and out-going nodes with the gap node
            graph.addEdge({
                id: EDGE_ID_PREFIX + `${triplet.in.id}-${triplet.gap.id}`,
                from: triplet.in.id,
                to: triplet.gap.id, 
            });
            graph.addEdge({
                id: EDGE_ID_PREFIX + `${triplet.gap.id}-${triplet.out.id}`,
                from: triplet.gap.id,
                to: triplet.out.id, 
            });
        });

        steps.push({
            id: `create-node-triplets`,
            title: `Create node triplets`,
            description: `
                <p> 
                    For each node in the original graph,
                    create three nodes that represent:
                    <ul>
                        <li>
                            an in-coming node
                        </li>
                        <li>
                            a gap node
                        </li>
                        <li>
                            and an out-going node
                        </li>
                    </ul>
                </p>
                <p>
                    Connect the in-coming node with the gap-node and the gap-node with the out-going node.
                </p>
                <p>
                    For this particular graph there will be ${this.nodeCount} node ${this.nodeCount == 1 ? 'triplet' : 'triplets'}.
                    ${this.nodeCount == 1 ? 'The triplet is:' : 'The triplets are:'}
                    <ul>  
                        ${this.inInstance.nodes.map(n => {
                            const nodeName = n.id.slice(NODE_ID_PREFIX.length);

                            return `
                                <li>
                                    ${nodeName} - (
                                        ${HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX + nodeName}, 
                                        ${HCYCLE_HCIRCUIT_ID.GAP_NODE_PREFIX + nodeName}, 
                                        ${HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX + nodeName}
                                    )
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
            mapping: {},
        });

        return { graph, steps };
    }

}
