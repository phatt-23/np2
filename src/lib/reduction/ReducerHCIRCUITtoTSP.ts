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

    copyOver(graph: Graph) {
        const steps: ReductionStep<Graph, Graph>[] = [];

        steps.push({
            id: `copy-over`,
            title: `Copy over the original graph`,
            description: ``,
            mapping: {},
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph,
        });

        return {
            graph,
            steps,
        };
    }

    assignWeightsToExisting(graph: Graph) {
        const steps: ReductionStep<Graph, Graph>[] = [];
        graph.edges.forEach(e => {
            e.weight = 1;
            e.classes += ' solid';
        });

        steps.push({
            id: `assign-weight-1`,
            title: `Assign weights to existing edges`,
            description: `
                <p>
                    For each edge that was in the original graph now assign the weight 1.
                </p>
            `,
            mapping: {},
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph,
        });

        return {
            graph,
            steps,
        };
    }

    addMissingEdges(graph: Graph) {
        const steps: ReductionStep<Graph, Graph>[] = [];

        // fast cache of edgeIds (for checking if they exist)
        const edgeIds = new Set<Id>(this.inInstance.edges.map(e => e.id));
        console.debug('idgeIds.values()', [...edgeIds.values()]);

        const nodeIds = this.inInstance.nodes.map(n => {
            graph.addNode(n);
            return n.id;
        });

        for (let i = 0; i < graph.nodes.length; i++) {
            for (let j = i + 1; j < graph.nodes.length; j++) {
                const ni = nodeIds[i];
                const nj = nodeIds[j];

                const edgeId = EDGE_ID_PREFIX + `${ni}-${nj}`;
                const edgeIdMirror = EDGE_ID_PREFIX + `${nj}-${ni}`;
                const edgeExists = edgeIds.has(edgeId) || edgeIds.has(edgeIdMirror);

                console.debug('check existence of', edgeId, edgeIdMirror);

                if (!edgeExists) {
                    graph.addEdge({
                        id: edgeId,
                        from: ni,
                        to: nj,
                        weight: 2,
                        classes: 'muted',
                    });
                }
            }
        }

        steps.push({
            id: `add-missing-edges`,
            title: `Add missing edges`,
            description: `
                <p>
                    Connect all the nodes that weren't connect before by a new edge and assign a weight of 2 to this new edge.
                </p>
            `,
            mapping: {},
            inSnapshot: this.inInstance.copy(),
            outSnapshot: graph,
        });

        return {
            graph,
            steps,
        };

    }

    protected doReduce(): { outInstance: Graph; steps: ReductionStep<Graph, Graph>[]; } {
        const steps: ReductionStep<Graph, Graph>[] = [];

        steps.push({
            id: `reduce-hcircuit-to-tsp-1`,
            title: `Create complete graph`,
            description: `
                <p> 
                    Take all of the nodes from the original graph and add an edge between each of them (make a complete graph).
                    For every edge that exists in the original instance, assign a weight of 1.
                    Otherwise assign some weight larger than 1.
                </p>
                <p>
                    There is ${this.nodeCount} nodes, 
                    which means there will be (${this.nodeCount} * ${this.nodeCount - 1}) / 2 = ${(this.nodeCount * (this.nodeCount - 1)) / 2} edges, 
                    for it to be complete.
                </p>
                <p>
                    Now this problem can expressed by a decision question:
                    Is there a hamiltonian cycle such that the cost of the traversal is less than or equal to ${this.nodeCount}?
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            mapping: {},
        });

        const step1 = this.copyOver(this.inInstance.copy());
        steps.push(...step1.steps);

        const step2 = this.assignWeightsToExisting(step1.graph.copy());
        steps.push(...step2.steps);

        const step3 = this.addMissingEdges(step2.graph.copy());
        steps.push(...step3.steps);

        const outInstance = step3.graph;

        return {
            outInstance,
            steps,
        }

    }

}
