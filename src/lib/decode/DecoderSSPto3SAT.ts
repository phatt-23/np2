// Created by phatt-23 on 22/10/2025

import { VARIABLE_FALSE_PREFIX, VARIABLE_TRUE_PREFIX } from "$lib/core/Id";
import type { TriBool } from "$lib/core/TriBool";
import type { VarName } from "$lib/instance/CNF3";
import type { SSP } from "$lib/instance/SSP";
import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
import type { CertificateSSP } from "$lib/solve/CertificateSSP";
import type { Decoder } from "./Decoder";

export class DecoderSSPto3SAT implements Decoder<SSP, CertificateSSP, Certificate3SAT> {
    decode(outInstance: SSP, outCert: CertificateSSP): Certificate3SAT {
        console.debug("DecoderSSPto3SAT::decode");

        const assignment = new Map<VarName, TriBool>()

        console.debug('decode from this SSP certificate', outCert);

        for (const sspNumber of outCert.numbers) {
            const n = sspNumber.id;

            if (n.startsWith(VARIABLE_TRUE_PREFIX)) {
                const varName = n.substring(VARIABLE_TRUE_PREFIX.length);

                if (!assignment.has(varName)) {
                    console.debug(`setting variable ${n} to TRUE`)
                    assignment.set(varName, true);
                }
            }
            else if (n.startsWith(VARIABLE_FALSE_PREFIX)) {
                const varName = n.substring(VARIABLE_FALSE_PREFIX.length);

                if (!assignment.has(varName)) {
                    console.debug(`setting variable ${n} to FALSE`)
                    assignment.set(varName, false);
                }
            }
        }

        return new Certificate3SAT(assignment);
    }
}