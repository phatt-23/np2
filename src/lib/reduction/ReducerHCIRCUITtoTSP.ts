// Created by phatt-23 on 21/10/2025

import { EDGE_ID_PREFIX, NODE_ID_PREFIX, type Id } from "$lib/core/Id";
import { Graph } from "$lib/instance/Graph";
import { Reducer } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

export class ReducerHCIRCUITtoTSP extends Reducer<Graph, Graph> {
    nodeCount: number;

    constructor(inInstance: Graph) {
        super(inInstance);

        this.nodeCount = this.inInstance.nodes.length;
    }

    protected doReduce(): { outInstance: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        // steps.push({
        //     id: `reduce-hcircuit-to-tsp-1`,
        //     title: `Overview`,
        //     description: `
        //         <p> 
        //             To create a reduced instance graph $G = (V,E)$ for TSP 
        //             from an instance graph $G_0 = (V_0, E_0)$ from HCIRCUIT,
        //             take all of the nodes from $V_0$ and add them to $G$.

        //             $$
        //                 V = V_0
        //             $$
        //         </p>
        //         <p>
        //             Then, add an edge between each of them (make a complete graph).
                    
        //             $$
        //                 E = \\{ \\{ v_1, v_2 \\} | v_1, v_2 \\in V_0 \\}
        //             $$

        //             The number of nodes in $G$ is $|V| = ${this.nodeCount}$, 
        //             which means there will be $ |E| = (${this.nodeCount} \\cdot ${this.nodeCount - 1}) / 2 = ${(this.nodeCount * (this.nodeCount - 1)) / 2} $ edges, 
        //             for the graph to be complete.
        //         </p>
        //         <p>

        //             For every edge, that exists in the original instance $G_0$, assign the weight to 1.
        //             Otherwise, assign some weight greater than 1.
        //             The function $w(e)$, assigning weights to edges in $E$, may be defined as:

        //             $$
        //             \\begin{aligned}
        //                 w(e) =
        //                 \\begin{cases}
        //                     1 & \\text{if} \\mathbin{} e \\in E_0 \\\\
        //                     2 & \\text{otherwise}  
        //                 \\end{cases}
        //             \\end{aligned}
        //             $$
        //         </p>
        //         <p>
        //             Let $k$ be the maximal cost of the hamiltonian path in the graph $G$. Set $k$ to the number of nodes $|V|$.
        //             $$
        //                 k = |V| = ${this.nodeCount}
        //             $$  
        //         </p>
        //         <p>
        //             Now, the TSP problem can expressed by a question:
                        
        //             Does the graph $G=(V,E)$ contain a hamiltonian path $P$ of length $|V|$,  
        //             such that the cost of the traversed path $k_P$ is less than or equal to $k$?

        //             In other words, does this statement hold?

        //             $$
        //                 k_P = \\sum_{i = 0}^{|V| - 2} w(\\{ P_i, P_{i + 1} \\}) \\leq k
        //             $$

        //             If so, the original graph $G_0$ contains a hamiltonian circuit, otherwise it doesn't.
        //         </p>
        //     `,
        //     inSnapshot: this.inInstance.copy(),
        //     mapping: {},
        // });

        const graph = new Graph(); 

        const part1 = this.copyVertices(graph);
        const part2 = this.createEdges(part1.graph);
        const part3 = this.assignWeights(part2.graph); 

        steps.push(part1.step, part2.step, part3.step);

        const outInstance = part3.graph;

        return {
            outInstance,
            steps,
        }

    }


    copyVertices(graph: Graph) {
        this.inInstance.nodes.forEach(n => graph.addNode(n));
        
        const step = {
            id: `copy-vertices`,
            title: `Copy vertices`,
            description: `
                <p> 
                    To create a reduced graph instance $G = (V,E)$ for TSP 
                    from a graph instance $G_0 = (V_0, E_0)$ from HCIRCUIT,
                    take all of the nodes from $V_0$ and add them to $G$.

                    $$
                        V = V_0 = \\{ ${graph.nodes.map(n => `${n.label}`).join(',')} \\}
                    $$
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
        };

        return { graph, step };
    }

    createEdges(graph: Graph) {
        const edgeLabels: string[] = [];

        for (let i = 0; i < graph.nodes.length; i++) {
            for (let j = i + 1; j < graph.nodes.length; j++) {
                const ni = graph.nodes[i];
                const nj = graph.nodes[j]; 

                edgeLabels.push(`\\{ ${ni.label}, ${nj.label} \\}`);

                graph.addEdge({
                    id: EDGE_ID_PREFIX + `${ni.id}-${nj.id}`,
                    from: ni.id,
                    to: nj.id, 
                });
            }         
        }
        
        // tex for edges
        // breaking a newline at every sixth pair
        const chunkSize = 6;
        const chunks = [];

        for (let i = 0; i < edgeLabels.length; i += chunkSize) {
            chunks.push(edgeLabels.slice(i, i + chunkSize).join(', '));
        }

        const latex = `
            \\begin{aligned}
                E = \\{&
                    ${chunks.join(' \\\\\n& ')}
                \\}
            \\end{aligned}
        `;

        const step = {
            id: `create-edges`,
            title: `Create edges`,
            description: `
                <p>
                    Then, add an edge between each pair a vertices to create a complete graph.
                    
                    $$
                        E = \\{ \\{ v_1, v_2 \\} | v_1, v_2 \\in V_0 \\}
                    $$

                    The number of nodes in $G$ is $|V| = ${this.nodeCount}$, 
                    which means there will be $ |E| = (${this.nodeCount} \\cdot ${this.nodeCount - 1}) / 2 = ${(this.nodeCount * (this.nodeCount - 1)) / 2} $ edges, 
                    for the graph to be complete.

                    $$
                        ${latex}
                    $$
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
        };

        return { graph, step };
    }

    assignWeights(graph: Graph) {
        graph.edges.forEach(e => {
            const y = this.inInstance.edges.find(x => x.from === e.from && x.to === e.to || x.to === e.from && x.from === e.to);

            if (y) {
                e.weight = 1;
            } else {
                e.weight = 2;
                e.classes += 'muted';
            }
        });
        
        const step = {
            id: `assing-weights`,
            title: `Assign weights`,
            description: `
                <p>
                    For every edge, that exists in the original instance $G_0$, assign the weight to 1.
                    Otherwise, assign some weight greater than 1.
                    The function $w(e)$, assigning weights to edges in $E$, may be defined as:

                    $$
                    \\begin{aligned}
                        w(e) =
                        \\begin{cases}
                            1 & \\text{if} \\mathbin{} e \\in E_0 \\\\
                            2 & \\text{otherwise}  
                        \\end{cases}
                    \\end{aligned}
                    $$
                </p>
                <p>
                    Let $k$ be the maximal cost of the hamiltonian path in the graph $G$. Set $k$ to the number of nodes $|V|$.
                    $$
                        k = |V| = ${this.nodeCount}
                    $$  
                </p>
                <p>
                    Now, the TSP problem can expressed by a question:
                        
                    Does the graph $G=(V,E)$ contain a hamiltonian path $P$ of length $|V|$,  
                    such that the cost of the traversed path $k_P$ is less than or equal to $k$?

                    In other words, does this statement hold?

                    $$
                        k_P = \\sum_{i = 0}^{|V| - 2} w(\\{ P_i, P_{i + 1} \\}) \\leq k
                    $$

                    If so, the original graph $G_0$ contains a hamiltonian circuit, otherwise it doesn't.
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph.copy(),
        };

        return { graph, step };
    }
}
