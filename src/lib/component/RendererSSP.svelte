<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import type { CNF3 } from "$lib/instance/CNF3";
    import type { SSP } from "$lib/instance/SSP";

    type SSPStyles = 'none'
                   | '3sat';
                   

    type Props = {
        ssp: SSP;
        style?: SSPStyles;
        cnfInstance?: CNF3;
    };

    let { 
        ssp, 
        style = 'none',
        cnfInstance,
    }: Props = $props();

    let cnfViewSwitch = $state(false)
</script>

<main>
    <h2 class="dev">SSP Renderer</h2>

    {#if style == 'none'}
        <p>Target: {ssp.target.join('')}</p>
        <p>Numbers:</p>
        <ul>
            {#each ssp.numbers as num, i} 
                <li>{num.value.join('')}</li>
            {/each}
        </ul>
    {:else if style == '3sat'}
        {#if !cnfInstance}
            <p style="color: red">When using the '3sat' style, you must pass in the CNF3 instance.</p>
        {:else}

            <div>
                <label for='viewAsNumbersCheckbox'>View as numbers</label>
                <input type='checkbox' bind:checked={cnfViewSwitch} name='viewAsNumbersCheckbox'/>
            </div>

            {#if cnfViewSwitch}
                <p>Numbers:</p>
                <ul>
                    {#each ssp.numbers as num, i}
                        <li class:ssp-used={num.used} class={num.classes ?? ''}>
                            {num.value.join('')}
                        </li>
                    {/each}
                </ul>
                <p>Target: {ssp.target.join('')}</p>
            {:else}

                <p>
                    Each row represents one number.
                </p>

                <table class="ssp-table">
                    <thead>
                        <tr>
                            <th></th>

                            {#each cnfInstance.variables as variable, i}
                                <th class={'var-col'}>{variable}</th>
                            {/each}
    
                            {#each cnfInstance.clauses as clause, i}
                                <th class='clause-col'>{@html clause.asHtmlString()}</th>
                            {/each}
                        </tr>
                    </thead>

                    <tbody>
                        {#each cnfInstance.variables as variable, i}
                            <tr 
                                class="var-row"
                                class:ssp-used={ssp.numbers[2 * i].used}
                            >
                                <td>{variable} &coloneq; T</td>

                                {#each ssp.numbers[2 * i].value as digit, j}
                                    <td>{digit}</td>
                                {/each}
                            </tr>

                            <tr 
                                class="var-row var-row-false" 
                                class:ssp-used={ssp.numbers[2 * i + 1].used}
                            >
                                <td>{variable} &coloneq; F</td>

                                {#each ssp.numbers[2 * i + 1].value as digit, j}
                                    <td>{digit}</td>
                                {/each}
                            </tr>

                            <!-- Horizontal separator after each variable pair -->
                            <tr class="section-sep"><td colspan="999"></td></tr>
                        {/each}

                        {#each cnfInstance.clauses as clause, i}
                            <tr 
                                class="clause-row"
                                class:ssp-used={ssp.numbers[(2 * i) + (2 * cnfInstance.variables.length)].used}
                            >
                                <td>{@html clause.asHtmlString()}</td>

                                {#each ssp.numbers[(2 * i) + (2 * cnfInstance.variables.length)].value as digit, j}
                                    <td>{digit}</td>
                                {/each}
                            </tr>

                            <tr 
                                class={"clause-row clause-row-fill"}
                                class:ssp-used={ssp.numbers[(2 * i + 1) + (2 * cnfInstance.variables.length)].used}
                            >
                                <td></td>

                                {#each ssp.numbers[(2 * i + 1) + (2 * cnfInstance.variables.length)].value as digit, j}
                                    <td>{digit}</td>
                                {/each}
                            </tr>

                            <!-- Horizontal separator after each clause pair -->
                            <tr class="section-sep"><td colspan="999"></td></tr>
                        {/each}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td>Target:</td>
                            {#each ssp.target as digit, j}
                                <td>{digit}</td>
                            {/each}
                        </tr>
                    </tfoot>
                </table>
            {/if}

        {/if}
    {/if}

</main>

<style>
.ssp-table {
    border-collapse: collapse;
    margin-top: 1rem;
}

.ssp-table th, 
.ssp-table td {
    padding: 4px 8px;
    text-align: center;
    border: 1px solid #ccc;
}

.section-sep td {
    border: none;
    height: 0px;
    background-color: #fff;
}

/* visually distinguish variable and clause zones */
.var-col {
    background-color: #f9f9f9;
}

.clause-col {
    background-color: #f0f8ff;
}

.clause-row td,
.var-row td {
    border-color: #ddd;
}

.ssp-used {
    background-color: rgb(256, 240, 240);
    font-weight: bold;
    color: #1b5e20;
}

/* .ssp-used {
    background-color: #c8e6c9; 
    font-weight: bold;
    border-color: #66bb6a;
} */

</style>