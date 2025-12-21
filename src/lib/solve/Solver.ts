// Created by phatt-23 on 19/20/2025

import type { Unsolvable } from "$lib/core/Unsolvable";
import { ProblemInstance } from "$lib/instance/ProblemInstance";
import type { Certificate } from "./Certificate";

export interface Solver<I extends ProblemInstance, C extends Certificate> {
    instance: I;

    solve() : C | Unsolvable;
};

