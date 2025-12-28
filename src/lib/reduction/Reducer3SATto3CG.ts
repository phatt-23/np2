// Created by phatt-23 on 20/12/2025

import { CG3_ID, CNF3_ID, EDGE_ID_PREFIX } from "$lib/core/Id";
import type { Clause, CNF3 } from "$lib/instance/CNF3";
import { Graph, type GraphEdge, type GraphNode } from "$lib/instance/Graph";
import { Reducer, type ReductionResult } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

type ReductionPart = { 
    graph: Graph, 
    step: ReductionStep<CNF3, Graph> 
};

const RED = `\\color{red}{red}`
const GREEN = `\\color{green}{green}`
const BLUE = `\\color{blue}{blue}`

const clauseToTriplet = (c: Clause) => `( ${c.literals.map(l => (l.negated ? '\\lnot{}' : '') + l.varName).join(',')} )`;

function chunkBy<T>(x: T[], chunkSize: number) {
    let currentX = x.slice(0);
    const chunks: T[][] = [];

    while (currentX.length > chunkSize) {
        const chunk = currentX.slice(0, chunkSize);
        chunks.push(chunk);
        currentX = currentX.slice(chunkSize);
    }

    chunks.push(currentX);
    return chunks;
}

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
            title: 'Create the core gadget',
            description: `
                <p>
                    Let's assume that the 3 colors are 
                        $${RED}$, 
                        $${GREEN}$ 
                        and $${BLUE}$.
                </p>
                <p>
                    The colors hold some semantic meaning:

                    <ul>
                        <li>
                            $${GREEN}$ represents $True$ values
                        </li>
                        <li>
                            $${RED}$ represents $False$ values 
                        </li>
                        <li>
                            and $${BLUE}$ is a buffer color.
                        </li>
                    </ul>
                </p>
                <p>
                    We start by creating the core gadget $G_C = (V_C,E_C)$. 
                    The core gadget has three nodes and they are all connected to one another.
                    $$ 
                        \\begin{aligned}

                        V_C &= \\{ T, F, B \\} \\\\
                        E_C &= \\{ \\{T,F\\}, \\{F,B\\}, \\{B,T\\} \\} \\\\

                        \\end{aligned}

                    $$

                </p>
                <p>
                    The coloring for these nodes is the following:

                    $$
                        \\begin{aligned}

                        color(T) &= ${GREEN} \\\\
                        color(F) &= ${RED}    \\\\
                        color(B) &= ${BLUE}   \\\\

                        \\end{aligned}
                    $$
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
                label: `${v}`,
                position: {
                    x: (xCurrent + xShift) * this.unit, 
                    y: (y) * this.unit,
                },
            };

            const falseNode: GraphNode = {
                id: CG3_ID.FALSE_VAR_NODE_PREFIX + v,
                label: `\\lnot{${v}}`,
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
            title: 'Create variable gadgets',
            description: `
                <p>
                    Create a variable gadget for each variable $\\nu \\in \\Nu$ of the boolean formula $\\Phi = (\\Nu, \\Kappa)$, 
                    where $\\Nu$ is the set of variables

                    $$
                        \\Nu = \\{ ${this.inInstance.variables.join(',')} \\}
                    $$

                    and $\\Kappa$ is the set of clauses

                    $$
                    \\begin{aligned}
                        \\Kappa = \\{ ${ chunkBy(this.inInstance.clauses.map(c => clauseToTriplet(c)), 3).map(x => `& ${x.join(',')}`).join('\\\\') } \\} \\\\
                    \\end{aligned}
                    $$

                    There will be $|\\Nu| = ${this.inInstance.variables.length}$ variable gadgets.
                </p>
                <p>
                    A variable gadget $ G_{\\nu} = (V_{\\nu},E_{\\nu}) $ for a variable $\\nu$ 
                    consists of three nodes,

                    $$
                        V_{\\nu} = \\{ \\nu, \\lnot{\\nu}, B \\}
                    $$

                    where the node $B$ is the blue "buffer" node.

                    These nodes are each connected to one another,  
                    $$ 
                        E = \\{ \\{ \\nu, \\lnot{\\nu} \\}, \\{ \\nu, B \\}, \\{ \\lnot{\\nu}, B \\} \\}
                    $$

                    making it a complete graph.
                </p>
                <p>
                    Since the nodes $\\nu$ and $\\lnot{\\nu}$ are connected to the $B$ node that is colored $${BLUE}$, 
                    they themselves can only be colored either $${GREEN}$, or $${RED}$. 

                    This encodes the truth assignment for the variable $\\nu$, because only these 2 cases can occur.
                    <ul>
                        <li>
                            If the node $\\nu$ is $${GREEN}$
                            then the node $\\lnot{\\nu}$ must be $${RED}$, 
                            meaning $\\nu = True$.
                        </li>
                        <li>
                            If the node $\\nu$ is $${RED}$
                            then the node $\\lnot{\\nu}$ must be $${GREEN}$, 
                            meaning $\\nu = False$.
                        </li>
                    </ul>
                </p>
            `,
            inSnapshot: this.inInstance,
            outSnapshot: graph.copy(),
        };

        return { graph, step };
    }

    private createClauseGadgets(graph: Graph): ReductionPart {
        const xShift = -this.r;
        const xStep = this.d / this.dc;
        let xCurrent = 0;

        const cutClausePrefix = (id: string) => id.slice(CNF3_ID.CLAUSE_PREFIX.length)

        // add clause nodes
        this.inInstance.clauses.forEach((c,cindex) => {
            const nodes: GraphNode[] = [];
            const edges: GraphEdge[] = [];

            // add the six
            for (let i = 0; i < 6; i++) {
                const label = cutClausePrefix(c.id) + '-' + i;

                nodes.push({
                    id: CG3_ID.CLAUSE_NODE_PREFIX + label,
                    label: `\\kappa_{${cindex},${i}}`,
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
                        Create a clause gadget for each clause $\\kappa \\in \\Kappa$ in the formula $\\Phi$, namely:

                        $$
                        \\begin{aligned}
                            ${this.inInstance.clauses.map((c, i) => `
                                \\kappa_{${i}} &= ${clauseToTriplet(c)} \\\\
                            `).join('')}
                        \\end{aligned}
                        $$

                        There will be $|\\Kappa| = ${this.inInstance.clauses.length}$ clause gadgets.
                    </p>
                    <p>
                        For some clause $\\kappa = (\\Alpha, \\Beta, \\Gamma)$, 
                        where $\\Alpha$, $\\Beta$ and $\\Gamma$ are it's literals (they can be negated) 
                        and $\\alpha$, $\\beta$ and $\\gamma$ are the variables,
                        a clause gadget $G_{\\kappa} = (V_{\\kappa},E_{\\kappa})$ is defined as:

                        $$
                            V_{\\kappa} = \\{ \\Alpha, \\Beta, \\Gamma, \\kappa_0, \\kappa_1, \\kappa_2, \\kappa_3, \\kappa_4, \\kappa_5, T, F \\}
                        $$

                        $$
                        \\begin{aligned}
                            E_{\\kappa} = \\{
                                &{ 
                                    \\{\\Alpha,\\kappa_0\\}, 
                                    \\{\\Beta,\\kappa_1\\}, 
                                    \\{\\Gamma,\\kappa_2\\} 
                                } \\\\
                                &{ 
                                    \\{\\kappa_0,\\kappa_3\\}, 
                                    \\{\\kappa_1,\\kappa_4\\}, 
                                    \\{\\kappa_2,\\kappa_5\\} 
                                } \\\\
                                &{ 
                                    \\{T,\\kappa_0\\}, 
                                    \\{T,\\kappa_1\\}, 
                                    \\{T,\\kappa_2\\} 
                                } \\\\
                                &{ 
                                    \\{T,\\kappa_3\\}, 
                                    \\{\\kappa_3,\\kappa_4\\}, 
                                    \\{\\kappa_4,\\kappa_5\\}, 
                                    \\{\\kappa_5,F\\} 
                                }
                            \\}
                        \\end{aligned}
                        $$
                    </p>
                    <p>
                        Note that the nodes $\\kappa_0,\\kappa_1,\\ldots,\\kappa_5$ are unique for each clause gadget.
                    </p>
                    <p>
                        A valid 3-coloring for the gadget $G_{\\kappa}$ exist,
                        iff at least one of the literal nodes, $\\Alpha$, $\\Beta$ or $\\Gamma$, is $${GREEN}$,
                        This would correspond to the clause $\\kappa$ being satisfied, because at least one of its literals is evaluated to $True$.
                    </p>
                    <p>
                        However, if all the 3 literal nodes are $${RED}$, then a valid 3-coloring for the gadget $G_{\\kappa}$ doesn't exist.
                        Since all 3 literals nodes are $${RED}$, this means that they all evaluate to $False$ and the clause $\\kappa$ is not satisfied.
                    </p>
                `,
                inSnapshot: this.inInstance,
                outSnapshot: graph.copy(),
            }
        };
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
