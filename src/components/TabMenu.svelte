<script lang="ts">
  export let tabs: string[] = [];
  export let activeTab: string;
  export let onChange: (tab: string) => void;
</script>

<div class="border-b border-[#DBDBDB] overflow-x-auto" role="tablist" aria-label="Tab navigation">
  <ul class="flex min-w-max space-x-6 text-sm px-5">

    {#each tabs as tab, index}
      <li>
        <button
          id={`tab-${index}`}
          role="tab"
          aria-selected={tab === activeTab}
          aria-controls={`panel-${index}`}
          tabindex={tab === activeTab ? 0 : -1}
          disabled={tab !== 'Latest' && tab !== 'Macro data'}
          class={`border-b-1 py-3 px-2 font-medium transition-all ${
            tab === activeTab ? 'border-[#171717] text-primary' : 'border-transparent hover:text-gray-800'
          } ${tab !== 'Latest' && tab !== 'Macro data' ? 'cursor-not-allowed' : ''}
    disabled:cursor-not-allowed disabled:border-transparent disabled:text-gray-300`}
          on:click={() => onChange(tab)}
        >
          {tab}
        </button>
      </li>
    {/each}
  </ul>
</div>
