//
// Created by phatt-23 on 11/10/2025
//

export type ErrorMessage = string;

export class AssertionError extends Error {}

export function assert(condition: unknown, msg?: ErrorMessage): asserts condition {
    if (!condition) {
        throw new AssertionError("[ASSERT] " + msg);
    }
}