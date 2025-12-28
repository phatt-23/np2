// Created by phatt-23 on 21/12/2025

import type { Id } from "$lib/core/Id";
import type { GraphNode, Position } from "$lib/instance/Graph";
import type { SSPNumber } from "$lib/instance/SSP";
import type { Coloring } from "$lib/solve/Certificate3CG";

export enum WorkerResponseType {
    UNSOLVABLE = "unsolvable",
    RESULT = "result",
    ERROR = "error",
};

export type WorkerRequest3CG = { graph: string };
export type WorkerResponse3CG =
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { type: WorkerResponseType.RESULT; coloring: [Id, Coloring][] }

export type WorkerRequestSSP = { ssp: string };
export type WorkerResponseSSP = 
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { 
        type: WorkerResponseType.RESULT; 
        numbers: SSPNumber[] 
    }

export type WorkerRequestHCYCLE = { graph: string; };
export type WorkerResponseHCYCLE = 
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { 
        type: WorkerResponseType.RESULT; 
        path: GraphNode[]
    }

export type WorkerRequestTSP = { 
    graph: string;
    maxCost: number; 
};

export type WorkerResponseTSP = 
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { 
        type: WorkerResponseType.RESULT; 
        path: GraphNode[]
    }
    
export type WorkerRequestHCIRCUIT = { graph: string; }
export type WorkerResponseHCIRCUIT = 
    | { type: WorkerResponseType.UNSOLVABLE }
    | { type: WorkerResponseType.ERROR; message: string }
    | { 
        type: WorkerResponseType.RESULT; 
        path: GraphNode[]
    }
    