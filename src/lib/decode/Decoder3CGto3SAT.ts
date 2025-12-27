// Created by phatt-23 on 20/12/2025

import { assert } from "$lib/core/assert";
import { CG3_ID, NODE_ID_PREFIX_FALSE, NODE_ID_PREFIX_TRUE } from "$lib/core/Id";
import type { TriBool } from "$lib/core/TriBool";
import type { VarName } from "$lib/instance/CNF3";
import type { Graph } from "$lib/instance/Graph";
import type { Certificate3CG } from "$lib/solve/Certificate3CG";
import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
import type { Decoder } from "./Decoder";

export class Decoder3CGto3SAT implements Decoder<Graph, Certificate3CG, Certificate3SAT> {
    decode(_outInstance: Graph, outCert: Certificate3CG): Certificate3SAT {
        const assignment = new Map<VarName, TriBool>();

        outCert.coloring.forEach((value, key) => {
            const color = value;
            const nodeId = key;

            if (nodeId.startsWith(CG3_ID.TRUE_VAR_NODE_PREFIX)) {
                const id = this.cutTruePrefix(nodeId);

                if (color == CG3_ID.COLOR_TRUE) {
                    this.setAssignment(assignment, id, true); 
                } 
                else if (color == CG3_ID.COLOR_FALSE) {
                    this.setAssignment(assignment, id, false); 
                }
            } 
            else if (nodeId.startsWith(CG3_ID.FALSE_VAR_NODE_PREFIX)) {
                const id = this.cutFalsePrefix(nodeId);

                if (color == CG3_ID.COLOR_TRUE) {
                    this.setAssignment(assignment, id, false); 
                } 
                else if (color == CG3_ID.COLOR_FALSE) {
                    this.setAssignment(assignment, id, true); 
                }
            }
        })

        return new Certificate3SAT(assignment);
    }

    private setAssignment(assignment: Map<VarName, TriBool>, id: string, state: TriBool) {
        if (assignment.has(id)) {
            const prevState = assignment.get(id);
            assert(prevState == state, 
                `Id: ${id}` +
                `The current state (${state}) and the previous state (${prevState})` +
                `are not the same.`);
        }

        assignment.set(id, state);
    }

    private cutTruePrefix(id: string): string {
        return id.slice(CG3_ID.TRUE_VAR_NODE_PREFIX.length);
    }
    private cutFalsePrefix(id: string): string {
        return id.slice(CG3_ID.FALSE_VAR_NODE_PREFIX.length);
    }
}
