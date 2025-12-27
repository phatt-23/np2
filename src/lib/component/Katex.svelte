<!-- 
 Created by phatt-23 on 25/12/2025 

    Renders TeX. 

    Options: 
        interpolated - Renders interpolated TeX, e.g. "hello, world $x = y(x)$ where the function $f$ is $x^2$".
        displayMode - Renders TeX in display mode.
-->

<script lang="ts">
    import { tex } from "$lib/core/tex";

    export type Props = {   
        text: string; 
        displayMode?: boolean; 
        inline?: boolean;
        html?: boolean;
        style?: string;
    }

    let { 
        text,
        displayMode = false,
        inline = false,
        html = false,
        style = '',
    }: Props = $props();

    const htmlString = tex(text, { 
        displayMode, 
        inline, 
        html 
    });

</script>

<svelte:head>
    <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css" 
        integrity="sha384-Pu5+C18nP5dwykLJOhd2U4Xen7rjScHN/qusop27hdd2drI+lL5KvX7YntvT8yew" 
        crossorigin="anonymous">
</svelte:head>

<div style={style}>
    {@html htmlString}
</div>

