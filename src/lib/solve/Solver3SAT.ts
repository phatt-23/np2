// Created by phatt-23 on 19/10/2025

import type { TriBool } from "$lib/core/TriBool";
import { Unsolvable } from "$lib/core/Unsolvable";
import { Literal, type Clause, type CNF3, type VarName } from "$lib/instance/CNF3";
import { Certificate3SAT } from "./Certificate3SAT";
import { type Solver } from "./Solver";

export class Solver3SAT implements Solver<CNF3, Certificate3SAT> {
    instance : CNF3;

    constructor(instance : CNF3) {
        this.instance = instance;
    }

    public solve() : Certificate3SAT | Unsolvable {
        if (this.instance.isEmpty()) {
            throw new Error("CNF instance is empty.");
        }

        const clauses = this.instance.clauses;
        const vars = this.instance.variables;

        const result = this.dpll(clauses, {}, vars);

        if (result) {
            const assignment = new Map<VarName, TriBool>(); 

            for (const v of this.instance.variables) {
                if (result[v] != undefined) {
                    assignment.set(v, result[v]);
                } else {
                    assignment.set(v, 'either');
                }
            }
            return new Certificate3SAT(assignment);
        }

        return Unsolvable;
    }

    /** 
     * Recursive DPLL algorithm 
     */
    private dpll(
        clauses : Clause[],
        assignment : Record<VarName, boolean>,
        variables : VarName[]
    ) : Record<VarName, boolean> | null {
        // Check if all clauses are satisfied
        if (clauses.every(c => this.isClauseSatisfied(c, assignment))) {
            return assignment;
        }

        // If any clause is unsatisfiable (all literals are false), backtrack
        if (clauses.some(c => this.isClauseUnsatisfied(c, assignment))) {
            return null;
        }

        // Unit propagation (if clause has only one unassigned literal)
        const unitClause = clauses.find(c => this.isUnitClause(c, assignment));

        if (unitClause) {
            const lit = this.getUnassignedLiteral(unitClause, assignment)!;
            const newAssignment = { ...assignment, [lit.varName]: !lit.negated };
            return this.dpll(clauses, newAssignment, variables);
        }

        // Pure literal elimination (if variable always appears with same polarity)
        const pureLit = this.findPureLiteral(clauses, assignment);
        if (pureLit) {
            const newAssignment = { ...assignment, [pureLit.varName]: !pureLit.negated };
            return this.dpll(clauses, newAssignment, variables);
        }

        // Choose an unassigned variable and branch
        const unassigned = variables.find(v => !(v in assignment));
        if (!unassigned) return null; // no variables left to assign

        // Try both truth values
        return (
            this.dpll(clauses, { ...assignment, [unassigned]: true }, variables) ??
            this.dpll(clauses, { ...assignment, [unassigned]: false }, variables)
        );
    }

    /** 
     * Clause satisfied if any literal evaluates to true 
    */
    private isClauseSatisfied(clause : Clause, assignment : Record<VarName, boolean>) : boolean {
        return clause.literals.some(l => {
            const val = assignment[l.varName];
            return val !== undefined && (l.negated ? !val : val);
        });
    }

    /** 
     * Clause unsatisfied if all literals are assigned and false 
     */
    private isClauseUnsatisfied(clause : Clause, assignment : Record<VarName, boolean>) : boolean {
        return clause.literals.every(l => {
            const val = assignment[l.varName];
            return val !== undefined && (l.negated ? val : !val);
        });
    }

    /** 
     * Returns true if this is a unit clause (1 unassigned literal, others false) 
     */
    private isUnitClause(clause : Clause, assignment : Record<VarName, boolean>) : boolean {
        const unassigned = clause.literals.filter(l => assignment[l.varName] === undefined);
        if (unassigned.length !== 1) return false;

        // all others must be false
        return clause.literals
            .filter(l => assignment[l.varName] !== undefined)
            .every(l => (l.negated ? assignment[l.varName] : !assignment[l.varName]));
    }

    private getUnassignedLiteral(clause : Clause, assignment : Record<VarName, boolean>) : Literal | undefined {
        return clause.literals.find(l => assignment[l.varName] === undefined);
    }

    /** 
     * Finds a pure literal: appears only as negated or only as positive 
    */
    private findPureLiteral(clauses: Clause[], assignment: Record<VarName, boolean>) : Literal | null {
        const counts: Record<VarName, { pos : boolean; neg : boolean }> = {};

        for (const clause of clauses) {
            for (const lit of clause.literals) {
                if (assignment[lit.varName] !== undefined) continue;

                if (!(lit.varName in counts)) counts[lit.varName] = { 
                    pos: false, 
                    neg: false 
                };

                if (lit.negated) counts[lit.varName].neg = true;
                else counts[lit.varName].pos = true;
            }
        }

        for (const [v, info] of Object.entries(counts)) {
            if (info.pos && !info.neg) {
                return new Literal(`pure-${v}`, v, false);
            }

            if (!info.pos && info.neg) {
                return new Literal(`pure-${v}`, v, true);
            }
        }

        return null;
    }
}
