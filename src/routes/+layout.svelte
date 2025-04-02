<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<div class="flex min-h-screen w-full flex-col">
  <header class="flex h-12 items-center bg-blue-50">
    <div class="container mx-auto flex">
      <img src="/favicon.png" alt="Logo" class="h-6 w-6" />
      <div class="ml-1">
        <a
          class="h-full px-2 text-gray-600 underline-offset-[3px] hover:text-gray-800 hover:underline"
          href="/">Home</a
        >
      </div>
    </div>
  </header>

    
   <div class="flex w-full flex-col md:flex-row">
  <!-- Sidebar -->
  <aside class="text-primary w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 p-4">
    <div class="mb-2 text-sm font-semibold text-gray-800">Tellimer</div>
    <button class="text-sm text-gray-600 hover:text-black">☰ Menu</button>
  </aside>

  <main class="w-full flex-grow text-primary">
    {@render children()}
  </main>
</div>


  <footer
    class="sticky bottom-0 flex min-h-[3rem] w-full items-center justify-center bg-blue-100 font-mono"
  >
    &copy; {new Date().getFullYear()}
  </footer>
</div>
