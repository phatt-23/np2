import type { StylesheetStyle } from "cytoscape";
import { BLUE, selectedNode, solvedEdgeRedUsed } from "./common";
import { defaultNode } from "./default";

export const DIRECTED_STYLES: StylesheetStyle[] = [
    ...defaultNode,
    {
        selector: 'edge',
        style: {
            'line-color': 'black',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'black',
            'curve-style': 'bezier',
            'arrow-scale': 2.0,
            'width': 2
        },
    },
    ...solvedEdgeRedUsed,
    ...selectedNode,
]

