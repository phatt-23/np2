import type { StylesheetStyle } from "cytoscape";
import { BLUE, selectedNode, solvedEdgeRedUsed } from "./common";
import { defaultNode } from "./default";

export const UNDIRECTED_STYLES: StylesheetStyle[] = [
    ...defaultNode,
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'line-color': 'black',
            'width': 2
        }
    },
    ...solvedEdgeRedUsed,
    ...selectedNode,
]

