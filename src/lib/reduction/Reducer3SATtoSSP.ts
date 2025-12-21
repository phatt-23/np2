import { CLAUSE_FILLER_PREFIX_ONE, CLAUSE_FILLER_PREFIX_TWO, VARIABLE_FALSE_PREFIX, VARIABLE_TRUE_PREFIX } from "$lib/core/Id";
import type { CNF3 } from "$lib/instance/CNF3";
import { SSP, SSPNumber } from "$lib/instance/SSP";
import { Reducer, type ReductionResult } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

export class Reducer3SATtoSSP extends Reducer<CNF3, SSP> {
    constructor(instance: CNF3) {
        super(instance);
    }


    /**
     * let v = number of variables
     * let c = number of clauses
     * let k = v + c
     * 
     * construct 2 * k numbers, each with k digits
     * 
     * these numbers can be stored in (2 * k)x(k) matrix
     * 
     * 
     * ```
     *               --------------------------
     *               | v1 v2 v3 v4 | c1 c2 c3 |
     *               --------------------------
     * v1 = T        | 1  0  0  0  | 1  0  1  |   - setting v1 to true means clauses c1 and c3 are satisfied
     * v1 = F        | 1  0  0  0  | 0  1  0  |   - setting v1 to false means clause c2 is satisfied
     * v2 = T        | 0  1  0  0  | 0  0  0  |
     * v2 = F        | 0  1  0  0  | 0  1  0  |
     * v3 = T        | 0  0  1  0  | 1  0  0  |
     * v3 = F        | 0  0  1  0  | 1  0  0  |
     * v4 = T        | 0  0  0  1  | 0  1  1  |
     * v4 = F        | 0  0  0  1  | 0  0  1  |
     *               --------------------------
     * c1 filler     | 0  0  0  0  | 1  0  0  |
     * c1 filler     | 0  0  0  0  | 1  0  0  |
     * c2 filler     | 0  0  0  0  | 0  1  0  |
     * c2 filler     | 0  0  0  0  | 0  1  0  |
     * c3 filler     | 0  0  0  0  | 0  0  1  |
     * c3 filler     | 0  0  0  0  | 0  0  1  |
     *               --------------------------
     * target        | 1  1  1  1  | 3  3  3  |
     *               --------------------------
     * ```
     * 
     * 
     * This means that variables v1, v2, ..., vn can only ever be either T or F, not both.
     * The filler row are just there in case of a clause_i being satified by one variable,
     * to be able to reach the target sum of 3, it needs at minimum two more 'fillers'.
     * 
     * Note that each of these numbers/rows is unique.
     */
    protected doReduce(): ReductionResult<CNF3, SSP> {
        const { variables, clauses } = this.inInstance;
        const ssp = new SSP();

        const v = variables.length;
        const c = clauses.length;
        const k = v + c;

        const matrix = Array.from({ length: 2 * k}, () => new Array(k).fill(0));


        /**
         * fill the diagonal
         */

        for (let i = 0; i < k; i++) {
            matrix[2 * i][i] = 1;
            matrix[2 * i + 1][i] = 1;
        }

        /**
         * fill numbers for clauses
         */

        clauses.forEach((clause, i) => clause.literals.forEach(lit => {
            // lookup the index of the current literal variable name
            const idx = variables.findIndex(v => v == lit.varName);

            // set the literal in the clause
            matrix[2 * idx + (lit.negated ? 1 : 0)][v + i] = 1;
        }));
    
        const steps: ReductionStep<CNF3, SSP>[] = [];
       
        // add the rows representing the SSP numbers
        for (let i = 0; i < variables.length; i++) {
            const v = variables[i];
            ssp.addNumber(new SSPNumber(VARIABLE_TRUE_PREFIX + v, matrix[2 * i]));
            ssp.addNumber(new SSPNumber(VARIABLE_FALSE_PREFIX + v, matrix[2 * i + 1]));
        }

        // add the clause filler rows
        for (let i = 0; i < clauses.length; i++) {
            ssp.addNumber(new SSPNumber(CLAUSE_FILLER_PREFIX_ONE + i, matrix[(2 * i) + (2 * variables.length)]));
            ssp.addNumber(new SSPNumber(CLAUSE_FILLER_PREFIX_TWO + i, matrix[(2 * i + 1) + (2 * variables.length)]));
        }

        /**
         * The target sum is simply v number of 1s and c number of 3s.
         */
        const target = [...new Array(v).fill(1), ...new Array(c).fill(3)];
        ssp.setTarget(target);

        // TODO: Separate the steps into multiple steps.
        steps.push({
            id: 'var-numbers',
            title: 'Add variable numbers',
            description: `
                <p>
                    For each variable <i>v<sub>i</sub></i> create two numbers:
                    <ul>
                        <li>
                            <i>v<sub>i</sub><sup>T</sup></i> - represents <i>v</i> being set to True
                        </li>
                        <li>
                            <i>v<sub>i</sub><sup>F</sup></i> - represents <i>v</i> being set to False
                        </li>
                    </ul>

                    In this case we have ${variables.length} variables: ${variables.join(', ')}.
                    This means there will be ${2 * variables.length} numbers.
                </p>
                <p>
                    These numbers are <i>k</i> digits long, where <i>k = number of variables + number of clauses</i>.
                    In this case, <i>k = ${variables.length} + ${clauses.length} = ${k}</i>
                </p>
                <p>
                    At the beginning, set all of the digits to 0.
                    <ul>
                        ${variables.map(v => `
                            <li>
                                <i>${v}<sup>T</sup></i> - ${''.padEnd(k, '0')}
                            </li>
                            <li>
                                <i>${v}<sup>F</sup></i> - ${''.padEnd(k, '0')}
                            </li>
                        `).join('\n')}
                    </ul>
                </p>
                <p>
                    For numbers <i>n<sub>v<sub>i</sub></sub></i> the <i>i</i>-th digits are set to 1.
                    <ul>
                        ${variables.map((v, i) => `
                            <li>
                                <i>${v}<sup>T</sup></i> - ${(() => {
                                    let zeros = ''.padEnd(k, '0');         // "0000...0"
                                    return zeros.substring(0, i) + '1' + zeros.substring(i + 1);
                                })()}
                            </li>
                            <li>
                                <i>${v}<sup>F</sup></i> - ${(() => {
                                    let zeros = ''.padEnd(k, '0');         // "0000...0"
                                    return zeros.substring(0, i) + '1' + zeros.substring(i + 1);
                                })()}
                            </li>
                        `).join('\n')}
                    </ul>
                </p>
                <p>
                    For each clause, <i>c<sub>i</sub></i> with literals <i>a</i>, <i>b</i> and <i>c</i>, 
                    for the numbers corresponding to <i>a</i>, <i>b</i> and <i>c</i>,
                    set the (i + number of variables)-th digit to 1.
                </p>
                <p>
                    We have ${clauses.length} clauses: 
                    <ul>
                        ${
                            clauses.map((c, i) => `
                                <li>
                                    c${i} &coloneq; ${c.asHtmlString()}
                                </li>`
                            ).join('\n')
                        }
                    </ul>
                </p>
                <p>
                    <ul>
                        ${variables.map((v, i) => {
                            const nT = ssp.numbers[2 * i];
                            const nF = ssp.numbers[2 * i + 1];

                            return `
                                <li> 
                                    <i>${v}<sup>T</sup></i> - ${nT.value.join('')}
                                </li>
                                <li> 
                                    <i>${v}<sup>F</sup></i> - ${nF.value.join('')}
                                </li>
                            `;
                        }).join('\n')}
                    </ul>
                </p>
                <p>
                    For each clause <i>c<sub>i</sub></i> add two numbers:
                    <ul>
                        <li>filler c<sub>i,1</sub></li>
                        <li>filler c<sub>i,2</sub></li>
                    </ul>
                    both of the same value: number of ${k} digits with i-th digit set to 1.

                    <ul>
                        ${(() => {
                            let accumString = '';

                            for (let i = (2 * variables.length); i < (2 * variables.length) + (2 * clauses.length); i++) {
                                accumString += `<li>${ssp.numbers[i].value.join('')}</li>`;
                            }

                            console.debug('accumString', accumString);

                            return accumString;
                        })()}
                    </ul>
                </p>
                <p>
                    Set the target to ${ssp.target.join('')}.
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            mapping: {},
        });


        return {
            outInstance: ssp,
            steps,
        };
    }

}
