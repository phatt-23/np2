//
// Created by phatt-23 on 11/10/2025
//

import { chunkBy, clauseToTriplet } from "$lib/core/filters";
import { 
    EDGE_ID_PREFIX, 
    NODE_ID_PREFIX, 
    NODE_ID_PREFIX_CLAUSE, 
    NODE_ID_PREFIX_FALSE, 
    NODE_ID_PREFIX_INBETWEEN, 
    NODE_ID_PREFIX_SPECIAL, 
    NODE_ID_PREFIX_TRUE, 
    SOURCE_NODE_ID,
    TARGET_NODE_ID
} from "$lib/core/Id";
import type { CNF3, Literal } from "$lib/instance/CNF3";
import { Graph, type GraphEdge, type GraphNode } from "$lib/instance/Graph";
import { Reducer, type ReductionResult } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

type ReductionPartialResult = { 
    graph: Graph, 
    interSteps: ReductionStep<CNF3, Graph>[] 
}

const SOURCE_NODE_LABEL = `\\alpha^{(source)}`;
const TARGET_NODE_LABEL = `\\beta^{(target)}`;

export class Reducer3SATtoHCYCLE extends Reducer<CNF3, Graph> {
    private rowNodeCount: number;
    private rowXOffset: number;
    private varCount: number;
    private clauseCount: number;
    private clauseHeight: number;
    private varHeight: number;
    private yStep: number;
    private yOffset: number;
    private xDist = 50;
    private yDist = 300;

    public constructor(inInstance: CNF3) {
        super(inInstance);
        const { variables, clauses } = this.inInstance;


        this.varCount = variables.length;
        this.clauseCount = clauses.length;

        this.clauseHeight = (this.clauseCount - 0.5) * (this.yDist);
        this.varHeight = (this.varCount - 1) * this.yDist;
        this.yStep = (this.clauseHeight) / Math.max( 1, this.clauseCount - 1 ); 
        this.yOffset = (this.varHeight - this.clauseHeight) / 2;

        this.rowNodeCount = 3 * clauses.length + 3;
        this.rowXOffset = (this.rowNodeCount - 1)/2 * this.xDist;
    }

    protected doReduce(): ReductionResult<CNF3, Graph> {
        let steps : ReductionStep<CNF3, Graph>[] = [];

        const step1 = this.createVarGadgets();
        const step2 = this.createClauseGadgets(step1.graph.copy());

        steps.push(...step1.interSteps);
        steps.push(...step2.interSteps);

        return {
            outInstance: step2.graph,
            steps,
        }
    }

