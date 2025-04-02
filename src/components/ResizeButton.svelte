<script lang="ts">
  let isMaximised = false;

  function toggleFollow() {
    isMaximised = !isMaximised;
  }
</script>

<button
  on:click={toggleFollow}
  class="flex items-center justify-center w-10 h-10 rounded border border-[#DBDBDB] hover:bg-gray-100 transition"
  aria-label="Toggle Follow Icon"
>
  {#if isMaximised}
     <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
    >
      <path
        d="M15.5 19L18.4998 19C18.776 19 18.9998 18.7762 18.9998 18.5L19 15.5C19 15.2239 18.7761 15 18.5 15L17.8001 15L15.5 15C15.2239 15 15 15.2239 15 15.5L15 18.5C15 18.7761 15.2239 19 15.5 19Z"
        stroke="#404040"
        stroke-width="1.5"
        stroke-linecap="square"
      />
      <path
        d="M12.7934 9H9.50049C9.22435 9 9.00049 9.22386 9.00049 9.5V12.7929C9.00049 13.2383 9.53906 13.4614 9.85404 13.1464L13.1469 9.85355C13.4619 9.53857 13.2388 9 12.7934 9Z"
        fill="#404040"
      />
      <path
        d="M13.5308 12.4697L14.0611 13L13.0005 14.0607L12.4702 13.5303L13.5308 12.4697ZM12.4702 13.5303L10.4702 11.5303L11.5308 10.4697L13.5308 12.4697L12.4702 13.5303Z"
        fill="#404040"
      />
    </svg>
    
  {:else}
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
    >
      <path
        d="M12.5005 9L9.50066 9C9.22453 9 9.00067 9.22384 9.00066 9.49998L9.00051 12.5C9.0005 12.7761 9.22436 13 9.50051 13L10.2004 13L12.5005 13C12.7766 13 13.0005 12.7761 13.0005 12.5L13.0005 9.5C13.0005 9.22386 12.7766 9 12.5005 9Z"
        stroke="#404040"
        stroke-width="1.5"
        stroke-linecap="square"
      />
      <path
        d="M15.2071 19H18.5C18.7761 19 19 18.7761 19 18.5V15.2071C19 14.7617 18.4614 14.5386 18.1464 14.8536L14.8536 18.1464C14.5386 18.4614 14.7617 19 15.2071 19Z"
        fill="#404040"
      />
      <path
        d="M14.4697 15.5303L13.9393 15L15 13.9393L15.5303 14.4697L14.4697 15.5303ZM15.5303 14.4697L17.5303 16.4697L16.4697 17.5303L14.4697 15.5303L15.5303 14.4697Z"
        fill="#404040"
      />
    </svg>
   
  {/if}
</button>
