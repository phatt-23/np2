// Created by phatt-23 on 12/10/2025

import type { StylesheetStyle } from 'cytoscape';
import { DEFAULT_STYLES } from './styles/default';
import { UNDIRECTED_STYLES } from './styles/undirected';
import { DIRECTED_STYLES } from './styles/directed';
import { SAT_HCYCLE_STYLES } from './styles/3sat-hcycle';
import { HCIRCUIT_STYLES } from './styles/hcircuit';
import { TSP_STYLES } from './styles/tsp';
import { SAT_3CG_STYLES } from './styles/3sat-3cg';

export const cytoscapeStyles: Record<string, StylesheetStyle[]> = {
    'DEFAULT': DEFAULT_STYLES,
    'UNDIRECTED': UNDIRECTED_STYLES,
    'DIRECTED': DIRECTED_STYLES,
    '3SAT-HCYCLE': SAT_HCYCLE_STYLES,
    'HCIRCUIT': HCIRCUIT_STYLES,
    'TSP': TSP_STYLES,
    '3SAT-3CG': SAT_3CG_STYLES,
};


