// Created by phatt-23

import type { ErrorMessage } from "$lib/core/assert";
import Serializer from "$lib/core/Serializer";
import { ProblemInstance } from "./ProblemInstance";

export type SSPNumber = {
    id: string;
    label?: string;
    value: number[];
    used: boolean;
    classes?: string;
};

@Serializer.SerializableClass("SSP")
export class SSP extends ProblemInstance {
    public numbers: SSPNumber[];
    public target: number[];

    public constructor() {
        super(); 
        this.numbers = [];
        this.target = [0];
    }

    public addNumber(x: SSPNumber) {
        this.numbers.push(x);
    }

    public setNumberValue(id: string, val: number[]) {
        const x = this.numbers.find(x => x.id === id)
        if (x) {
            x.value = val;
        }
    }

    public getNumber(id: string): SSPNumber | undefined {
        return this.numbers.find(x => x.id == id)
    }

    public setTarget(target: number[]) {
        this.target = target;
    }

    public isEmpty(): boolean {
        return this.numbers.length == 0;
    }

    public static fromString(numbersText: string, targetText: string): SSP | ErrorMessage {
        const ssp = new SSP();

        if (!numbersText) {
            return `SSP cannot be constructed from an empty string`;
        }

        const lines = numbersText.split('\n').map(x => x.trim()).filter(x => x.length);

        try {
            const target = Array(targetText).map(c => Number.parseInt(c));
            ssp.setTarget(target);
        } catch (e) {
            return `Couldn't parse the target number: ${targetText}`;
        }

        lines.forEach((line, i) => {
            try {
                const numArray = Array.from(line).map(c => Number.parseInt(c));
                const sspNumber: SSPNumber = {
                    id: `${i}`,
                    value: numArray,
                    used: false,
                };

                ssp.addNumber(sspNumber);
            } catch (e) {
                return `Couldn't parse the number on the line ${i}: ${line}.`;
            }
        });

        return ssp;
    }

    public toSerializedString(): string {
        const data = {
            numbers: this.numbers.map(n => ({
                id: n.id,
                label: n.label ?? null,
                value: n.value,
                used: n.used,
                classes: n.classes ?? null,
            })),
            target: this.target,
        };
        
        return JSON.stringify(data);
    }

    public static fromSerializedString(serialized: string): SSP {
        const ssp = new SSP();
        const data = JSON.parse(serialized);

        ssp.setTarget(data.target);

        if (Array.isArray(data.numbers)) {
            for (const n of data.numbers) {
                const sspNumber: SSPNumber = {
                    id: n.id,
                    label: n.label ?? undefined,
                    value: n.value,
                    used: n.used,
                    classes: n.classes ?? undefined,
                };

                ssp.addNumber(sspNumber);
            }
        }

        return ssp;
    }

    copy(): SSP {
        const copy = new SSP();

        // Copy the target array
        copy.setTarget([...this.target]);

        // Copy all SSPNumbers
        this.numbers.forEach(n => {
            copy.addNumber({
                id: n.id,
                label: n.label,
                value: [...n.value],
                used: n.used,
                classes: n.classes,
            });
        });

        return copy;
    }
}
