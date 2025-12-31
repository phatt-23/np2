// Created by phatt-23 on 24/12/2025

export const DESTINATIONS: Record<string, Destination> = {
    'HOME': {
        route: '/',
        title: 'Home',
    },
    '3SAT_HCYCLE': {
        route: '/3sat-hcycle',
        title: '3-SAT &rightarrow; HCYCLE',
    },
    'HCYCLE_HCIRCUIT': {
        route: '/hcycle-hcircuit',
        title: 'HCYCLE &rightarrow; HCIRCUIT',
    },
    'HCIRCUIT_TSP': {
        route: '/hcircuit-tsp',
        title: 'HCIRCUIT &rightarrow; TSP',
    },
    '3SAT_SSP': {
        route: '/3sat-ssp',
        title: '3-SAT &rightarrow; SSP',
    },
    '3SAT_3CG': {
        route: '/3sat-3cg',
        title: '3-SAT &rightarrow; 3-CG',
    },
};

type Destination  = {
    route: string;
    title:  string;
};

