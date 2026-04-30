<!--
    Created by phatt-23 on 11/10/2025
-->

<script lang="ts">
    import type { ErrorMessage } from "$lib/core/assert";
    import { CNF3 } from "$lib/instance/CNF3";
    import Comments from "./Comments.svelte";

    type Props = {
        cnf: CNF3 | null;
        onChange: (cnf: CNF3) => void;
        onWrongFormat?: (message: ErrorMessage) => void;
        displayErrorMessages?: boolean;
        demos: Record<string, string>;
    };

    let {
        cnf,
        onChange,
        onWrongFormat,
        demos,
        displayErrorMessages = false,
    }: Props = $props();

    let text = $state(cnf?.asString() ?? "");
    let selectedDemo = $state("");
    let errorMessage = $state("");
    let instance: CNF3 | null = null;

    function onTextChange() {
        validateInput();

        if (instance) {
            onChange?.(instance);
        } else {
            onWrongFormat?.(errorMessage);
        }
    }

    function validateInput() {
        const result = CNF3.fromString(text);

        if (typeof result == "string") {
            instance = null;
            errorMessage = result;
        } else {
            instance = result;
            errorMessage = "";
        }
    }

    function handleSelect() {
        if (Object.keys(demos).includes(selectedDemo)) {
            text = demos[selectedDemo];
            onTextChange();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            onTextChange();
        }
        else if (e.key === "Escape") {
            onTextChange();
            (e.target as HTMLTextAreaElement).blur();
        }
    }

    $effect(() => {
        if ( cnf && (!instance || !cnf.isEqual(instance)) ) {
            text = cnf.asString()
        }
    })

    const comments = [
        "Each line defines a clause. A clause consists of three variable names separated by spaces.",
        "A variable name is a single word containing only letters (<span>a–z</span>, <span>A–Z</span>), digits (<span>0–9</span>) " +
            "and the symbols <span>_</span>, <span>,</span>, <span>\\</span>, <span>(</span>, <span>)</span>, <span>{</span>, <span>}</span>.",
        "The symbol <span>\\</span> must be followed by letters (e.g. <span>\\alpha</span>, <span>\\beta_{\\gamma_5}</span>).",
        "Variable names must not include spaces.",
        "A variable is negated by prefixing it with <span>!</span>.",
        "Any duplicate clauses will be removed automatically.",
    ];
</script>

<div class="editor">
    <h2 class="dev">CNF Editor</h2>

    <Comments {comments} />

    <div class="text-wrap">

        <textarea
            bind:value={text}
            oninput={validateInput}
            onchange={onTextChange}
            onkeydown={handleKeydown}
            spellcheck="false"
        >
        </textarea>

        <div class="input-actions">
            <select onchange={handleSelect} bind:value={selectedDemo}>
                <option disabled selected value="" hidden>-- Choose demo --</option>

                {#each Object.keys(demos) as demo}
                    <option value={demo}>{demo}</option>
                {/each}
            </select>
        </div>

        {#if displayErrorMessages && errorMessage}
            <div class="error-message">
                <span>{errorMessage}</span>
            </div>
        {/if}
    </div>

</div>

<style lang="sass">
@use "sass:color"

.editor
    display: block

.text-wrap
    position: relative
    width: 100%

textarea
    box-sizing: border-box
    width: 100%
    height: 20em
    resize: vertical
    border-width: 1px
    border-style: solid
    // border-radius: 4pt
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
    // border-radius: 4pt
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
