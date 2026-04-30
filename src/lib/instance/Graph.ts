//
// Created by phatt-23 on 11/10/2025
//

import { ProblemInstance } from "./ProblemInstance";
import Serializer from "$lib/core/Serializer";
import { EDGE_ID_PREFIX, NODE_ID_PREFIX, PREFIX_AND_ID_DELIM, type Id } from "$lib/core/Id";
import { assert, type ErrorMessage } from "$lib/core/assert";
import { onlyUnique } from "$lib/core/filters";
import { errLabelMessage, isValidLabel } from "./labelValidation";

export type Position = {
    x: number;
    y: number;
}

export type GraphEdge = {
    id: Id;
    from: Id;
    to: Id;
    weight?: number;
    classes?: string;
    controlPointDistances?: number[];  
}

export type GraphNode = {
    id: Id;
    label?: string;
    texLabel?: string;
    color?: number;  
    position?: Position;
    classes?: string;
}

@Serializer.SerializableClass()
export class Graph extends ProblemInstance {
    public _nodes: Set<GraphNode>;
    public _edges: Set<GraphEdge>;

    public constructor() {
        super();
        this._nodes = new Set();
        this._edges = new Set();
    }

    public addNode(node: GraphNode) {

        // if there's a node with the same id, don't add it
        if (this.nodes.find(n => n.id == node.id)) 
            return;

        if (node.classes == undefined) {
            node.classes = '';
        }

        if (!node.label) {
            node.label = node.id;
        }

        if (!node.texLabel) {
            node.texLabel = node.label;
        }

        this._nodes.add(node);
    }
    public addEdge(edge: GraphEdge, directed: boolean = true) {
        if (edge.classes == undefined) {
            edge.classes = '';
        }

        // if the graph is undirected and aleady has an edge between nodes n1 and n2, don't add it
        const n1 = edge.to;
        const n2 = edge.from;
        if (!directed && this.edges.find(e => e.to == n1 && e.from == n2 || e.to == n2 && e.from == n1)) 
            return;

        // doesn't matter how many control points
        // if (edge.controlPointDistances == undefined) {
        //     edge.controlPointDistances = [0,0];
        // }
        // assert(edge.controlPointDistances.length == 2, 
        //     "There must be 2 control points.");

        // if there's an edge with the same id, don't add it
        if (this.edges.find(e => e.id == edge.id)) 
            return;

        this._edges.add(edge);
    }

    assignEdgeWeight(edgeId: string, weight: number) {
        const e = this.edges.find(x => x.id == edgeId)
        if (e) {
            e.weight = weight;
        }
    }

    public get nodes() : Array<GraphNode> {
        return Array.from(this._nodes.values());
    }
    public get edges() : Array<GraphEdge> {
        return Array.from(this._edges.values());
    }

    public removeNode(node: GraphNode) {
        if (!this._nodes.has(node)) return;
        this._nodes.delete(node);
        // remove edges incident to 'node'
        const edgesToRemove = Array.from(this.edges).filter(e => e.to === node.id || e.from === node.id);
        edgesToRemove.forEach(edge => this._edges.delete(edge));
    }
    public removeEdge(edge: GraphEdge) { 
        this._edges.delete(edge);
    }
    public removeEdgeById(id: string) { 
        const edge = this.edges.find(e => e.id == id);
        if (edge) {
            this._edges.delete(edge);
        }
    }
    public isEmpty() : boolean {
        return this.nodes.length == 0; 
    }

    public copy(): Graph {
        const newGraph = new Graph();

        // Deep copy nodes
        for (const node of this._nodes) {
            newGraph.addNode({
                id: node.id,
                label: node.label,
                texLabel: node.texLabel,
                color: node.color,
                position: node.position ? { ...node.position } : undefined,
                classes: node.classes,
            });
        }

        // Deep copy edges
        for (const edge of this._edges) {
            newGraph.addEdge({
                id: edge.id,
                from: edge.from,
                to: edge.to,
                weight: edge.weight,
                classes: edge.classes,
                controlPointDistances: edge.controlPointDistances,
            });
        }

        return newGraph;
    }

    public asString() : string {
        // const nodeLines = this.nodes.map(n => n.id.slice(NODE_ID_PREFIX.length)).join('\n');
        const nodeLines = this.nodes.map(n => n.label!).join('\n');
        // const edgeLines = this.edges.map(e => e.from.slice(NODE_ID_PREFIX.length) + ' ' + e.to.slice(NODE_ID_PREFIX.length) + (e.weight != undefined ? ' ' + e.weight : '')).join('\n');
        const edgeLines = this.edges.map(e => 
              this.nodes.find(n => n.id == e.from)!.label! 
            + ' ' 
            + this.nodes.find(n => n.id == e.to)!.label! 
            + (e.weight != undefined ? ' ' + e.weight : '')
        ).join('\n');

        return nodeLines + '\n' + edgeLines + '\n';
    }

