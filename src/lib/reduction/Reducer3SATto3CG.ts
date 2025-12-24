// Created by phatt-23 on 20/12/2025

import { CG3_ID, CNF3_ID, EDGE_ID_PREFIX } from "$lib/core/Id";
import type { CNF3 } from "$lib/instance/CNF3";
import { Graph, type GraphEdge, type GraphNode } from "$lib/instance/Graph";
import { Reducer, type ReductionResult } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

type ReductionPart = { 
    graph: Graph, 
    step: ReductionStep<CNF3, Graph> 
};

export class Reducer3SATto3CG extends Reducer<CNF3, Graph> {

    constructor(i: CNF3) {
        super(i);
    }

    protected doReduce(): ReductionResult<CNF3, Graph> {
        const steps: ReductionStep<CNF3,Graph>[] = [];
        
        const step1 = this.createCoreGadget(new Graph());
        const step2 = this.createVariableGadgets(step1.graph);
        const step3 = this.createClauseGadgets(step2.graph);

        const graph = step3.graph;
        steps.push(step1.step, step2.step, step3.step);

        return {
            outInstance: graph, 
            steps: steps,
        };
    }

    private createClauseGadgets(graph: Graph): ReductionPart {
        const xShift = -this.r;
        const xStep = this.d / this.dc;
        let xCurrent = 0;

        const cutClausePrefix = (id: string) => id.slice(CNF3_ID.CLAUSE_PREFIX.length)

        // add clause nodes
        this.inInstance.clauses.forEach(c => {
            const nodes: GraphNode[] = [];
            const edges: GraphEdge[] = [];

            // add the six
            for (let i = 0; i < 6; i++) {
                const label = cutClausePrefix(c.id) + '-' + i;

                nodes.push({
                    id: CG3_ID.CLAUSE_NODE_PREFIX + label,
                    label: label,
                    position: {
                        x: (xCurrent + ((i % 3) * xStep) + xShift) * this.unit,
                        y: ((i < 3) ? 0 : 1) * this.unit,
                    },
                });
            }

            xCurrent += (this.sc + this.wc) * xStep;

            [ 
                // connect the clause nodes vertically
                [0,3], [1,4], [2,5], 
                // connect T to top line
                [this.coreNodes.T, 0], [this.coreNodes.T, 1], [this.coreNodes.T, 2],
                // connect the bottom line
                [this.coreNodes.T, 3], [3,4], [4,5], [5,this.coreNodes.F]
            ].forEach(c => {
                const from = typeof(c[0]) == "number" ? nodes[c[0]] : c[0];
                const to = typeof(c[1]) == "number" ? nodes[c[1]] : c[1];

                edges.push({
                    id: EDGE_ID_PREFIX + `${from.label}-${to.label}`,
                    from: from.id,
                    to: to.id,
                    classes: 'muted',
                });
            });

            c.literals.forEach((v, i) => {
                const varNode: string = (v.negated 
                    ? CG3_ID.FALSE_VAR_NODE_PREFIX 
                    : CG3_ID.TRUE_VAR_NODE_PREFIX) + v.varName;

                const node: GraphNode = nodes[i];
                
                edges.push({
                    id: EDGE_ID_PREFIX + `${varNode}-${node.label}`,
                    from: varNode,
                    to: node.id,
                });
            });

            nodes.forEach(n => graph.addNode(n));
            edges.forEach(e => graph.addEdge(e));
        });
    
        return {
            graph: graph,
            step: {
                id: 'add-clause-gadgets',
                title: 'Add clause gadgets',
                description: `
                    <p>
                        Create a clause gadget for each clause in the formula 
                        <span>${this.inInstance.asHtmlString()}</span>, namely:

                        <ul>
                            ${this.inInstance.clauses.map(x => {
                                return `
                                    <li>
                                        <span>${x.asHtmlString()}</span>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </p>
                    <p>
                        For some clause <i>C = (X &or; Y &or; Z)</i>, 
                        where <i>X,Y,Z</i> are it's literals (they can be negated) 
                        and <i>x,y,z</i> are the variables,
                        a clause gadget G = (V,E) consists of nodes: <br>
                        <p>
                            <i>V = {X,Y,Z,c0,c1,c2,c3,c4,c5,T,F}</i> <br>
                        </p>
                        and edges: <br>
                        <p>
                            <i>
                                E = { {X,c0}, {Y,c1}, {Z,c2} } &cup; <br>
                                    { {c0,c3}, {c1,c4}, {c2,c5} } &cup; <br>
                                    { {T,c0}, {T,c1}, {T,c2} } &cup; <br>
                                    { {T,c3}, {c3,c4}, {c4,c5}, {c5,F} }
                            </i>
                        </p>
                    </p>
                    <p>
                        The nodes <i>c0,c1,...,c5</i> are unique for each clause gadget.
                    </p>
                    <p>
                        This newly created clause gadget ensures that there exists a valid 3-coloring 
                        iff at least one of the literal nodes <i>X,Y,Z</i> is green, 
                        which would mean that the clause C evaluates to True. 

                        If all of the literal nodes are red, then a valid 3-coloring of the gadget <i>G</i> doesn't exist.
                    </p>
                `,
                inSnapshot: this.inInstance,
                outSnapshot: graph.copy(),
            }
        };
    }

    createVariableGadgets(graph: Graph): ReductionPart {
        
        // just before doing anything, update the control points for edges
        graph.edges.forEach(e => {
            const m = this.r * this.unit;
            e.controlPointDistances = [-m, -m];
        });

        const theta = -45 * Math.PI / 180;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        const y = this.r * sinTheta;       
        const diameter = this.d * cosTheta;
        const radius = diameter / 2;

        let xCurrent = 0;
        const xStep = diameter / this.dv;
        const xShift = -radius;

        // add variable nodes
        this.inInstance.variables.forEach(v => {
            const trueNode: GraphNode = {
                id: CG3_ID.TRUE_VAR_NODE_PREFIX + v,
                position: {
                    x: (xCurrent + xShift) * this.unit, 
                    y: (y) * this.unit,
                },
            };

            const falseNode: GraphNode = {
                id: CG3_ID.FALSE_VAR_NODE_PREFIX + v,
                position: {
                    x: (xCurrent + xStep + xShift) * this.unit,
                    y: (y) * this.unit,
                },
            };

            xCurrent += (this.sv + this.wv) * xStep;

            graph.addNode(trueNode);
            graph.addNode(falseNode);

            const edges: GraphEdge[] = [
                {
                    id: EDGE_ID_PREFIX + v + 'true-false',
                    from: trueNode.id,
                    to: falseNode.id,
                    classes: 'muted'
                },
                {
                    id: EDGE_ID_PREFIX + v + 'true-B',
                    from: trueNode.id,
                    to: CG3_ID.CORE.B,
                    classes: 'muted'
                },
                {
                    id: EDGE_ID_PREFIX + v + 'false-B',
                    from: falseNode.id,
                    to: CG3_ID.CORE.B,
                    classes: 'muted'
                },
            ];

            edges.forEach(e => graph.addEdge(e));
        });

        const step: ReductionStep<CNF3, Graph> = {
            id: 'add-vars',
            title: 'Add variable gadgets',
            description: `
                <p>
                    Create a variable gadget for each variable in the formula 
                    <span>${this.inInstance.asHtmlString()}</span>, namely:

                    <ul>
                        ${this.inInstance.variables.map(v => {
                            return `
                                <li>
                                    ${v}
                                </li>
                            `;
                        }).join('')}
                    </ul>
                    There will be ${this.inInstance.variables.length} variable gadgets, 
                    because there are ${this.inInstance.variables.length} variables.
                </p>
                <p>
                    A variable gadget <i>G = (V,E)</i> for a variable <i>x</i> consists 
                    of three nodes, 
                    <i>V = {x, &not;x, B}</i>, 
                    where the node <i>B</i> is the blue "buffer" node.
                    These nodes nodes are connected in such a way 
                    that makes this gadget <i>G</i> a complete graph, 
                    <i>E = { {x, &not;x}, {x, B}, {&not;x, B} }</i>.
                </p>
                <p>
                    Since the nodes <i>x</i> and <i>&not;x</i> are connected to the B node that is colored blue, 
                    they themselves can only be colored either green, or red. 
                    This encodes the truth assignment for the variable <i>x</i>.
                </p>
                <p>
                    If the node <i>x</i> is green 
                    then the node <i>&not;x</i> must be red, 
                    meaning <i>x &coloneq; True</i>.

                    However, if the node <i>x</i> is red 
                    then the node <i>&not;x</i> must be green, 
                    meaning <i>x &coloneq; False</i>.
                </p>
            `,
            inSnapshot: this.inInstance,
            outSnapshot: graph.copy(),
        };

        return { graph, step };
    }

    createCoreGadget(graph: Graph): ReductionPart {

        // add core nodes and join them together
        const coreNodeValues = Object.values(this.coreNodes);

        const angleStep = 360 / coreNodeValues.length;
        const radStep = angleStep * Math.PI / 180;
        let radCurrent = Math.PI / 6;

        coreNodeValues.forEach(n => {
            n.position = { 
                x: Math.cos(radCurrent) * this.unit,
                y: Math.sin(radCurrent) * this.unit,
            };

            graph.addNode(n);

            radCurrent += radStep;
        });

        [ ['F', 'T'], ['B', 'F'], ['T', 'B'] ].forEach(([x,y]) => {
            const from = this.coreNodes[x];
            const to = this.coreNodes[y];

            graph.addEdge({
                id: EDGE_ID_PREFIX + `${from.label}-${to.label}`,
                from: from.id,
                to: to.id,
                classes: 'muted core'
            });
        });

        graph.edges.forEach(e => {
            e.classes += ' outer-circle';

            const m = this.unit;
            e.controlPointDistances = [-m, -m];
        });

        const step: ReductionStep<CNF3, Graph> = {
            id: 'add-core',
            title: 'Create the core',
            description: `
                <p>
                    Let's assume that the 3 colors are: red, green and blue.
                    The meaning for these colors is that green represents "True" values, 
                    red represents "False" values and blue is a buffer color.
                </p>
                <p>
                    Start by creating the "core" gadget. 
                    The core gadget has three nodes - T, F, B - and they are connected to one another.
                </p>
                <p>
                    The coloring for these nodes is as follows:
                    <ul>
                        <li>
                            T node - green,
                        </li>
                        <li>
                            F node - red,
                        </li>
                        <li>
                            B node - blue.
                        </li>
                    </ul>
                </p>
            `,
            inSnapshot: this.inInstance,
            outSnapshot: graph.copy(),
        }

        graph.nodes.forEach(n => {
            n.position!.x *= this.d * 0.8;
            n.position!.y *= this.d * 0.8;
        });

        graph.edges.forEach(e => {
            const m = this.r * this.unit;
            e.controlPointDistances = [-m, -m];
        });

        
        return { graph, step };
    }

    private get wv() { return 1; } // how big is the gap between variable gadgets
    private get sv() { return 1; } // CONST: how much space does one clause take up

    private get wc() { return 2; } // how big is the gap between clause gadgets
    private get sc() { return 2; } // CONST: how much space does one clause take up

        // space needed by variable gadgets
    private get dv() { 
        return (this.sv + this.wv) * this.inInstance.variables.length - this.wv;    
    }
        // space needed by clause gadgets
    private get dc() {
        return (this.sc + this.wc) * this.inInstance.clauses.length - this.wc;    
    }

    private get d() { return Math.max( this.dv, this.dc ); } // diameter
    private get r() { return this.d / 2; } // radius

    private unit = 80;

    private coreNodes: Record<string, GraphNode> = {
        F: {
            id: CG3_ID.CORE.F,
            label: 'F',
            classes: 'F',
            color: CG3_ID.COLOR_FALSE,
        },
        T: {
            id: CG3_ID.CORE.T,
            label: 'T',
            classes: 'T',
            color: CG3_ID.COLOR_TRUE,
        },
        B: {
            id: CG3_ID.CORE.B,
            label: 'B',
            classes: 'B',
            color: CG3_ID.COLOR_BUFFER,
        },
    };
}
