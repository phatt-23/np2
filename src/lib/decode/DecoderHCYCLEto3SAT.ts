// Created by phatt-23 on 19/10/2025

import { 
    NODE_ID_PREFIX_FALSE,
    NODE_ID_PREFIX_TRUE,
} from "$lib/core/Id";

import type { TriBool } from "$lib/core/TriBool";
import type { VarName } from "$lib/instance/CNF3";
import type { Graph } from "$lib/instance/Graph";
import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
import type { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
import type { Decoder } from "./Decoder";

export class DecoderHCYCLEto3SAT implements Decoder<Graph, CertificateHCYCLE, Certificate3SAT> {
    decode(_outInstance : Graph, outCert : CertificateHCYCLE) : Certificate3SAT {
        const { path } = outCert;

        const assignment = new Map<VarName, TriBool>();

        for (let i = 0; i < path.length; i++) {
            const p = path[i].id;
            // examples of node names. 
            // n%t:some_name_1
            // n%t:some_other_name_1_1
            // n%f:some_other_name_1_2
            // n%t:some_other_name_2_1
            // n%f:some_other_name_2_3
            
            if (p.startsWith(NODE_ID_PREFIX_TRUE)) {
                const varName = p
                    .substring(
                        NODE_ID_PREFIX_TRUE.length, 
                        p.lastIndexOf('_')
                    );

                // set to true, only if it wasn't set before
                if (!assignment.has(varName)) {
                    assignment.set(varName, true);
                }
            } 
            else if (p.startsWith(NODE_ID_PREFIX_FALSE)) {
                const varName = p
                    .substring(
                        NODE_ID_PREFIX_FALSE.length, 
                        p.lastIndexOf('_')
                    );

                if (!assignment.has(varName)) {
                    assignment.set(varName, false);
                }
            } 
        }

        return new Certificate3SAT(assignment);
    }
}