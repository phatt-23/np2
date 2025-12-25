<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import { SSP } from "$lib/instance/SSP";


    type Props = {
        ssp: SSP | null;
        onChange: (ssp: SSP) => void;
        onWrongFormat: (msg: string) => void;
    };

    let { ssp, onChange, onWrongFormat } : Props = $props();

    let targetText = $state(ssp?.target.toString() ?? '');
    let numbersText = $state(ssp?.numbers.map(n => n.value.toString()).join(' ') ?? '');
   
    function onTextChange() {
        const result = SSP.fromString(numbersText, targetText);

        if (typeof result == 'string') {
            onWrongFormat(result); 
            return;
        }
        
        onChange(result);
    }

</script>

<main>
    <h2 class="dev">SSP Editor</h2>

    <div>
        <label for="targetTextInput"></label>
        <input type="text" name="targetTextInput" bind:value={targetText} onchange={onTextChange}>
    </div>
    <div>
        <label for="numbersTextInput"></label>
        <input type="text" name="numbersTextInput" bind:value={numbersText} onchange={onTextChange}>
    </div>

</main>