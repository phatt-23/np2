import type { StylesheetStyle } from "cytoscape";
import { BLUE, GREEN, RED, selectedNode, solvedEdge } from "./common";

export const SAT_3CG_STYLES: StylesheetStyle[] = [
    {
        selector: 'node',
        style: {
            // 'label': 'data(id)',
            'font-size': 12,
            'text-valign': 'top',
            'background-color': 'white',
            'border-color': 'black',
            'border-style': 'solid',
            'border-width': 2,
        },
    },
    {
        selector: 'edge.muted',  // hrany, u kterych neni dulezite jejich viditelnost
        style: {
            'line-opacity': 0.2,
            'line-color': 'black',
        },
    },
    {
        selector: 'node.green, node.T',
        style: {
            'background-color': GREEN,
        }
    },
    {
        selector: 'node.red, node.F',
        style: {
            'background-color': RED,
        }
    },
    {
        selector: 'node.blue, node.B',
        style: {
            'background-color': BLUE,
        }
    },
    {
        selector: 'edge.core',
        style: {
            'curve-style': 'bezier',
            'line-color': 'black',
            'width': 1,
        },
    },
    {
        "selector": "edge.outer-circle",
        "style": {
            "curve-style": "unbundled-bezier",
            "control-point-distances": 'data(controlPointDistances)',
            "control-point-weights": [0.250, 0.75],
            "width": 4,
        }
    },
    ...solvedEdge,
    ...selectedNode,
]

