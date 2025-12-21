//
// Created by phatt-23 on 11/10/2025
//

import { assert, type ErrorMessage } from "$lib/core/assert";
import { onlyUnique } from "$lib/core/filters";
import { CNF3_ID, type Id } from "$lib/core/Id";
import Serializer from "$lib/core/Serializer";
import { ProblemInstance } from "./ProblemInstance";

export type VarName = string;

@Serializer.SerializableClass("Literal")
export class Literal {
    public id: Id;
    public varName: VarName;
    public negated: boolean;

    constructor(id: Id, varName: VarName, negated: boolean = false) {
        this.id = id;
        this.varName = varName;
        this.negated = negated;
    }

    public toJson() {
        return {
            __type: Literal.name,
            id: this.id,
            varName: this.varName,
            negated: this.negated,
        }
    }

    public asString(): string {
        return `${this.negated ? '!' : ''}${this.varName}`;
    }

    public asHtmlString() : string {
        return (this.negated ? '&not;' : '') + this.varName;
    }
}

@Serializer.SerializableClass("Clause")
export class Clause {
    public id: Id;
    public literals: [Literal, Literal, Literal];

    constructor(id: Id, lits: Literal[]) {
        assert(lits.length == 3);

        this.id = id;
        this.literals = [lits[0], lits[1], lits[2]];
    }

    public asString() : string {
        return this.literals.map(l => l.asString()).join(" ");
    }

    public asHtmlString() : string {
        const vars = this.literals.map(l => l.asHtmlString());
        return '(' + vars.join('&or;') + ')';
    }

    public toJSON() {
        return {
            __type: Clause.name,
            id: this.id,
            literals: this.literals,
        }
    }
}

@Serializer.SerializableClass("CNF3")
export class CNF3 extends ProblemInstance {
    public _variables: Set<VarName> = new Set();
    public _clauses: Set<Clause> = new Set();

    public addVariable(v: VarName) {
        this._variables.add(v);
    }

    public addClause(clause: Clause): void {
        this._clauses.add(clause);
        clause.literals.forEach(literal => this.addVariable(literal.varName));
    }

    public asString() {
        return Array.from(this._clauses.values()).map(c => c.asString()).join("\n")
    }

    public asHtmlString() {
        return this.clauses.map(c => c.asHtmlString()).join('&and;');
    }

    public get variables() : Array<VarName> {
        return Array.from(this._variables.values());
    }
    public get clauses() : Array<Clause> {
        return Array.from(this._clauses.values());
    }

    public isEmpty(): boolean {
        const empty = this.clauses.length == 0 || this.variables.length == 0;
        return empty;
    }

    public static fromString(text: string): CNF3 | ErrorMessage {
        const lines = text.split("\n").map(x => x.trim()).filter(x => x.length).filter(onlyUnique);

        let cnf = new CNF3();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const words = line.split(" ").map(word => word.trim()).filter(word => word.length);

            if (words.length != 3) {
                return `Clause number ${i + 1} (${line}) doesn't have exactly 3 literals.` +
                       `Instead it has ${words.length} literals.`;
            }
           
            const clauseId = CNF3_ID.CLAUSE_PREFIX + i;

            let lits: Literal[] = [];
            for (let j = 0; j < words.length; j++) {
                let word = words[j];

                // find out if its negated literal
                const negated = word.startsWith("!");
                if (negated) {
                    word = word.replace("!", "");  // replace the first occurence
                }

                // verify that is only has allowed characters
                if (word.includes("!") || word.includes("||") || word.includes("&&")) {
                    return `Literal ${negated ? "!" : ""}${word} is invalid.`;
                }

                const varId = CNF3_ID.VAR_PREFIX + j;

                const lit = new Literal(`${varId}-${clauseId}`, word, negated);
                lits.push(lit);
            }

            assert(lits.length == 3);

            const clause = new Clause(clauseId, lits);
            cnf.addClause(clause);
        }

        return cnf;
    }

    public copy(): CNF3 {
        const cnf = new CNF3();

        // Copy variables
        this._variables.forEach(v => cnf.addVariable(v));

        // Copy clauses and literals
        this._clauses.forEach(clause => {
            const newLits = clause.literals.map(lit => 
                new Literal(lit.id, lit.varName, lit.negated)
            );
            const newClause = new Clause(clause.id, newLits);
            cnf.addClause(newClause);
        });

        return cnf;
    }


    public toSerializedString(): string {
        throw 'Not implemented';
    }

    public static fromSerializedString(_serialized: string): CNF3 {
        throw 'Not implemented';
    }
}
