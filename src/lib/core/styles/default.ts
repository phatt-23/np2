import type { StylesheetStyle } from "cytoscape";
import { BLUE, selectedNode, solvedEdge } from "./common";

export const defaultNode: StylesheetStyle[] = [
    {
        selector: 'node',
        style: {
            // 'label': 'data(id)',
            'text-valign': 'top',
            'color': '#000',
            'background-color': BLUE,
            'text-outline-color': '#fff',
            'text-outline-width': 2,
            'border-color': 'black',
            'border-style': 'solid',
            'border-width': 2,
        },
    },
]

export const defaultEdge: StylesheetStyle[] = [
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'line-color': 'black',
            'width': 2
        }
    },
]


export const DEFAULT_STYLES: StylesheetStyle[] = [
    ...defaultNode,
    ...defaultEdge,
    ...solvedEdge,
    ...selectedNode,
]

