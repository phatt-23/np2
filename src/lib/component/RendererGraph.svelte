<!--
Created by phatt-23 on 12/10/2025

Component that renders the graph. 
-->

<script lang="ts">
    import cytoscape from "cytoscape";
    import { cytoscapeStyles } from "$lib/core/cytoscapeStyles";
    import type { Graph } from "$lib/instance/Graph";
    import type { CytoscapeLayout } from "./RendererGraph";
    import { onMount } from "svelte";
    import { getMathjaxSVG } from "$lib/core/svg";
    import katex from "katex";

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


    let cy: cytoscape.Core; 
    let graphContainer: HTMLElement;
    let mathLabelLayer: HTMLElement; // layer with the svg labels
    
    let moveEnabled = $state(false);
    const labelCache = new Map<string, HTMLElement>(); 


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

    function onCytoRender() {
        console.debug('label.length', Array.from(labelCache.entries()).length);

        console.debug('render');

        cy.nodes().forEach(node => {
            const label = node.data('label');
            if (!label) {
                return;
            }

            let elem = labelCache!.get(label);

            // console.debug('node.label', label, 'elem', elem);

            // create svg once, cache it
            if (!elem) {
                console.debug('creating svg');
                elem = document.createElement('div');
                elem.style.position = 'absolute';
                // elem.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                const texHtml = katex.renderToString(label);
                // const texHtml = getMathjaxSVG(label);
                elem.innerHTML = texHtml; 

                // const svg = elem.getElementsByTagName('svg')[0];
                // svg.style.padding = '0px';

                labelCache!.set(label, elem);         
                mathLabelLayer.append(elem);
            }

            const elemBox = elem.getBoundingClientRect();

            const nodePos = node.renderedPosition();
            const nodeBox = node.renderedBoundingbox();
            const zoom = cy.zoom();

            elem.style.display = 'flex';
            elem.style.justifyContent = 'center';
            elem.style.alignContent = 'center';
            elem.style.transformOrigin = '0 0';
            elem.style.transform = `
                translate(${nodePos.x}px, ${nodePos.y}px)
                translate(0px, ${nodeBox.h * 0.75}px)
                translate(${-elemBox.width/2}px, ${-elemBox.height/2}px)
                scale(${zoom})
            `;

        });

    }

    function onCytoResize() {
        console.debug('resize');
        if (!mathLabelLayer){
            return;
        }

        mathLabelLayer.style.width = cy.width() + 'px';
        mathLabelLayer.style.height = cy.height() + 'px';
    }

    function onCytoRemove(event: cytoscape.EventObject) {
        const id = event.target.id();
        const svgEl = labelCache.get(id);

        if (svgEl) {
            svgEl.remove();
            labelCache.delete(id);
        }
    }

    // initialize cytoscape only once at mounting
    onMount(() => {
        cy = cytoscape({
            container: graphContainer,
            wheelSensitivity: 5.0,          // TODO: Only for debugging to make it faster.
            style: cytoscapeStyles[style],
        });

        // register handlers
        cy.on('tap', 'node', onNodeTap);  
        cy.on('tap', 'edge', onEdgeTap);  
        cy.on('resize', onCytoResize);
        cy.on('remove', 'node', (event) => onCytoRemove(event));
        cy.on('render', onCytoRender);
    });

    // when graph changes
    $effect(() => {
        const nodes: cytoscape.ElementDefinition[] = graph.nodes.map(n => ({
            data: { 
                id: n.id, 
                label: n.label ?? n.id, 
            },
            position: n.position,
            classes: n.classes,
        }));

        const edges: cytoscape.ElementDefinition[] = graph.edges.map(e => ({
            data: { 
                id: e.id, 
                source: e.from, 
                target: e.to,
                weight: e.weight,
                controlPointDistances: e.controlPointDistances,
            },
            classes: e.classes,
        }));

        cy.elements().remove();
        cy.add([...nodes, ...edges]);
        cy.style(cytoscapeStyles[style]);

        let layoutInstance: cytoscape.Layouts = cy.layout({ name: layout });

        layoutInstance.pon('layoutstop').then(() => {
            console.debug('layoutstop');
            enableMovement(true);  // without this enabled the fitting won't take effect

            cy.resize();
            cy.reset();
            cy.fit(cy.elements(), 20);
           
            enableMovement(moveEnabled);  // restore
            onCytoRender();  // without this the labels are moved to the left
        });

        layoutInstance.run();

        labelCache.forEach(elem => elem.style.display = 'none');
    });

    $effect(() => enableMovement(moveEnabled));
</script>

<main>
    <h2 class="dev">Graph Renderer</h2>

    <div class="graph-wrapper">
        
        <div bind:this={graphContainer} id="cy">
        
            <div bind:this={mathLabelLayer} id="math-label-layer">
            </div>
        
        </div>

        
        <div class='actions'>
        
            <label class="checkbox-wrapper">
                <input type="checkbox" bind:checked={moveEnabled}>
                Move Enabled
            </label>
        
        </div>
    </div>
</main>

<style lang="sass">
    @use "sass:color"

    main 
        height: 100%

    #cy 
        width: 1fr
        height: 40em
        border-width: 1px
        border-style: solid
        border-radius: 4pt
        border-color: global.$border-color
        overflow: hidden

    .graph-wrapper
        position: relative

    .actions
        z-index: 999
        position: absolute
        top: 1em
        right: 1em
        background-color: rgba(255,255,255,0.8)
        border-color: color.scale(global.$border-color, $alpha: -50%)
        border-width: 1px
        border-style: solid
        border-radius: 4pt
        padding: 2px

    #math-label-layer 
        z-index: 10
        position: absolute
        top: 0
        left: 0
</style>
