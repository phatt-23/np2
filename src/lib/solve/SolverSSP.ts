// Created by phatt-23 on 22/10/2025

import type { SSP, SSPNumber } from "$lib/instance/SSP";
import type { Solver } from "./Solver";
import { CertificateSSP } from "./CertificateSSP";
import { Unsolvable } from "$lib/core/Unsolvable";

export class SolverSSP implements Solver<SSP, CertificateSSP> {
    instance: SSP;

    constructor(instance: SSP) {
        this.instance = instance;
    }

    solve(): CertificateSSP | Unsolvable {
        console.debug('SolverSSP::solve()');

        const numbers = this.instance.numbers;
        const targetValue = parseInt(this.instance.target.join(''));

        // Convert SSPNumber to numeric value
        const values = numbers.map(n => parseInt(n.value.join('')));

        const dp = new Map<number, number>();

        // base case
        dp.set(0, -1); 

        for (let i = 0; i < values.length; i++) {
            const val = values[i];
            const currentSums = Array.from(dp.keys()); // iterate over current sums
            for (const sum of currentSums) {
                const newSum = sum + val;
                if (!dp.has(newSum)) {
                    dp.set(newSum, i); // mark this sum as reachable using number i
                }
            }
        }

        if (!dp.has(targetValue)) {
            return Unsolvable;
        }

        // Reconstruct subset
        const chosen: SSPNumber[] = [];
        let sum = targetValue;
        const used = new Set<number>();

        while (sum > 0) {
            const i = dp.get(sum);
            if (i === undefined || i === -1) break;
            chosen.push(numbers[i]);
            used.add(i);
            sum -= values[i];
        }

        // Mark used numbers
        for (let i = 0; i < numbers.length; i++) {
            numbers[i].used = used.has(i);
        }

        return new CertificateSSP(chosen);
    }
}