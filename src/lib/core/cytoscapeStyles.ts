// Created by phatt-23 on 12/10/2025

import type { StylesheetStyle } from 'cytoscape';

const selectedNode = {
    selector: 'node.selected-node',
    style: {
        'background-color': '#ff0000',
    },
};

const solvedNode: StylesheetStyle[] = [
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
        },
    },
];

export const cytoscapeStyles: Record<string, StylesheetStyle[]> = {
    'DEFAULT': [
        {
            selector: 'node',
            style: {
                'label': 'data(id)',
                'text-valign': 'top',
                'color': '#000',
                'background-color': '#61bffc',
                'text-outline-color': '#fff',
                'text-outline-width': 2,
                'border-color': 'black',
                'border-style': 'solid',
                'border-width': 2,
            },
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'line-color': 'black',
                'width': 2
            }
        },
        ...solvedNode,
        selectedNode,
    ],
    '3SAT-HCYCLE': [
        {
            selector: 'node',
            style: {
                // 'label': 'data(id)',
                // 'label': 'data(label)',
                'font-size': 12,
                'text-valign': 'top',
                'background-color': 'blue',
                'border-color': 'black',
                'border-style': 'solid',
                'border-width': 2,
            }
        },
        {
            selector: 'node.true',  // vrchol na konci rady 
            style: { 'background-color': 'green' },
        },
        {
            selector: 'node.false',  // vrchol na druhem konci rady
            style: { 'background-color': 'red' },
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
            style: { 'background-color': 'orange' },
        },
        {
            selector: 'node.guarantee',  // mezi outgoing a incoming hranami
            style: { 'opacity': 0.5 },
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
                'target-arrow-color': 'green',
                'line-color': 'green',
                'line-style': 'dashed',
            },
        },
        {
            selector: 'edge.true_out',  // true outcoming edge
            style: {
                'target-arrow-color': 'green',
                'line-color': 'green',
            },
        },
        {
            selector: 'edge.false_in',  // false incoming edge
            style: {
                'target-arrow-color': 'red',
                'line-color': 'red',
                'line-style': 'dashed',
            },
        },
        {
            selector: 'edge.false_out',  // false outcoming edge
            style: {
                'target-arrow-color': 'red',
                'line-color': 'red',
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
        ...solvedNode,
        selectedNode,
    ],
    'UNDIRECTED': [
        {
            selector: 'node',
            style: {
                // 'label': 'data(id)',
                'text-valign': 'top',
                'color': '#000',
                'background-color': '#61bffc',
                'text-outline-color': '#fff',
                'text-outline-width': 2,
                'border-color': 'black',
                'border-style': 'solid',
                'border-width': 2,
            },
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'line-color': 'black',
                'width': 2
            }
        },
        ...solvedNode,
        selectedNode,
    ],
    'DIRECTED': [
        {
            selector: 'node',
            style: {
                // 'label': 'data(id)',
                'text-valign': 'top',
                'color': '#000',
                'background-color': '#61bffc',
                'text-outline-color': '#fff',
                'text-outline-width': 2,
                'border-color': 'black',
                'border-style': 'solid',
                'border-width': 2,
            },
        },
        {
            selector: 'edge',
            style: {
                'line-color': 'black',
                'target-arrow-shape': 'triangle',
                // 'target-arrow-shape': 'chevron',
                'target-arrow-color': 'black',
                'curve-style': 'bezier',
                'arrow-scale': 2.0,
                'width': 2
            },
        },
        ...solvedNode,
        selectedNode,
    ],
    'HCIRCUIT': [
        {
            selector: 'node',
            style: {
                // 'label': 'data(id)',
                'text-valign': 'top',
                'color': '#000',
                'background-color': '#61bffc',
                'text-outline-color': '#fff',
                'text-outline-width': 2,
                'border-color': 'black',
                'border-style': 'solid',
                'border-width': 2,
            },
        },
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
        ...solvedNode,
        selectedNode,
    ],
    'TSP': [
        {
            selector: 'node',
            style: {
                // 'label': 'data(id)',
                'text-valign': 'top',
                'color': '#000',
                'background-color': '#61bffc',
                'text-outline-color': '#fff',
                'text-outline-width': 2,
                'border-color': 'black',
                'border-style': 'solid',
                'border-width': 2,
            },
        },
        {
            selector: 'edge',
            style: {
                'label': 'data(weight)',
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
        ...solvedNode,
        selectedNode,
    ],
    '3SAT-3CG': [
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
                'background-color': 'green',
            }
        },
        {
            selector: 'node.red, node.F',
            style: {
                'background-color': 'red',
            }
        },
        {
            selector: 'node.blue, node.B',
            style: {
                'background-color': 'blue',
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
                "width": 8,
            }
        },
        ...solvedNode,
        selectedNode,
    ]
};
