<!--
    Created by phatt-23 on 11/10/2025
-->

<script lang="ts">
    import type { ErrorMessage } from "$lib/core/assert";
    import { DemoProvider } from "$lib/demo/DemoProvider";
    import { CNF3 } from "$lib/instance/CNF3";

    const demos = DemoProvider.getTextInputs(CNF3);

    type Props = {
        cnf: CNF3 | null;
        onChange: (cnf: CNF3) => void;
        onWrongFormat?: (message: ErrorMessage) => void;
        displayErrorMessages?: boolean;
    }

    let { 
        cnf, 
        onChange, 
        onWrongFormat,
        displayErrorMessages = false,
    }: Props = $props();

    
    let text = $state(cnf?.asString() ?? '');
    let selectedDemo = $state('');
    let errorMessage = $state('');

    function onTextChange() {
        const result = CNF3.fromString(text);

        if (typeof result == "string") {
            console.debug('wrong');
            onWrongFormat?.(result);
        }
        else {
            onChange?.(result);
        }
    };

    function onTextInput() {
        if (!displayErrorMessages) {
            return;
        }

        const result = CNF3.fromString(text);
        if (typeof result == "string") {
            errorMessage = result;
        } else {
            errorMessage = '';
        }
    }

    function handleSelect() {
        text = demos[selectedDemo];
        onTextChange();
    }

    $effect(() => {
        if (cnf) {
            text = cnf.asString()
        }
    })
</script>

<div class="editor">
    <h2 class="dev">CNF Editor</h2>

    <p class="comment">Removes duplicate clauses automatically.</p>

    <div class="text-wrap">

        <textarea bind:value={text} oninput={onTextInput} onchange={onTextChange} spellcheck="false">
        </textarea>

        <div class='input-actions'>
            <select onchange={handleSelect} bind:value={selectedDemo}>
                <option disabled selected value="" hidden>-- choose demo --</option>

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

</div>

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
