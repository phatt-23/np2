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

    $effect(() => {
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

        // Save current viewport if cytoscape instance already exists
        const currentPan = cy ? cy.pan() : { x: 0, y: 0 };
        const currentZoom = cy ? cy.zoom() : 1;

        // Initialize cytoscape only once
        if (!cy) {
            cy = cytoscape({
                container: graphContainer,
                wheelSensitivity: 5.0,
                style: cytoscapeStyles[style],
            });
        } else {
            cy.elements().remove();
        }

        cy.add([...nodes, ...edges]);
        cy.style(cytoscapeStyles[style]);
        cy.layout({ name: layout }).run();

        // cy.nodes().ungrabify();
        cy.nodes().grabify();

        // handle adding of edges when clicking consecutivelly on two nodes
        cy.on('tap', 'node', onNodeTap);
        cy.on('tap', 'edge', onEdgeTap);

        // Restore viewport
        cy.zoom(currentZoom);
        cy.pan(currentPan);

        return () => {
            cy.off('tap', 'node', onNodeTap);
            cy.off('tap', 'edge', onEdgeTap);
        }
    });

    $effect(() => {
        cy.panningEnabled(moveEnabled);
        cy.userZoomingEnabled(moveEnabled);
    });
</script>

<section>
    <h2>Graph Renderer</h2>

    <label for="moveEnabledCheckbox">Move Enabled</label>
    <input type="checkbox" bind:checked={moveEnabled} name="moveEnabledCheckbox">

    <div bind:this={graphContainer} id="cy"></div>
</section>

<style>
    #cy {
        width: 1fr;
        height: 40em;
        border: solid black;
    }
</style>
