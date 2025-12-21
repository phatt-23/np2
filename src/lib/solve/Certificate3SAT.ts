// Created by phatt-23 on 19/10/2025

import Serializer from "$lib/core/Serializer";
import type { TriBool } from "$lib/core/TriBool";
import type { VarName } from "$lib/instance/CNF3";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass("Certificate3SAT")
export class Certificate3SAT implements Certificate {
    public assignments : Map<VarName, TriBool>;

    constructor(assignment : Map<VarName, TriBool>) {
        this.assignments = assignment;
    }
}