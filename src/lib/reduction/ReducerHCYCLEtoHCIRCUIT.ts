// Created by phatt-23 on 21/10/2025

import { chunkBy } from "$lib/core/filters";
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

    private createNodeTriplets(): { graph: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        const graph = new Graph();

        this.inInstance.nodes.forEach((n,i) => {

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
                    id: HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX + n.id,
                    label: `${n.label}_{i}`,
                    position: inPos,
                    classes: n.classes
                },
                'gap': {
                    id: HCYCLE_HCIRCUIT_ID.GAP_NODE_PREFIX + n.id,
                    label: `${n.label}_{b}`,
                    position: gapPos,
                    classes: n.classes
                },
                'out': {
                    id: HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX + n.id,
                    label: `${n.label}_{o}`,
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
                    For every node $v \\in V_0$ of the original graph $G_0 = (V_0,E_0)$,
                    create three nodes - $v_{i}$, $v_{o}$ and $v_{b}$. 
                    Each represents a different attribute of the node $v$:
                    
                    <ul>
                        <li>
                            $v_{i}$ is the incoming end,
                        </li>
                        <li>
                            $v_{o}$ is the outgoing end,
                        </li>
                        <li>
                            and $v_{b}$ serves as a bridge between the incoming and outgoing ends. 
                        </li>
                    </ul>
                </p>
                <p>
                    Connect the incoming node $v_i$ and the outgoing node $v_o$ with the bridge node $v_b$.
                </p>
                <p>
                    For this particular graph there will be $|V_0| = ${this.nodeCount}$ node ${this.nodeCount == 1 ? 'triplet' : 'triplets'}.

                    $$
                    \\begin{aligned}
                        V_0 = \\{ 
                            ${
                                chunkBy(
                                    this.inInstance.nodes.map(n => n.label), 
                                    24
                                )
                                    .map(x => `& ${x.join(',')}`)
                                    .join('\\\\')
                            } 
                        \\}
                    \\end{aligned}
                    $$
                    
                    $$
                    \\begin{aligned}
                        ${this.inInstance.nodes.map(n => `
                            ${n.label} & \\rightarrow (${n.label}_i, ${n.label}_b, ${n.label}_o) \\\\
                        `).join('')}
                    \\end{aligned}
                    $$
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
            mapping: {},
        });

        return { graph, steps };
    }

     private connectEdges(graph: Graph): { graph: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        type Conn = {
            from: GraphNode;
            to: GraphNode;
        };

        const edgesConns = new Array<Conn>();

        this.inInstance.edges.forEach(e => {
            
            const fromNode = this.inInstance.nodes.find(n => n.id == e.from)!;
            const toNode = this.inInstance.nodes.find(n => n.id == e.to)!;

            edgesConns.push({ from: fromNode, to: toNode });

            const fromId = HCYCLE_HCIRCUIT_ID.OUTGOING_NODE_PREFIX + fromNode.id
            const toId = HCYCLE_HCIRCUIT_ID.INCOMING_NODE_PREFIX + toNode.id

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
                    For every edge $\\{a,b\\} \\in E_0$ from the original graph $G_0$,
                    connect the nodes $a_o$ and $b_i$ in the reduced graph $G$.
                </p>
                <p>
                    In this particular case, since:
                    
                    $$
                    \\begin{aligned}
                        E_0 = \\{ 
                            ${
                                chunkBy(
                                    edgesConns.map(conn => `( ${conn.from.label!}, ${conn.to.label!} )`), 
                                    12
                                )
                                    .map(x => `& ${x.join(',')}`)
                                    .join('\\\\')
                            } 
                        \\}
                    \\end{aligned}
                    $$
                    
                    we will add these edges:

                    $$
                    \\begin{aligned}
                        ${edgesConns.map(conn => `\\{ ${conn.from.label}_o, ${conn.to.label}_i \\}`).join(' \\\\ ')}
                    \\end{aligned}
                    $$
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
            mapping: {},
        });

        return { graph, steps };
    }

}
