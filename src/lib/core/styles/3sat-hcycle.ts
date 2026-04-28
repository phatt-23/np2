import type { StylesheetStyle } from "cytoscape";
import { BLUE, GREEN, ORANGE, RED, selectedNode, solvedEdge } from "./common";
import { defaultNode } from "./default";

export const SAT_HCYCLE_STYLES: StylesheetStyle[] = [
    ...defaultNode,
    {
        selector: 'node.true',  // vrchol na konci rady 
        style: { 'background-color': GREEN, },
    },
    {
        selector: 'node.false',  // vrchol na druhem konci rady
        style: { 'background-color': RED, },
    },
    {
        selector: 'node.source, node.inbetween, node.target',  // prechodne vrcholy mezi rady promennych
        style: {
            'background-color': 'white',
            'border-style': 'solid',
            'border-color': 'black',
        },
    },
    {
        selector: 'node.clause',  // vrchol reprezentujici klauzuli
        style: { 'background-color': ORANGE },
    },
    {
        selector: 'node.guarantee',  // mezi outgoing a incoming hranami
        style: { 
            'opacity': 0.5,
        },
    },
    {
        selector: 'edge',
        style: {
            'line-color': 'black',
            'target-arrow-color': 'black',
            'target-arrow-shape': 'chevron',
            'curve-style': 'bezier',
            'arrow-scale': 1.0,
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
        selector: 'edge.clause',
        style: {
            'curve-style': 'bezier',
            'width': 3,
            'line-opacity': 1,
            'arrow-scale': 2.0,
        },
    },
    {
        selector: 'edge.true_in',  // true incoming edge
        style: {
            'target-arrow-color': GREEN,
            'line-color': GREEN,
            'line-style': 'dashed',
        },
    },
    {
        selector: 'edge.true_out',  // true outcoming edge
        style: {
            'target-arrow-color': GREEN,
            'line-color': GREEN,
        },
    },
    {
        selector: 'edge.false_in',  // false incoming edge
        style: {
            'target-arrow-color': RED,
            'line-color': RED,
            'line-style': 'dashed',
        },
    },
    {
        selector: 'edge.false_out',  // false outcoming edge
        style: {
            'target-arrow-color': RED,
            'line-color': RED,
        },
    },
    {
        selector: 'edge.target-to-source',
        style: {
            "curve-style": "round-segments",
            "segment-distances": 'data(controlPointDistances)', 
            "segment-weights": [0.0, 1.0],
        },
    },
    ...solvedEdge,
    ...selectedNode,
]

