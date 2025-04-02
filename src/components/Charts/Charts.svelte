<script lang="ts">
  import TabMenu from "../TabMenu.svelte";
  import CountryHeader from "./CountryHeader.svelte";
  import LatestTab from "./LatestTab.svelte";
  import MacroDataTab from "./MacroDataTab.svelte";
  
  let active = 'Latest';
  let tabs = [
    'Latest',
    'Macro data',
    'Economic calendar',
    'Maturity profile',
    'Debt composition',
    'IMF arrangements',
    'News',
  ];
</script>

<div class="w-full">
  <div class="w-full border-b border-gray-200">
    <CountryHeader />
  </div>

  <div class="w-full">
    <TabMenu {tabs} activeTab={active} onChange={(tab) => (active = tab)} />
  </div>

  <!-- Tab panel -->
  <div
    
    role="tabpanel"
    aria-labelledby={`tab-${tabs.indexOf(active)}`}
    id={`panel-${tabs.indexOf(active)}`}
  >
    {#if active === 'Latest'}
      <LatestTab />
    {:else if active === 'Macro data'}
      <MacroDataTab />
    {/if}
  </div>
</div>
