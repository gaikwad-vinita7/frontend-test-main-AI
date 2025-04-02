<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ResizeButton from '../components/ResizeButton.svelte';

  const { Story } = defineMeta({
    title: 'Components/ResizeButton',
    component: ResizeButton,
  });
</script>

<Story name="Toggle Icon Button">
  <ResizeButton />
</Story>
