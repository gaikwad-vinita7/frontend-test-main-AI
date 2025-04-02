<script lang="ts">
  export let disabled: boolean = false;
</script>

<button
  on:click
  {disabled}
  class="border border-[#DBDBDB] text-xs13 mx-3 rounded-sm px-3 py-1 font-medium transition hover:bg-gray-50 disabled:opacity-50"
>
  <slot />
</button>
