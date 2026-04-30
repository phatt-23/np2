import type { StylesheetStyle } from "cytoscape";
import { selectedNode, solvedEdgeRedUsed } from "./common";
import { defaultEdge, defaultNode } from "./default";

export const UNDIRECTED_STYLES: StylesheetStyle[] = [
    ...defaultNode,
    ...defaultEdge,
    ...solvedEdgeRedUsed,
    ...selectedNode,
]

