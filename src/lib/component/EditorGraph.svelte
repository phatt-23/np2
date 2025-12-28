<!-- Created by phatt-23 on 21/10/2025 -->

<script lang="ts">
    import { resolveRoute } from "$app/paths";
    import type { ErrorMessage } from "$lib/core/assert";
    import { DemoProvider } from "$lib/demo/DemoProvider";
    import { Graph } from "$lib/instance/Graph";
    import { error } from "@sveltejs/kit";

    const demos = DemoProvider.getTextInputs(Graph);

    type Props = {
        graph: Graph | null,
        onChange: (graph: Graph) => void;
        onWrongFormat?: (msg: ErrorMessage) => void;
        displayErrorMessages?: boolean;
    }

    let { 
        graph, 
        onChange, 
        onWrongFormat,
        displayErrorMessages = false,
    } : Props = $props();

    let text = $state(graph?.asString() ?? '');
    let selectedDemo = $state('');
    let errorMessage = $state('');
    let instance: Graph | null = null;

    function onTextChange() {
        validateInput();

        if (instance) {
            onChange(instance);
        }
        if (errorMessage) {
            onWrongFormat?.(errorMessage);
        }
    }

    function validateInput() {
        const result = Graph.fromString(text);

        if (typeof result == "string") {
            instance = null;
            errorMessage = result;
        } else {
            instance = result;
            errorMessage = '';
        }
    }

    function handleSelect() {
        text = demos[selectedDemo];
        onTextChange();
    }

    $effect(() => {
        if (graph) {
            text = graph.asString();
        }
    });
</script>

<main class='editor'>
    <h2 class="dev">Graph Editor</h2>

    <p class="comment">Removes duplicate entries automatically.</p>

    <div class="text-wrap">
        <textarea bind:value={text} oninput={validateInput} onchange={onTextChange} spellcheck="false">
        </textarea>

        <div class='input-actions'>
            <select onchange={handleSelect} bind:value={selectedDemo}>
                <option value="">-- choose demo --</option>

                {#each Object.keys(demos) as demo}
                    <option value={demo}>{demo}</option>
                {/each}
            </select>
        </div>

        {#if displayErrorMessages && errorMessage}
            <div class='error-message'>
                <span>{errorMessage}</span>
            </div>
        {/if}
    </div>
</main>


<style lang="sass">
@use "sass:color"

.editor
    display: block

.text-wrap
    position: relative
    width: 100%

.comment
    // display: none
    padding: 0
    margin: 0

textarea
    box-sizing: border-box
    width: 100%
    height: 20em
    resize: vertical
    border-width: 1px
    border-style: solid
    border-radius: 4pt
    border-color: global.$border-color

.input-actions
    display: block
    position: absolute
    top: 1em
    right: 1em

.error-message
    display: block
    position: absolute
    bottom: 1em
    right: 0.25em
    max-width: 30%

    padding: 8px
    color: rgba(200, 0, 0, 1)
    background-color: color.scale(rgb(255,0,0), $alpha: -90%)
    border-radius: 4pt
    border-style: solid
    border-color: color.scale(rgb(255,0,0), $alpha: -80%)
    border-width: 1px

    pointer-events: none
    animation: fadeIn 120ms ease-out

@keyframes fadeIn
    from
        opacity: 0
        transform: translateY(4px)
    to
        opacity: 1
        transform: translateY(0)

</style>