    private createVarGadgets(): ReductionPartialResult {
        /**
         * Let k = number of clauses.
         */
        const { variables } = this.inInstance;


        /**
         * I want to show these steps:
         *     1. Create individual variable gadgets - only the row nodes.
         *     2. Create the source, inbetween and target nodes and connect the row ends.
         */

        let firstGraph = new Graph();
        let secondGraph = new Graph();

        let interSteps: ReductionStep<CNF3, Graph>[] = [];

        const inbetweenLabels: string[] = []; 

        /**
         * For every variable create a varible gadget
         * with 3k + 3 row nodes and connect them up.
         */
        variables.forEach((v, i) => {
            if (i == 0) {
                /**
                 * For the first variable, there is no other 
                 * layer above it, add the source node.
                 */
                secondGraph.addNode({ 
                    id: NODE_ID_PREFIX_SPECIAL + SOURCE_NODE_ID, 
                    label: SOURCE_NODE_LABEL, 
                    position: { x: 0, y: i * this.yDist - this.yDist/2 },
                    classes: 'source'
                }); 

                /**
                 * Add edges from source to row ends of this first variable.
                 */
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${SOURCE_NODE_ID}-${v}^{(1)}`, 
                    from:   NODE_ID_PREFIX_SPECIAL + `${SOURCE_NODE_ID}`, 
                    to:     NODE_ID_PREFIX_TRUE + `${v}^{(1)}`, 
                    classes: 'muted',
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${SOURCE_NODE_ID}-${v}^{(${this.rowNodeCount})}`, 
                    from:   NODE_ID_PREFIX_SPECIAL + `${SOURCE_NODE_ID}`, 
                    to:     NODE_ID_PREFIX_FALSE + `${v}^{(${this.rowNodeCount})}`,
                    classes: 'muted',
                });

            } else {
                /**
                 * For other variables, there is layer above it 
                 * that needs to be wired to the inbetween node.
                 */
                const inbetweenNode = `${variables[i - 1]}^{(${v})}`;
                const label = `(${variables[i - 1]},${v})`;
                inbetweenLabels.push(label);

                /**
                 * Add the inbetween node.
                 */
                secondGraph.addNode({ 
                    id: NODE_ID_PREFIX_INBETWEEN + `${inbetweenNode}`, 
                    label: label,
                    position: { x: 0, y: i * this.yDist - this.yDist/2 },
                    classes: 'inbetween'
                }); 

                /**
                 * Connect above gadget's row ends into this inbetween node.
                 */ 
                const prevVar = variables[i - 1];
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${prevVar}^{(1)}-${inbetweenNode}`, 
                    from:   NODE_ID_PREFIX_TRUE + `${prevVar}^{(1)}`, 
                    to:     NODE_ID_PREFIX_INBETWEEN + inbetweenNode,
                    classes: 'muted'
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${prevVar}^{(${this.rowNodeCount})}-${inbetweenNode}`, 
                    from:   NODE_ID_PREFIX_FALSE + `${prevVar}^{(${this.rowNodeCount})}`, 
                    to:     NODE_ID_PREFIX_INBETWEEN + inbetweenNode,
                    classes: 'muted'
                });

