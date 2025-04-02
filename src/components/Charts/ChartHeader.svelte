<script lang="ts">
  import ResizeButton from "../ResizeButton.svelte";
  export let title = 'Yield curve (USD)';
</script>

<div class="flex w-full items-center justify-between border-b border-[#DBDBDB] py-1 px-6">
  <h2 class="text-primary text-xs13 font-medium">{title}</h2>
  <ResizeButton />
</div>
