import type { StylesheetStyle } from "cytoscape";

// ayu
export const RED     = '#EA6C73'
export const BLUE    = '#53BDFA'
export const GREEN   = '#91B362'

// const GREEN   = '#a7c080'
// const RED = '#ff7272';
// const BLUE = '#74a4ff'; 

export const ORANGE = '#FFBC5D'

export const selectedNode: StylesheetStyle[] = [
    {
        selector: 'node.selected-node',
        style: {
            'background-color': RED,
        },
    },
]

export const solvedEdge: StylesheetStyle[] = [
    {
        selector: 'edge.solved',  
        style: {
            'line-opacity': 0.25,
        },
    },
    {
        selector: 'edge.solved.used',  
        style: {
            'line-opacity': 1,
        },
    },
];

export const solvedEdgeRedUsed: StylesheetStyle[] = [
    {
        selector: 'edge.solved',  
        style: {
            'line-opacity': 0.4,
        },
    },
    {
        selector: 'edge.solved.used',  
        style: {
            'line-opacity': 1,
            'line-color': RED,
            'target-arrow-color': RED,
            // 'width': 4,
        },
    },
];

