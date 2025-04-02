<script lang="ts">
  import Button from "../Button.svelte";
  export let country = 'Nigeria';
</script>

<div class="flex w-full items-center py-3 px-6">
  <h1 class="text-xs13 font-semibold text-primary">{country}</h1>
  <Button>Follow</Button>
 
</div>
