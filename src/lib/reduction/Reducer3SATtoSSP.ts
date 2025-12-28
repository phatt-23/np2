import { CLAUSE_FILLER_PREFIX_ONE, CLAUSE_FILLER_PREFIX_TWO, VARIABLE_FALSE_PREFIX, VARIABLE_TRUE_PREFIX } from "$lib/core/Id";
import type { CNF3 } from "$lib/instance/CNF3";
import { SSP, type SSPNumber } from "$lib/instance/SSP";
import { Reducer, type ReductionResult } from "./Reducer";
import type { ReductionStep } from "./ReductionStep";

type ReductionPart = { 
    ssp: SSP, 
    step: ReductionStep<CNF3, SSP> 
};

export class Reducer3SATtoSSP extends Reducer<CNF3, SSP> {
    lookup: Map<string, number[]> = new Map();
    V: number;
    C: number;
    K: number;
    targetArray: number[];
    targetSum: number;

    constructor(instance: CNF3) {
        super(instance);
        this.V = this.inInstance.variables.length;
        this.C = this.inInstance.clauses.length;
        this.K = this.V + this.C;

        this.targetArray = [
            ...new Array(this.V).fill(1),  
            ...new Array(this.C).fill(3),
        ];

        this.targetSum = Number.parseInt(this.targetArray.join(''));
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
    /*
        Use a lookup table to store the number values, key -> value, label -> array of numbers
        1. tell how many digits the numbers are gonna be 
            - #variables + #clauses  
            and write the target number 
            - #variables 1 ++ #clauses 3
        2. for each variable create two numbers T and F
            - Only fill up the diagonal
            - explain that this maps to boolean assignment, because now either T, or F is chosen but not both, otherwise the digit would sum to more than 1 
        3. Update the numbers based on the clauses they appear in
            - explain that if i choose v to True, then some clauses are gonna be satisfied and some stay unsatisfied
        4. Create buffer (clause) numbers
            - if just 1 one is caught for a clause, then it is satisfied
            - BUT a clause column can catch at most 3 ones, which means to be consistent, we must enforce that every clause column sums to 3 to be satisfied
            - to make this work for 1, 2 and 3 (clause satisfied) ones caught but not 0 ones caught (not satisfied), 
                we must add 2 dummy ones for each clause that we can always choose
    */
    protected doReduce(): ReductionResult<CNF3, SSP> {
        const steps: ReductionStep<CNF3, SSP>[] = [];
        const ssp = new SSP();

        let part1 = this.createTargetSum(ssp);
        let part2 = this.createVarNumbers(part1.ssp);
        let part3 = this.updateVarNumbers(part2.ssp);
        let part4 = this.createBufferNumbers(part3.ssp);

        steps.push(part1.step, part2.step, part3.step, part4.step);

        return {
            outInstance: ssp,
            steps,
        }
    }

    createTargetSum(ssp: SSP): ReductionPart {

        ssp.setTarget(this.targetArray);

        const step: ReductionStep<CNF3, SSP> = {
            id: `create-target-sum`,
            title: `Create target sum`,
            description: `
                <p>
                    We start out by defining the target sum $\\tau$. Then we define the numbers.
                </p>
                <p>
                    All these numbers including the target sum $\\tau$ are $k = v + c$ digits long, 
                    where $v$ is the number of variables 
                    and $c$ is the number of clauses in the 3-CNF formula.
                    
                    In this case, $k = ${this.V} + ${this.C} = ${this.K}$, 
                    because $v = ${this.V}$ and $c = ${this.C}$.
                </p>
                <p>
                    The target sum $\\tau$ is defined as:
                    $$
                        \\tau = \\sum_{i = 0}^{${this.V}} (1 \\cdot 10^{i + ${this.C}}) 
                              + \\sum_{i = 0}^{${this.C}} (3 \\cdot 10^{i})
                    $$ 

                    In this case, $\\tau = ${this.targetSum}$.
                </p>
            `,  
            inSnapshot: this.inInstance.copy(),
            outSnapshot: ssp.copy(),
        };
        
        return { ssp, step };
    }

    createVarNumbers(ssp: SSP): ReductionPart {
        const numberArray = new Array(this.K).fill(0)
        
        this.inInstance.variables.forEach((v, i) => {
            const value = [...numberArray];
            value[i] = 1;

            const trueId = VARIABLE_TRUE_PREFIX + v;
            const falseId = VARIABLE_FALSE_PREFIX + v; 

            this.lookup.set(trueId, [...value]);
            this.lookup.set(falseId, [...value]);

            ssp.addNumber({
                id: trueId,
                label: `${v}_T`,
                value: [...value],
                used: false,
            });

            ssp.addNumber({
                id: falseId,
                label: `${v}_F`,
                value: [...value],
                used: false,
            });
        });

        const step: ReductionStep<CNF3, SSP> = {
            id: `create-var-numbers`,
            title: `Create variable numbers`,
            description: `
                <p>
                    Create two, at most $k$ digit long, numbers $\\nu_T$ and $\\nu_F$ for every variable $\\nu$ in the boolean formula.
                    These numbers enforce boolean assignment for every variable. 
                    The final subset of numbers $S$ that sum up to $\\tau$ must include either $\\nu_T$, or $\\nu_F$.
                    Choosing $\\nu_T$ means assigning $\\nu \\coloneqq T$, while choosing $\\nu_F$ means $\\nu \\coloneqq F$.
                </p>
                <p>
                    In this case we have $v = ${this.V}$ variables:

                    <ul>
                        ${this.inInstance.variables.map(v => `<li>$ ${v} $</li>`).join('')}
                    </ul>

                    There is $v = ${this.V}$ of them, therefore we will create $2v = ${2 * this.V}$ numbers 
                    and for now fill them with $k=${this.K}$ zeros.

                    $$
                    \\begin{aligned}
                        ${this.inInstance.variables.map(v => `
                            ${v}_T &= ${numberArray.join('')} \\\\
                            ${v}_F &= ${numberArray.join('')} \\\\
                        `).join('')}
                    \\end{aligned}
                    $$
                </p>
                <p>
                    To enforce that we can choose either $\\nu_{i,T}$, or $\\nu_{i,F}$ of variable $\\nu_i$ for $i \\in [0, v]$, 
                    we replace the $i$-th digit in the numbers $\\nu_{i,T}$ and $\\nu_{i,F}$ with one.

                    $$
                    \\begin{aligned}
                        ${this.inInstance.variables.map(v => `
                            ${v}_T &= ${this.lookup.get(VARIABLE_TRUE_PREFIX + v)?.join('')} \\\\
                            ${v}_F &= ${this.lookup.get(VARIABLE_FALSE_PREFIX + v)?.join('')} \\\\
                        `).join('')}
                    \\end{aligned}
                    $$

                    The first $v$ digits in the target sum $ \\tau = ${this.targetSum} $ can be achieved, 
                    iff either $\\nu_T$, or $\\nu_F$ is present in the final subset $S$. 
                </p>
            `,  
            inSnapshot: this.inInstance.copy(),
            outSnapshot: ssp.copy(),
        };

        return { ssp, step };
    } 

    updateVarNumbers(ssp: SSP): ReductionPart {
        this.inInstance.clauses.forEach((c,i) => {
            c.literals.forEach(v => {
                const id = v.negated ? (VARIABLE_FALSE_PREFIX + v.varName) : (VARIABLE_TRUE_PREFIX + v.varName);
                const val = this.lookup.get(id)!;
                val[i + this.V] = 1;
                this.lookup.set(id, val);

                ssp.setNumberValue(id, val);
            });
        });

        const step: ReductionStep<CNF3, SSP> = {
            id: `update-var-numbers`,
            title: `Update variable numbers`,
            description: `
                <p>
                   In the 3-CNF formula, there is $C = ${this.C}$ clauses:
                   <ul>
                       ${this.inInstance.clauses.map(c => `<li>$ ${c.toTexString()} $</li>`).join('')}
                   </ul> 
                </p>
                <p>
                    To model these clauses being satisfied 
                    by choosing either variable numbers $\\nu_T$, or $\\nu_F$, 
                    we must first update these variable numbers we just created.
                </p>
                <p>
                    For every clause $\\kappa_i$ for $i \\in [0, c]$ we will proceed like this:
                        
                    If $\\nu$ appears in the clause $\\kappa_i$ as a literal, 
                    we replace the $(i + v)$-th digit with one
                        for the number $\\nu_F$ if the literal is negated (appears as $\\lnot \\nu$), 
                        otherwise we relace the digit for the number $\\nu_T$.
                </p>
                <p>
                    $$
                    \\begin{aligned}
                        ${this.inInstance.variables.map(v => `
                            ${v}_T &= ${this.lookup.get(VARIABLE_TRUE_PREFIX + v)?.join('')} \\\\
                            ${v}_F &= ${this.lookup.get(VARIABLE_FALSE_PREFIX + v)?.join('')} \\\\
                        `).join('')}
                    \\end{aligned}
                    $$
                </p>
                <p>
                    Now, choosing $\\nu_T$ and $\\nu_F$ will also affect the $j$-th digits of the target sum $\\tau$ for $j \\in [v, k)$.
                    Namely, it will cause these digits to be greater than zero. 
                    This corredsponds to a clause being satisfied. 
                    If the $j$-th digit of $\\tau$, is greater than zero, $digit(\\tau, j) > 0$, 
                    then the clause $\\kappa_{j - v}$ is satisfied. 
                </p>
            `,  
            inSnapshot: this.inInstance.copy(),
            outSnapshot: ssp.copy(),
        };

        return { ssp, step };
    }

    createBufferNumbers(ssp: SSP): ReductionPart {
        this.inInstance.clauses.forEach((c,i) => {
            const val = new Array(this.K).fill(0);
            val[i + this.V] = 1;

            ssp.addNumber({
                id: CLAUSE_FILLER_PREFIX_ONE + c.id,
                label: `\\kappa_{${i}, 0}`,
                value: [...val],
                used: false,
            });
            
            ssp.addNumber({
                id: CLAUSE_FILLER_PREFIX_TWO + c.id,
                label: `\\kappa_{${i}, 1}`,
                value: [...val],
                used: false,
            });
        });

        const step: ReductionStep<CNF3, SSP> = {
            id: `create-buffer-numbers`,
            title: `Create buffer numbers`,
            description: `
                <p>
                    The $j$-th digits, where $j \\in [v,k)$, of the target sum $\\tau = ${this.targetSum}$, are all $3$.
                    With our current set of numbers, a $j$-th digit can be $3$ 
                    iff we choose $\\nu_T$ and $\\nu_F$ 
                    in such a way that a clause $\\kappa_{j - v}$ has all 3 of it's literals be evaluated to $True$.  
                </p>
                <p>
                    We know, however, that a clause $\\kappa_{j - v}$ is satisfied, 
                    if the $j$-th digit is greater than zero. 
                    They don't need to achieve being $3$.  
                </p>
                <p>
                    Therefore, we add buffer numbers to so that all $j$-th digits greater than zero can achieve being $3$. 
                    On the otherhand, we must prohibit $j$-th digit that's currently zero from being able to become $3$.  
                </p>
                <p>
                    To achieve this, we add two buffer numbers, $\\kappa_{i,0}$ and $\\kappa_{i,1}$, for each clause, where
                    
                    $$
                        \\kappa_{i,0} = \\kappa_{i,1} = 10^{i}
                    $$.
                </p>

            `,  
            inSnapshot: this.inInstance.copy(),
            outSnapshot: ssp.copy(),
        };

        return { ssp, step };
    }


    /*
     * Does everything in one step. DONT use this method.
     */
    private doEverything(): ReductionResult<CNF3, SSP> {
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
            ssp.addNumber({ 
                id: VARIABLE_TRUE_PREFIX + v, 
                value: matrix[2 * i],
                used: false, 
            });
            
            ssp.addNumber({ 
                id: VARIABLE_FALSE_PREFIX + v, 
                value: matrix[2 * i + 1],
                used: false,
            });
        }

        // add the clause filler rows
        for (let i = 0; i < clauses.length; i++) {
            ssp.addNumber({
                id: CLAUSE_FILLER_PREFIX_ONE + i,  
                value: matrix[(2 * i) + (2 * variables.length)],
                used: false,
            });
            
            ssp.addNumber({
                id: CLAUSE_FILLER_PREFIX_TWO + i, 
                value: matrix[(2 * i + 1) + (2 * variables.length)],
                used: false,
            });
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

                            return accumString;
                        })()}
                    </ul>
                </p>
                <p>
                    Set the target to ${ssp.target.join('')}.
                </p>
            `,
            inSnapshot: this.inInstance.copy(),
            outSnapshot: ssp.copy(),
            mapping: {},
        });


        return {
            outInstance: ssp,
            steps,
        };
    }

}
