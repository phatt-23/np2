// Created by phat-23 on 19/10/2025

import { CNF3 } from "$lib/instance/CNF3";
import { Graph } from "$lib/instance/Graph";
import type { ProblemInstance } from "$lib/instance/ProblemInstance";

export class DemoProvider {
    // Predefined demos for CNF3
    private static cnf3TextInput: Record<string, string> = {
        NO_SOLUTION: 
`x y z
!x y z
x !y z
!x !y z
x y !z
!x y !z
x !y !z
!x !y !z
`,
        BASIC: 
`x y z
a b c
`,
        FALSE: 
`!x !x !x
!y !y x
!x !x y
`,
        FALSE_NOSOL: 
`!x !x !x
!y !y x
!x !x y
x x x
`,
        };

    private static graphTextInput : Record<string, string> = {
        CYCLE: 
`0 1
1 2
2 3
3 4
4 0
`,
        PATH:
`0 1
1 2
2 3
3 4
`,
        COMPLETE: 
`0 1
1 2
2 3
3 4

0 2
0 3
0 4

1 3
1 4

2 4
`,
    }

    /**
     * Uses constructor references instead of generics
     */
    public static getTextInputs(instanceClass: new (...args: any[]) => ProblemInstance) : Record<string, string> {
        if (instanceClass === CNF3) {
            return DemoProvider.cnf3TextInput;
        }
        if (instanceClass === Graph) {
            return DemoProvider.graphTextInput;
        }

        throw new Error(`No demos provided for class ${instanceClass.name}.`);
    }
}
