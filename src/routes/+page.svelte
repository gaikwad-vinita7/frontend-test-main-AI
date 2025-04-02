<script lang="ts">
  import Charts from '../components/Charts/Charts.svelte';
  import { bondData } from '../lib/stores/bond.js';
  import { onMount } from 'svelte';
  onMount(async () => {
    const response = await fetch('/api/bonds');
    bondData.set(await response.json());
  });
</script>

{#if bondData}
  <Charts />
{:else}
  <p>Loading chart...</p>
{/if}
