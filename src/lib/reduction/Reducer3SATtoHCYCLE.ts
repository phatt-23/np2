//
// Created by phatt-23 on 11/10/2025
//

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
import type { CNF3 } from "$lib/instance/CNF3";
import { Graph, type GraphEdge, type GraphNode } from "$lib/instance/Graph";
import { Reducer, type ReductionResult } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

type ReductionPartResult = { graph: Graph, interSteps: ReductionStep<CNF3, Graph>[] }

export class Reducer3SATtoHCYCLE extends Reducer<CNF3, Graph> {
    private rowNodeCount: number;
    private rowXOffset: number;
    private varCount: number;
    private clauseCount: number;
    private height: number;
    private yStep: number;
    private yOffset: number;
    private xDist = 50;
    private yDist = 300;

    public constructor(inInstance: CNF3) {
        super(inInstance);
        const { variables, clauses } = this.inInstance;

        this.yOffset = this.yDist / 2;

        this.varCount = variables.length;
        this.clauseCount = clauses.length;

        this.height = (this.varCount - 1) * this.yDist;
        this.yStep = (this.height - this.yDist) / (this.clauseCount - 1 == 0 ? 1 : this.clauseCount - 1); 

        this.rowNodeCount = 3 * clauses.length + 3;
        this.rowXOffset = (this.rowNodeCount - 1)/2 * this.xDist;
    }

    protected doReduce(): ReductionResult<CNF3, Graph> {
        let steps : ReductionStep<CNF3, Graph>[] = [];

        const step1 = this.createVarGadgets();

        steps.push(...step1.interSteps);

        const step2 = this.createClauseGadgets(step1.graph.copy());

        steps.push(...step2.interSteps);

        return {
            outInstance: step2.graph,
            steps,
        }
    }

    private createClauseGadgets(graph: Graph): ReductionPartResult {
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

        interSteps.push({
            id: `create-clause-gadget-nodes`,
            title: `Create clause nodes`,
            description: `
                <p>
                    For every clause, create one clause node 
                    (this node must be visited exactly once).
                    There are ${this.clauseCount} clause nodes.
                </p>
                <p>
                    For each of the clause, create edges to or from the variable row nodes
                    based on these rules:
                </p>
                <ul>
                    <li>
                        If the literal <b>isn't negated</b>, 
                        pick a free (one that hasn't been used yet in this step) 
                        row node <i>r</i> and connect it to the clause node.

                        The selected node is an <u>out-going</u> node.

                        Then connect the clause node back to a row node <i>r + 1</i> 
                        (adjacent on the right of it).

                        This node is an <u>in-coming</u> node.
                    </li>
                    <li>
                        If the literal <b>is negated</b>, 
                        pick a free row node <i>r</i> 
                        and connect it to the clause node.

                        The selected node is an <u>out-going</u> node.

                        Then connect the clause node back to a row node <i>r - 1</i> 
                        (adjacent on the left of it).

                        This node is an <u>in-coming</u> node.
                    </li>
                </ul>
                <p>
                    This way we gaurantee for each clause that:
                    <ul>
                        <li>
                            If the literal <i>L</i> of some variable <i>X</i> 
                            <b>wasn't negated</b> in the clause, 
                            then we can reach it from an <i>X</i> variable row node 
                            and come back to an <i>X</i> variable row node on the right of it,
                            when we approach it from the left (we assinged X to be True).
                        </li>
                        <li>
                            If the literal <i>L</i> of some variable <i>X</i> 
                            <b>was negated</b> in the clause, 
                            then we can reach it from an <i>X</i> variable row node 
                            and come back to an <i>X</i> variable row node on the left of it,
                            when we approach it from the right (we assigned X to be False).
                        </li>
                    </ul>
                </p>
            `,
            inSnapshot: this.inInstance,
            // btw this graph is modified later by the code below
            outSnapshot: firstGraph,  
            mapping: {},
        });

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

            // Create clause node
            const node : GraphNode = {
                id: NODE_ID_PREFIX_CLAUSE + `${clauseId}`,
                position: {
                    x: 2 * this.rowXOffset,
                    y: i * this.yStep + this.yOffset,
                },
                classes: 'clause'
            };

            firstGraph.addNode(node);
            graph.addNode(node);

            // For its literals.
            c.literals.forEach((l) => {
                const litId = `${l.varName}_${3 * idx}`;
                const adjLitId = `${l.varName}_${3 * idx + 1}`;

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
                }
            });

