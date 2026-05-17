<!-- 
 Created by phatt-23 on 25/12/2025 

    Renders TeX. 

    Options: 
        interpolated - Renders interpolated TeX, e.g. "hello, world $x = y(x)$ where the function $f$ is $x^2$".
        displayMode - Renders TeX in display mode.
-->

<script lang="ts">
    import { tex } from "$lib/core/tex";
    import "../../../static/katex.min.css";

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

<div style={style}>
    {@html htmlString}
</div>