    public static fromString(text: string, directed: boolean): Graph | ErrorMessage {
        if (text.length == 0) {
            return "Cannot construct a graph from an empty string.";
        }

        const lines = text.split('\n').map(x => x.trim()).filter(x => x.length).filter(onlyUnique);
        let graph = new Graph();

        const errNodeLabel = `Invalid node label. ${errLabelMessage}`;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            const words = line.split(" ").map(w => w.trim()).filter(w => w.length);
            
            // single node
            if (words.length == 1) {
                const n = words[0];

                if (!isValidLabel(n)) 
                    return `${errNodeLabel} The line: ${line}`;

                graph.addNode({
                    id: NODE_ID_PREFIX + n,
                    label: n,
                });
            }

            // edge between n1 and n2 (optional weight)
            else if (words.length <= 3) {
                const n1 = words[0];
                const n2 = words[1];

                if (!isValidLabel(n1) || !isValidLabel(n2)) 
                    return `${errNodeLabel} The line: ${line}`;

                let w = undefined;
                if (words.length == 3) {

                    function isStringNumber(value: string): boolean {
                        return /^[0-9]+$/.test(value);
                    }

                    if (!isStringNumber(words[2])) {
                        return `
                            Encountered illegal syntax on line ${i}. 
                            Couldn't parse the weight "${words[2]}".
                            Please enter an integer.
                            The line: "${line}"
                        `;
                    }

                    w = Number.parseFloat(words[2]);
                }


                const fromNodeId = NODE_ID_PREFIX + n1;
                const toNodeId = NODE_ID_PREFIX + n2;

                graph.addNode({ id: fromNodeId, label: n1 });
                graph.addNode({ id: toNodeId, label: n2 });

                graph.addEdge({
                    id: EDGE_ID_PREFIX + `${fromNodeId}-${toNodeId}`,
                    from: fromNodeId,
                    to: toNodeId,
                    weight: w,
                }, directed);
            }
            else {
                return `
                    Encountered illegal syntax on line ${i}. 
                    Expected of these "{x}" or "{x} {y}" or "{x} {y} {w?}" on a single line, where {x} and {y} are node labels and {w?} is optional weight. 
                    Instead got: "${line}"`;
            }
        }

        if (graph.isEmpty()) {
            return "The graph is empty.";
        }

        return graph;
    }

    public toSerializedString(): string {
        const data = {
            nodes: this.nodes.map(n => ({
                id: n.id,
                label: n.label ?? null,
                texLabel: n.texLabel ?? null,
                color: n.color ?? null,
                position: n.position ?? null,
                classes: n.classes ?? '',
            })),
            edges: this.edges.map(e => ({
                id: e.id,
                from: e.from,
                to: e.to,
                weight: e.weight ?? null,
                classes: e.classes ?? '',
                controlPointDistances: e.controlPointDistances ?? [0,0],
            })),
        };
        return JSON.stringify(data, null);
    }

    public static fromSerializedString(serialized: string): Graph {
        const data = JSON.parse(serialized);
        const graph = new Graph();

        if (Array.isArray(data.nodes)) {
            for (const node of data.nodes) {
                graph.addNode({
                    id: node.id,
                    label: node.label ?? undefined,
                    texLabel: node.texLabel ?? undefined,
                    color: node.color ?? undefined,
                    position: node.position ?? undefined,
                    classes: node.classes ?? '',
                });
            }
        }

        if (Array.isArray(data.edges)) {
            for (const edge of data.edges) {
                graph.addEdge({
                    id: edge.id,
                    from: edge.from,
                    to: edge.to,
                    weight: edge.weight ?? undefined,
                    classes: edge.classes ?? '',
                    controlPointDistances: edge.controlPointDistances ?? [0,0],
                });
            }
        }

        return graph;
    }

    /*
     * Labels the edges used in the path.
     * It adds classes 'solved' and 'used'.
     */
    public labelSolved({
        path = [],
        directed = false,
        edgeIdUsesNodeIds = true,  // todo: remove this, all reductions should use the same edge naming scheme (use the whole node ids, don't cut the prefix)
    }: {
        path?: GraphNode[]
        directed?: boolean
        edgeIdUsesNodeIds?: boolean
    } = {}) {
        const preprocess = edgeIdUsesNodeIds 
            ? ( (id: string) => id )  // id function
            : ( (id: string) => id.slice(id.search(PREFIX_AND_ID_DELIM) + 1) ); // cuts the prefix

        this.edges.forEach(e => e.classes += ' solved');

        for (let i = 0; i < path.length - 1; i++) {
            const from = preprocess(path[i].id);
            const to = preprocess(path[i + 1].id);

            const edgeId = EDGE_ID_PREFIX + `${from}-${to}`;
            const edgeIdMirror = EDGE_ID_PREFIX + `${to}-${from}`;
            const edge = this.edges.find(e => (e.id == edgeId) || (!directed && e.id == edgeIdMirror));

            if (edge) {
                edge.classes += ' used';
            }
        }
    }


    /*
     * Removes the 'solved' and 'used' classes added by labelSolved method.
     */
    public unlabelSolved() {
        this._edges.forEach(e => {
            if (!e.classes) {
                return
            }

            e.classes = e.classes.replaceAll('used', '');
            e.classes = e.classes.replaceAll('solved', '');
        })
    }
}