            interSteps.push({
                id: `connect-clause-node-${i}`,
                title: `Connect clause node "${clauseId}" to variable row nodes`,
                description: `
                    <p>
                        Clause node "${clauseId}" represents the clause ${c.asHtmlString()}.
                    </p>
                    <ul>
                        ${c.literals.map(l => {
                            return `
                                <li>
                                    ${l.asHtmlString()}
                                    &hyphen;
                                    ${!l.negated ? (`
                                        because ${l.varName} is <i>isn't negated</i>, 
                                        the <u>out-going</u> node (${l.varName}_${3 * idx})
                                        will be on the <b>left</b> of
                                        the <u>in-coming</u> node (${l.varName}_${3 * idx + 1}).
                                    `) : (`
                                        because ${l.varName} is <i>negated</i>, 
                                        the <u>out-going</u> node (${l.varName}_${3 * idx + 1})
                                        will be on the <b>right</b> of
                                        the <u>in-coming</u> node (${l.varName}_${3 * idx}).
                                    `)}
                                </li>
                            `;
                        }).join('')}
                    </ul>
                    <p>
                        To clarify:
                        <ul>
                            <li>out-going node is incident to an edge connecting a row node to a clause node.</li>
                            <li>in-coming node is incident to an edge connecting a clause node to a row node.</li>
                        </ul>
                    </p>
                `,
                inSnapshot: this.inInstance,
                outSnapshot: graph.copy(),
                mapping: {},
            });
        });

        return {
            graph,
            interSteps,
        }
    }


    private createVarGadgets(): ReductionPartResult {
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
                    position: { x: 0, y: i * this.yDist - this.yDist/2 },
                    classes: 'source'
                }); 

                /**
                 * Add edges from source to row ends of this first variable.
                 */
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${SOURCE_NODE_ID}-${v}_1`, 
                    from:   NODE_ID_PREFIX_SPECIAL + `${SOURCE_NODE_ID}`, 
                    to:     NODE_ID_PREFIX_TRUE + `${v}_1`, 
                    classes: 'muted',
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${SOURCE_NODE_ID}-${v}_${this.rowNodeCount}`, 
                    from:   NODE_ID_PREFIX_SPECIAL + `${SOURCE_NODE_ID}`, 
                    to:     NODE_ID_PREFIX_FALSE + `${v}_${this.rowNodeCount}`,
                    classes: 'muted',
                });

            } else {
                /**
                 * For other variables, there is layer above it 
                 * that needs to be wired to the inbetween node.
                 */
                const inbetweenNode = `${variables[i - 1]}_${v}`;

                /**
                 * Add the inbetween node.
                 */
                secondGraph.addNode({ 
                    id: NODE_ID_PREFIX_INBETWEEN + `${inbetweenNode}`, 
                    position: { x: 0, y: i * this.yDist - this.yDist/2 },
                    classes: 'inbetween'
                }); 

                /**
                 * Connect above gadget's row ends into this inbetween node.
                 */ 
                const prevVar = variables[i - 1];
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${prevVar}_1-${inbetweenNode}`, 
                    from:   NODE_ID_PREFIX_TRUE + `${prevVar}_1`, 
                    to:     NODE_ID_PREFIX_INBETWEEN + inbetweenNode,
                    classes: 'muted'
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${prevVar}_${this.rowNodeCount}-${inbetweenNode}`, 
                    from:   NODE_ID_PREFIX_FALSE + `${prevVar}_${this.rowNodeCount}`, 
                    to:     NODE_ID_PREFIX_INBETWEEN + inbetweenNode,
                    classes: 'muted'
                });

                /** 
                 * Connect this inbetween node to current variable's row ends.
                 */ 
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${inbetweenNode}-${v}_1`, 
                    from:   NODE_ID_PREFIX_INBETWEEN + `${inbetweenNode}`,
                    to:     NODE_ID_PREFIX_TRUE + `${v}_1`, 
                    classes: 'muted'
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${inbetweenNode}-${v}_${this.rowNodeCount}`, 
                    from:   NODE_ID_PREFIX_INBETWEEN + `${inbetweenNode}`,
                    to:     NODE_ID_PREFIX_FALSE + `${v}_${this.rowNodeCount}`, 
                    classes: 'muted'
                });
            }

            /**
             * Create row nodes and connect them bidirectionally.
             */
            for (let j = 1; j <= this.rowNodeCount - 1; j++) {
                const current = `${v}_${j}`;
                const next = `${v}_${j + 1}`;

                let classes = ''; 
                let currentPrefix = NODE_ID_PREFIX;
                let nextPrefix = NODE_ID_PREFIX;

                // first is 'true'
                if (j == 1) {
                    classes += ' true';
                    currentPrefix = NODE_ID_PREFIX_TRUE;
                }
                else if (j == this.rowNodeCount - 1) {
                    nextPrefix = NODE_ID_PREFIX_FALSE;
                }
                else if ((j + 1) % 3 == 0) {
                    classes += ' guarantee';
                }

                const node: GraphNode = { 
                    id: currentPrefix + `${current}`, 
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
                        id: nextPrefix + `${next}`, 
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
                    id:     EDGE_ID_PREFIX + `${v}_1-${TARGET_NODE_ID}`,
                    from:   NODE_ID_PREFIX_TRUE + `${v}_1`,
                    to:     NODE_ID_PREFIX_SPECIAL + `${TARGET_NODE_ID}`,
                    classes: 'muted',
                });
                secondGraph.addEdge({ 
                    id:     EDGE_ID_PREFIX + `${v}_${this.rowNodeCount}-${TARGET_NODE_ID}`,
                    from:   NODE_ID_PREFIX_FALSE + `${v}_${this.rowNodeCount}`,
                    to:     NODE_ID_PREFIX_SPECIAL + `${TARGET_NODE_ID}`,
                    classes: 'muted',
                });


                /**
                 * Connect the target node to source node to close the loop.
                 */
                secondGraph.addEdge({
                    id:     EDGE_ID_PREFIX + `${TARGET_NODE_ID}-${SOURCE_NODE_ID}`,
                    from:   NODE_ID_PREFIX_SPECIAL + `${TARGET_NODE_ID}`,
                    to:     NODE_ID_PREFIX_SPECIAL + `${SOURCE_NODE_ID}`,
                    classes: 'muted',
                });

            }  
        });

        interSteps.push({
            id: `create-variable-gadgets`,
            title: `Create individual variable gadgets`,
            description: `
                <p>
                    For every variable, create a row variable gadget.
                </p>
                <p>
                    This gadget consists of ${this.rowNodeCount} row nodes.
                    They are all connected birectinally.
                </p>
                <p>
                    The number of row nodes it derived as follows: 
                </p>
                <p>
                    For every clause we need 2 nodes - an <i>out-going</i> and <i>in-coming</i> node.
                    Each of these 2 nodes must be padded a <i>pad</i> node (at least one).
                    The rows themselves also need <i>true</i> and and <i>false</i> ends.
                </p>
                <p>
                    ${this.clauseCount == 1 
                        ? `There is ${this.clauseCount} clause.` 
                        : `There are ${this.clauseCount} clauses.` 
                    }
                    Therefore we need: 
                    <ul>
                        <li>2 * ${this.clauseCount} out-going and in-coming nodes</li>
                        <li>${this.clauseCount} + 1 pad nodes</li>
                        <li>1 true and 1 false nodes at the row ends</li>
                    </ul>
                </p>
                <p>
                    (2 * ${this.clauseCount}) + (${this.clauseCount} + 1) + 1 + 1 = ${this.rowNodeCount} nodes per variable row.
                </p>
            `,
            inSnapshot: this.inInstance,
            outSnapshot: firstGraph,
            mapping: {}
        });

        interSteps.push({
            id: `create-inbetween-nodes`,
            title: `Create inbetween nodes`,
            description: `
                <p>
                    Create the <i>source</i> node, the <i>inbetween</i> nodes that lie
                    between the variable rows and <i>target</i> node. 
                </p>
                <p>
                    Connect the <i>source</i> node 
                    to the row ends of the first variable "${this.inInstance.variables[0]}".
                    After that connect its row ends to the inbetween/target node below.
                    Finally connect the <i>target</i> node to <i>source</i> node to close the loop.
                </p>
                <p>Why did we do this?</p>
                <p>
                    Going from the <i>source</i> or an <i>inbetween</i> node 
                    to the variable's row node is equivalent to assigning 
                    a boolean value that corresponding variable.
                </p>
                <ul>
                    <li> 
                        Going through the <b>left edge means assigning 'true'</b>.
                    </li>
                    <li>
                        Going though the <b>right edge means assigning 'false'</b>.
                    </li>
                </ul>
                <p>
                    Notice that we can only choose either 'true' or 'false' edge.
                    Backtracking is impossible.
                </p>
                <p>
                    After going through either the right or left edge, 
                    we must visit the row nodes, for the final cycle to be Hamiltonian.
                </p>
                <ul>
                    <li>
                        If we chose the <b>left edge</b>, then we end up on the <b>'true'</b> node 
                        and have to traverse the row nodes from <u>left to right</u> until 
                        we end up at the 'false' node.
                    </li>

                    <li>
                        If we chose the <b>right</b> edge, then we end up on the <b>'false'</b> node 
                        and have to traverse the row nodes from <u>right to left</u> until
                        we end up at the 'true' node.
                    </li>

                    <li>
                        Onwards, the only choice is to continue 
                        to the next <i>inbetween</i>/<i>target</i> node below.
                    </li>
                </ul>
                <p>
                    The last step is to go from the <i>target</i> node back to the <i>source</i> node.
                </p>
            `,
            inSnapshot: this.inInstance,
            outSnapshot: secondGraph,
            mapping: {}
        });

        return { 
            graph: secondGraph,
            interSteps,
        };
    }
}
