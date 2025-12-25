<!-- Created by phatt-23 on 21/10/2025 -->

<script lang="ts">
    import type { ErrorMessage } from "$lib/core/assert";
    import { DemoProvider } from "$lib/demo/DemoProvider";
    import { Graph } from "$lib/instance/Graph";
    import { onMount } from "svelte";

    type Props = {
        graph: Graph | null,
        onChange: (graph: Graph) => void;
        onWrongFormat: (msg: ErrorMessage) => void;
    }

    let { graph, onChange, onWrongFormat } : Props = $props();

    let text = $state(graph?.asString() ?? '');

    onMount(() => {
        console.debug('editor text:', graph?.asString(), text);
    });

    let selectedDemo = $state('');
    const demos = DemoProvider.getTextInputs(Graph);

    function onTextChange() {
        const result = Graph.fromString(text);

        if (typeof result == 'string') {
            onWrongFormat(result);
            return;
        }

        onChange(result);
    }

    function onDemoSelect() {
        text = demos[selectedDemo];
        onTextChange();
    }

    $effect(() => {
        if (graph) {
            text = graph.asString();
        }
    });
</script>

<main class='graph-editor'>
    <h2 class="dev">Graph Editor</h2>
    <p class="reminder"><i>Removes duplicate entries automatically.</i></p>

    <textarea bind:value={text} onchange={onTextChange}></textarea>

    <select onchange={onDemoSelect} bind:value={selectedDemo}>
        <option value="">--Choose a demo--</option>

        {#each Object.keys(demos) as demo}
            <option value={demo}>{demo}</option>
        {/each}
    </select>
</main>

<style>
    textarea {
        width: 100%;
        height: 20em;
    }
</style>
