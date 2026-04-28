import type { StylesheetStyle } from "cytoscape";
import { BLUE, selectedNode, solvedEdgeRedUsed } from "./common";
import { defaultNode } from "./default";

export const HCIRCUIT_STYLES: StylesheetStyle[] = [
    // {
    //     selector: 'node',
    //     style: {
    //         // 'label': 'data(id)',
    //         'text-valign': 'top',
    //         'color': '#000',
    //         'background-color': BLUE,
    //         'text-outline-color': '#fff',
    //         'text-outline-width': 2,
    //         'border-color': 'black',
    //         'border-style': 'solid',
    //         'border-width': 2,
    //     },
    // },
    ...defaultNode,
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'line-color': 'black',
            'text-background-color': '#fff',
            'text-background-opacity': 1,
            'text-background-padding': '4',
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
            'opacity': 0.4,
            'line-opacity': 0.4,
        }
    },
    ...solvedEdgeRedUsed,
    ...selectedNode,
]

