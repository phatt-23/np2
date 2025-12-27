<!-- Created by phatt-23 on 25/12/2025 -->

<script lang="ts">
    type Props = {
        header?: any,
        body?: any,
        footer?: any,
        children?: any,
        hideFooter?: boolean;
    };

    let { header, body, footer, children, hideFooter = false }: Props = $props();
</script>

<main>
    {#if header}
        <div class="header">
            {@render header?.()}
        </div>
    {/if}

    {#if body || children}
        <div class="body">
            {@render body?.()}
            {@render children?.()}
        </div>
    {/if}

    {#if footer && !hideFooter}
        <div class="footer">
            {@render footer?.()}
        </div>
    {/if}
</main>

<style lang="sass">
    main 
        align-content: center
        width: 100%
        border-width: 1px
        border-style: solid
        border-radius: 4pt
        border-color: global.$border-color

    .header
        padding: 8px
        padding-inline: 16px
        border-bottom: 1px solid global.$light-border-color

    .body
        padding-inline: 16px
        padding-block: 8px

    .footer
        padding: 8px
        padding-inline: 16px
        border-top: 1px solid global.$light-border-color
</style>
