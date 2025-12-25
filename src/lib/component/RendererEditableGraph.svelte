<!--
Created by phatt-23 on 19/12/2025

Component rendering the graph and allowing the user to add and remove edges.
-->

<script lang="ts">
    import RendererGraph from '$lib/component/RendererGraph.svelte';
    import type { cytoscapeStyles } from '$lib/core/cytoscapeStyles';
    import { EDGE_ID_PREFIX } from '$lib/core/Id';
    import type { Graph, GraphEdge } from '$lib/instance/Graph';
    import type { CytoscapeLayout } from './RendererGraph';

    type Props = {
        graph: Graph;
        style?: keyof typeof cytoscapeStyles;
        layout?: CytoscapeLayout;
        onAddEdge: (edge: GraphEdge) => void,
        onRemoveEdge: (edge: any) => void,
        directed?: boolean,
    }

    let { 
        graph,
        style = 'DEFAULT',
        layout = 'preset',
        onAddEdge,
        onRemoveEdge,
        directed = false,
    }: Props = $props();

    let firstNode: any = null;

    const onNodeTap = (event: cytoscape.EventObject) => {
        const node = event.target;

        console.debug('firstNode id:', firstNode?.id());
        console.debug('tapped node id:', node.id());

        // first node selected
        if (firstNode == null) {
            console.debug('firstNode selected');
            firstNode = node;
            node.addClass('selected-node');
            return;
        }

        // same node clicked twice, then reset
        if (firstNode.id() == node.id()) {
            console.debug('Same node clicked twice');
            firstNode.removeClass('selected-node');
            firstNode = null;
            return;
        }

        // prevent duplicate (bidirectional) edges
        const existingEdge = graph.edges.some(e =>
            (e.from == firstNode.id() && e.to == node.id()) ||
            (!directed && (e.from == node.id() && e.to == firstNode.id()))
        );

        console.debug('Existing edge:', existingEdge);

        // Reset selection even if edge exists
        if (existingEdge) {
            firstNode.removeClass('selected-node');
            firstNode = null;
            return;
        }

        const fromNodeId = firstNode.id();
        const toNodeId = node.id();
        
        const edgeId = EDGE_ID_PREFIX + `${fromNodeId}-${toNodeId}`;

        const edge: GraphEdge = {
            id: edgeId, 
            from: firstNode.id(),
            to: node.id(),
        };

        // update state
        onAddEdge(edge);
        // graph.addEdge(edge);
        // graph = graph;

        firstNode.removeClass('selected-node');
        firstNode = null;
    }

    const onEdgeTap = (event: cytoscape.EventObject) => {
        event.stopPropagation();
        const edge = event.target;

        // update state
        onRemoveEdge(edge);
        firstNode = null;
    }
</script>

<main>
    <h2 class="dev">Renderer Editable Graph</h2>

    <RendererGraph
        {graph}
        {style}
        {layout}
        {onNodeTap}
        {onEdgeTap}
    >
    </RendererGraph>
</main>