                /** 
                 * Connect this inbetween node to current variable's row ends.
                 */ 
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${inbetweenNode}-${v}^{(1)}`, 
                    from:   NODE_ID_PREFIX_INBETWEEN + `${inbetweenNode}`,
                    to:     NODE_ID_PREFIX_TRUE + `${v}^{(1)}`, 
                    classes: 'muted'
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${inbetweenNode}-${v}^{(${this.rowNodeCount})}`, 
                    from:   NODE_ID_PREFIX_INBETWEEN + `${inbetweenNode}`,
                    to:     NODE_ID_PREFIX_FALSE + `${v}^{(${this.rowNodeCount})}`, 
                    classes: 'muted'
                });
            }

            /**
             * Create row nodes and connect them bidirectionally.
             */
            for (let j = 1; j <= this.rowNodeCount - 1; j++) {
                const current = `${v}^{(${j})}`;
                const currentLabel = `${v}^{(${j})}`;
                const next = `${v}^{(${j + 1})}`;
                const nextLabel = `${v}^{(${j + 1})}`;

                let classes = ''; 
                let currentPrefix = NODE_ID_PREFIX;
                let nextPrefix = NODE_ID_PREFIX;

                // first is 'true'
                if (j == 1) {
                    classes += ' true';
                    currentPrefix = NODE_ID_PREFIX_TRUE;
                }
                else if (j == this.rowNodeCount - 1) {
                    classes += ' guarantee';
                    nextPrefix = NODE_ID_PREFIX_FALSE;
                }
                else if ((j + 1) % 3 == 0) {
                    classes += ' guarantee';
                }

                const node: GraphNode = { 
                    id: currentPrefix + current, 
                    label: currentLabel,
                    position: { 
                        x: (j - 1) * this.xDist - this.rowXOffset,
                        y: i * this.yDist 
                    },
                    classes: classes,
                };

                firstGraph.addNode(node);
                secondGraph.addNode(node); 

                // last is 'false'
                if (j == this.rowNodeCount - 1) {
                    const node : GraphNode = { 
                        id: nextPrefix + next, 
                        label: nextLabel,
                        position: { 
                            x: j * this.xDist - this.rowXOffset,
                            y: i * this.yDist 
                        },
                        classes: 'false' 
                    }
                    firstGraph.addNode(node); 
                    secondGraph.addNode(node); 
                }

                const edge1 : GraphEdge = {
                    id:     EDGE_ID_PREFIX + `${current}-${next}`,
                    from:   currentPrefix + `${current}`,
                    to:     nextPrefix + `${next}`,
                    classes: 'muted'
                }

                const edge2 : GraphEdge = {
                    id:     EDGE_ID_PREFIX + `${next}-${current}`,
                    from:   nextPrefix + `${next}`,
                    to:     currentPrefix + `${current}`,
                    classes: 'muted'
                }
                firstGraph.addEdge(edge1);
                firstGraph.addEdge(edge2);
                secondGraph.addEdge(edge1);
                secondGraph.addEdge(edge2);
            }

            /**
             * The last iteration.
             */ 
            if (i == variables.length - 1) {
                /**
                 * Add the target node.
                 */
                secondGraph.addNode({ 
                    id: NODE_ID_PREFIX_SPECIAL + TARGET_NODE_ID,
                    label: TARGET_NODE_LABEL,
                    position: { 
                        x: 0, 
                        y: i * this.yDist + this.yDist/2
                    },
                    classes: 'target',
                }); 

                /**
                 * Connect the row ends to the target.
                 */
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${v}^{(1)}-${TARGET_NODE_ID}`,
                    from:   NODE_ID_PREFIX_TRUE + `${v}^{(1)}`,
                    to:     NODE_ID_PREFIX_SPECIAL + `${TARGET_NODE_ID}`,
                    classes: 'muted',
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${v}^{(${this.rowNodeCount})}-${TARGET_NODE_ID}`,
                    from:   NODE_ID_PREFIX_FALSE + `${v}^{(${this.rowNodeCount})}`,
                    to:     NODE_ID_PREFIX_SPECIAL + `${TARGET_NODE_ID}`,
                    classes: 'muted',
                });


                /**
                 * Connect the target node to source node to close the loop.
                 */

                const dist = -( ( this.rowNodeCount / 2 + 1 ) * this.xDist );

                secondGraph.addEdge({
                    id:     EDGE_ID_PREFIX + `${TARGET_NODE_ID}-${SOURCE_NODE_ID}`,
                    from:   NODE_ID_PREFIX_SPECIAL + `${TARGET_NODE_ID}`,
                    to:     NODE_ID_PREFIX_SPECIAL + `${SOURCE_NODE_ID}`,
                    classes: 'muted target-to-source',
                    controlPointDistances: [ dist, dist ],
                });

            }  
        });


        interSteps.push({
            id: `create-variable-gadgets`,
            title: `Create variable gadgets`,
            description: `
                <p>
                    Let $\\Phi = (\\mathcal{V}, \\mathcal{K})$ 
                    be the input boolean formula, 
                    where $\\mathcal{V}$ is the set of variables and $\\mathcal{K}$ is the set of clauses.

                    $$
                        \\mathcal{V} = \\{ ${this.inInstance.variables.join(',')} \\}
                    $$

                    $$
                    \\begin{aligned}
                        \\mathcal{K} = \\{ 
                            ${ 
                                chunkBy(this.inInstance.clauses.map(c => clauseToTriplet(c)), 3)
                                    .map(x => `& ${x.join(',')}`)
                                    .join('\\\\') 
                            } 
                        \\}
                    \\end{aligned}
                    $$
                </p>
                <p>
                    For every variable $v \\in \\mathcal{V}$, 
                    we create a row variable gadget $G_v = (V_v, E_v)$.
                    This gadget consists of $k = ${this.rowNodeCount}$ row nodes.            

                    $$
                        V_v = \\{ v^{(1)}, v^{(2)}, \\ldots, v^{(k = ${this.rowNodeCount})} \\} 
                    $$
                    
                    They are connected birectionally creating a path graph.

                    $$
                        E_v = \\{ \\{ v^{(i)}, v^{(i+1)} \\}, \\{ v^{(i + 1)}, v^{(i)} \\} \\mid 0 \\leq i \\leq k - 1 \\}
                    $$

                    There will be $|\\mathcal{V}| = ${this.varCount}$ of these variable gadgets.
                </p>
                <p>
                    The number $k$ is derived as follows: 

                    <p>
                        For every clause $\\kappa \\in \\mathcal{K}$ we need $2$ nodes - an incoming and outgoing node.
                        Each of these $2$ nodes must be padded by at least one pad nodes, we choose to have $1$ pad node.
                        The rows themselves also need two nodes for the $True$ and $False$ ends.
                    </p>

                    <ul>
                        <li>$ 2 |\\mathcal{K}| $ incoming and outgoing nodes</li>
                        <li>$ |\\mathcal{K}| + 1 $ pad nodes</li>
                        <li>$2$ nodes for $True$ and $False$ ends</li>
                    </ul>

                    $$
                        k = (2 |\\mathcal{K}|) + (|\\mathcal{K}| + 1) + 2 = 3|\\mathcal{K}| + 3
                    $$

                    $$
                    \\begin{aligned}
                        |\\mathcal{K}| &= ${this.clauseCount} \\\\
                        k &= 3 \\cdot ${this.clauseCount} + 3 \\\\
                        k &= ${3 * this.clauseCount + 3}
                    \\end{aligned}
                    $$
                </p>
            `,
            outSnapshot: firstGraph.copy(),
        });

        interSteps.push({
            id: `create-inbetween-nodes`,
            title: `Create inbetween nodes`,
            description: `
                <p>
                    Create the source node $${SOURCE_NODE_LABEL}$, target node $${TARGET_NODE_LABEL}$ 
                    and the inbetween nodes:

                    $$
                        ${inbetweenLabels.join(',')}
                    $$

                    that lie between the variable rows.

                </p>
                <p>
                    Connect the source node $${SOURCE_NODE_LABEL}$ 
                    to the row ends 
                        $ ${this.inInstance.variables[0]}^{(1)} $ 
                        and $ ${this.inInstance.variables[0]}^{(${this.rowNodeCount + 1})} $
                    of the first variable $ ${this.inInstance.variables[0]} $.
                    
                    Then, connect these row ends to the inbetween or target node below. 
                    Repeat for the rest of the graph. 
                </p>
                <p>
                    Finally connect the target node $${TARGET_NODE_LABEL}$ to source node $${SOURCE_NODE_LABEL}$ to close the loop.
                </p>
                <p>
                    Why did we do this?
                </p>
                <p>
                    Going from the source node $${SOURCE_NODE_LABEL}$ or an inbetween node $(v^{(i-1)}, v^{(i)})$ 
                    to one of the row end nodes of a variable $v$ 
                    is equivalent to assigning 
                    a boolean value that corresponding variable $v$.
                </p>
                <p>
                    Here,
                    <ul>
                        <li> 
                            going through the <b>left</b> edge means $v = True$
                        </li>
                        <li>
                            and going though the <b>right</b> edge means $v = False$.
                        </li>
                    </ul>
                </p>
                <p>
                    Notice that we can only choose going through either the left ($True$), or the right ($False$) edge.
                    Backtracking is impossible.
                </p>
                <p>
                    After going through either the right or left edge, 
                    we must visit the row nodes, for the final cycle to be Hamiltonian.
                </p>
            `,
            outSnapshot: secondGraph.copy(),
        });

        return { 
            graph: secondGraph,
            interSteps,
        };
    }

    private createClauseGadgets(graph: Graph): ReductionPartialResult {
        const { clauses } = this.inInstance;
        let interSteps: ReductionStep<CNF3, Graph>[] = [];

        /**
         * I want to show 2 steps:
         *    1. Add clause nodes for every clause.
         *    2. Connect the clause to its literal's variable row nodes
         *       from either left (True) end right (False) direction.
         */

        // represents the graph with only the clause nodes added
        // with no edges yet
        let firstGraph = graph.copy();

        /**
         * For each clause, create a node 
         * and based on literals it contains, 
         * connect it to variable row nodes
         * form either 'true' direction 
         * or 'false' direction. 
         */
        clauses.forEach((c,i) => {
            const idx = i + 1;
            const clauseId = `${idx}`;
            const clauseLabel = `\\kappa^{({${idx}})}`;

            // Create clause node
            const node : GraphNode = {
                id: NODE_ID_PREFIX_CLAUSE + `${clauseId}`,
                label: clauseLabel, // `clause_${clauseId}`,
                position: {
                    x: 2 * this.rowXOffset,
                    y: i * this.yStep + this.yOffset,
                },
                classes: 'clause'
            };

            firstGraph.addNode(node);
            graph.addNode(node);

            const connLitLabels: { in: string; out: string; inLabel: string; outLabel: string }[] = [];
            let uniqueLits = new Array<Literal>();

            // For its literals.
            c.literals.forEach((l) => {
                const litId = `${l.varName}^{(${3 * idx})}`;
                const adjLitId = `${l.varName}^{(${3 * idx + 1})}`;

                if (
                    connLitLabels.find(x => x.in == litId && x.out == adjLitId) ||
                    connLitLabels.find(x => x.out == litId && x.in == adjLitId) 
                ) {
                    return;
                }

                uniqueLits.push(l)

                // If its positive literal,
                // add an edge from the true side to the clause node
                // and from the clause node back to the next row node.
                if (!l.negated) {
                    graph.addEdge({
                        id:     EDGE_ID_PREFIX + `${litId}-${clauseId}`,
                        from:   NODE_ID_PREFIX + `${litId}`,
                        to:     NODE_ID_PREFIX_CLAUSE + `${clauseId}`,
                        classes: 'true_out',
                    });

                    graph.addEdge({
                        id:     EDGE_ID_PREFIX + `${clauseId}-${adjLitId}`,
                        from:   NODE_ID_PREFIX_CLAUSE + `${clauseId}`,
                        to:     NODE_ID_PREFIX + `${adjLitId}`,
                        classes: 'true_in',
                    });

                    connLitLabels.push({
                        in: adjLitId,
                        out: litId,       
                        inLabel: graph.nodes.find(x => x.id == NODE_ID_PREFIX + adjLitId)!.label!,
                        outLabel: graph.nodes.find(x => x.id == NODE_ID_PREFIX + litId)!.label!,
                    });
                } else {
                    graph.addEdge({
                        id:     EDGE_ID_PREFIX + `${adjLitId}-${clauseId}`,
                        from:   NODE_ID_PREFIX + `${adjLitId}`,
                        to:     NODE_ID_PREFIX_CLAUSE + `${clauseId}`,
                        classes: 'false_out',
                    });

                    graph.addEdge({
                        id:     EDGE_ID_PREFIX + `${clauseId}-${litId}`,
                        from:   NODE_ID_PREFIX_CLAUSE + `${clauseId}`,
                        to:     NODE_ID_PREFIX + `${litId}`,
                        classes: 'false_in',
                    });

                    connLitLabels.push({
                        in: litId,
                        out: adjLitId,       
                        inLabel: graph.nodes.find(x => x.id == NODE_ID_PREFIX + litId)!.label!,
                        outLabel: graph.nodes.find(x => x.id == NODE_ID_PREFIX + adjLitId)!.label!,
                    });
                }
            });


            interSteps.push({
                id: `connect-clause-node-${i}`,
                title: `Connect clause node $\\kappa_{${clauseId}}$ to variable row nodes`,
                description: `
                    <p>
                        Clause node $${clauseLabel}$ represents the clause $${c.toTexString()}$.
                
                        <ul>
                            ${uniqueLits.map(l => {
                                return `
                                    <li>
                                        $${l.toTexString()}$
                                        
                                        ${!l.negated ? (`
                                            isn't negated &mdash;
                                            
                                            the outgoing node $${l.varName}^{(${3 * idx})}$
                                            is on the <b>left</b> of
                                            the incoming node $${l.varName}^{(${3 * idx + 1})}$.
                                        `) : (`
                                            is <i>negated</i> &mdash;
                                            
                                            the outgoing node $${l.varName}^{(${3 * idx + 1})}$
                                            is on the <b>right</b> of
                                            the incoming node $${l.varName}^{(${3 * idx})}$.
                                        `)}
                                    </li>
                                `;
                            }).join('')}
                        </ul>

                        Add these edges:
                        $$
                            ${
                                connLitLabels.map(x => `(${x.outLabel}, ${clauseLabel}), (${clauseLabel}, ${x.inLabel})`).join('')
                            }
                        $$
                    </p>
                `,
                outSnapshot: graph.copy(),
            });
        });

        /*
         * Add the first step.
         */
        interSteps.unshift({
            id: `create-clause-gadget-nodes`,
            title: `Create clause nodes`,
            description: `
                <p>
                    For every clause $\\kappa \\in \\mathcal{K}$, 
                    create one clause node $\\kappa'$. 
                    This node must be visited exactly once. 
                    Visiting this node corresponds to the clause $\\kappa$ being satisfied.
                    ${this.clauseCount == 1 
                        ? `There is $|\\mathcal{K}| = ${this.clauseCount}$ clause node.`
                        : `There are $|\\mathcal{K}| = ${this.clauseCount}$ clause nodes.`
                    }
                </p>
                <p>
                    For each clause node $\\kappa'$, 
                        representing some clause $\\kappa = (X, Y, Z) \\in \\mathcal{K}$,
                            where $X$, $Y$ and $Z$ are its literals (they can be negated) 
                            and $x$, $y$ and $z$ are the variables,
  
                    create edges to and from the variable row gadgets $G_{x}$, $G_{y}$ and $G_{z}$ as follows:
                </p>
                <p>
                    For each literal $X$ of the clause $\\kappa$
                        pick a free row node $x^{(i)}$
                            (one that hasn't been used yet in this step) 
                        and connect it to $\\kappa'$.

                        This selected node is the <u>outgoing</u> node.

                    If the literal is negated:
                    <ul>
                        <li>
                            connect $\\kappa'$ back to row node $x^{(i - 1)}$ (adjacent, on the left of $x^{(i)}$),
                        </li>
                        <li>
                            otherwise
                            connect $\\kappa'$ back to row node $x^{(i + 1)}$ (adjacent, on the right of $x^{(i)}$).
                        </li>
                    </ul>

                    This node, be it $x^{(i-1)}$ or $x^{(i+1)}$, is the <u>incoming</u> node.
                </p>
                <p>
                    This way, we gaurantee for each clause node $\\kappa'$ that:
                    
                    <ul>
                        <li>
                            If some literal $X$ of variable $x$ in the clause $\\kappa$ 
                            <b>isn't negated</b>,
                            
                                then we can reach it 
                                    from some node $x^{(i)}$ of the variable gadget $G_{x}$
                                    and come back to $x^{(i+1)}$ (on the right),
                            
                                if we approach it from the left (we assinged $x$ to be $True$).
                        </li>
                        <li>
                            Otherwise, the literal $X$ <b>is negated</b>
                                and we can reach it  
                                    from some node $x^{(i)}$ of the variable gadget $G_{x}$
                                    and come back to $x^{(i-1)}$ (on the left),

                                if we approach it from the right (we assigned $x$ to be $False$).
                        </li>
                    </ul>
                </p>
                <p>
                    Note: In the graph, the clause nodes are named $\\kappa^{(i)}$, not $\\kappa'$.
                </p>
            `,
            outSnapshot: firstGraph.copy(),
        });

        return {
            graph,
            interSteps,
        }
    }
}

