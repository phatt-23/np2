// Created by phatt-23 on 21/12/2025

import type { Id } from "$lib/core/Id";
import type { Position } from "$lib/instance/Graph";

export enum WorkerResponseType {
    UNSOLVABLE = "unsolvable",
    RESULT = "result",
    ERROR = "error",
};

export type WorkerRequest3CG = { graph: string };
export type WorkerResponse3CG =
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { type: WorkerResponseType.RESULT; coloring: [Id, number][] }

export type WorkerRequestSSP = { ssp: string };
export type WorkerResponseSSP = 
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { 
        type: WorkerResponseType.RESULT; 
        numbers: { 
            id: string;
            value: number[];
            used: boolean;
            classes?: string;
        }[] 
    }

type GraphNodePOD = {
    id: Id;
    label?: string;
    color?: number;  
    position?: Position;
    classes?: string;
}

export type WorkerRequestHCYCLE = { graph: string; };
export type WorkerResponseHCYCLE = 
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { 
        type: WorkerResponseType.RESULT; 
        path: GraphNodePOD[]
    }

    