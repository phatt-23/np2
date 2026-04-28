import type { StylesheetStyle } from "cytoscape";
import { selectedNode, solvedEdgeRedUsed } from "./common";
import { defaultNode } from "./default";

export const WEIGHTED_UNDIRECTED_STYLES: StylesheetStyle[] = [
    ...defaultNode,
    {
        selector: 'edge',
        style: {
            'label': 'data(weight)',
            'curve-style': 'bezier',
            'line-color': 'black',
            'text-background-color': '#fff',
            'text-background-opacity': 1,
            'text-background-padding': '2',
            'width': 2
        }
    },
    {
        selector: 'edge.solid',
        style: {
            'opacity': 1.0,
            'line-opacity': 1.0,
        }
    },
    {
        selector: 'edge.muted',
        style: {
            'opacity': 0.75,
            'line-opacity': 0.75,
        }
    },
    ...solvedEdgeRedUsed,
    ...selectedNode,
]
