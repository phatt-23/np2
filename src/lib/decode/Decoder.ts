// Created by phatt-23 on 19/10/2025

import type { ProblemInstance } from "$lib/instance/ProblemInstance";
import type { Certificate } from "$lib/solve/Certificate";

export interface Decoder<O extends ProblemInstance, OC extends Certificate, IC extends Certificate> {
    decode(outInstance : O, outCert : OC) : IC;
}