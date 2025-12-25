<!--
Created by phatt-23 on 12/10/2025

Component that renders the graph. 
-->

<script lang="ts">
    import { cytoscapeStyles } from "$lib/core/cytoscapeStyles";
    import type { Graph } from "$lib/instance/Graph";
    import cytoscape, { type ElementDefinition } from "cytoscape";
    import type { CytoscapeLayout } from "./RendererGraph";

    type Props = {
        graph: Graph;
        style?: keyof typeof cytoscapeStyles;
        layout?: CytoscapeLayout;
        onNodeTap?: (event: cytoscape.EventObject) => void,
        onEdgeTap?: (event: cytoscape.EventObject) => void,
    }

    let { 
        graph,
        style = 'DEFAULT',
        layout = 'preset',
        onNodeTap = () => {},
        onEdgeTap = () => {},
    }: Props = $props();

    let graphContainer: HTMLElement;
    let cy: cytoscape.Core; 

    let moveEnabled = $state(false);

    function enableMovement(v: boolean) {
        cy.panningEnabled(v);
        cy.userZoomingEnabled(v);

        if (v) {
            cy.nodes().grabify();
        }
        else {
            cy.nodes().ungrabify();
        }
    }

    $effect(() => {
        console.debug('running effect');

        const nodes: ElementDefinition[] = graph.nodes.map(n => ({
            data: { id: n.id, label: n.id },
            position: n.position,
            classes: n.classes,
        }));

        const edges: ElementDefinition[] = graph.edges.map(e => ({
            data: { 
                id: e.id, 
                source: e.from, 
                target: e.to,
                weight: e.weight,
                controlPointDistances: e.controlPointDistances,
            },
            classes: e.classes,
        }));

        // Initialize cytoscape only once
        if (!cy) {
            cy = cytoscape({
                container: graphContainer,
                wheelSensitivity: 5.0,
                style: cytoscapeStyles[style],
            });

            // handle adding of edges when clicking consecutivelly on two nodes
            cy.on('tap', 'node', onNodeTap);
            cy.on('tap', 'edge', onEdgeTap);
        } else {
            cy.elements().remove();
        }

        cy.add([...nodes, ...edges]);
        cy.style(cytoscapeStyles[style]);

        const layoutInstance = cy.layout({ name: layout, });

        layoutInstance.pon('layoutstop').then(() => {
            console.log('layoutstop promise fulfilled');
            cy.resize();
            cy.reset();
            cy.fit(cy.elements(), 20);
           
            // restore
            enableMovement(moveEnabled);
        });

        // i don't why, but without this enabled the fitting won't take effect
        enableMovement(true);

        layoutInstance.run();
    });

    $effect(() => {
        enableMovement(moveEnabled);
    });
</script>

<main>
    <h2 class="dev">Graph Renderer</h2>

    <label for="moveEnabledCheckbox">Move Enabled</label>
    <input type="checkbox" bind:checked={moveEnabled} name="moveEnabledCheckbox">

    <div bind:this={graphContainer} id="cy"></div>
</main>

<style>
    main {
        height: 100%;
    }

    #cy {
        width: 1fr;
        height: 40em;
        border: 1px solid black;
    }
</style>
