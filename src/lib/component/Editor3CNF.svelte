<!--
    Created by phatt-23 on 11/10/2025
-->

<script lang="ts">
    import type { ErrorMessage } from "$lib/core/assert";
    import { DemoProvider } from "$lib/demo/DemoProvider";
    import { CNF3 } from "$lib/instance/CNF3";

    type Props = {
        cnf: CNF3 | null;
        onChange: (cnf: CNF3) => void;
        onWrongFormat?: (message: ErrorMessage) => void;
    }

    let { cnf, onChange, onWrongFormat }: Props = $props();

    const demos = DemoProvider.getTextInputs(CNF3);

    let text = $state(cnf?.asString() ?? '');
    let selectedDemo = $state('');

    const callOnChange = (instance : CNF3) => {
        if (onChange) {
            onChange(instance);
        }
    }

    const callOnWrongFormat = (text : string) => {
        if (onWrongFormat) {
            onWrongFormat(text);
        }
    };

    const onTextChange = () => {
        const result = CNF3.fromString(text);

        if (typeof result == "string") {
            callOnWrongFormat(result);
            return;
        }

        callOnChange(result);
    };

    function handleSelect() {
        text = demos[selectedDemo];
        onTextChange();
    }

    $effect(() => {
        if (cnf) 
            text = cnf.asString()
    })
</script>

<div class="editor">
    <h2 class="dev">CNF Editor</h2>
    <p><i>Removes duplicate clauses automatically.</i></p>

    <div>
        <textarea bind:value={text} onchange={onTextChange}></textarea>
    </div>

    <select onchange={handleSelect} bind:value={selectedDemo}>
        <option value="">--Choose a demo--</option>

        {#each Object.keys(demos) as demo}
            <option value={demo}>{demo}</option>
        {/each}
    </select>
</div>

<style>
    .editor {
        display: block;
        width: 100%;
    }

    textarea { 
        width: 90%;
        height: 20em; 
    }
</style>