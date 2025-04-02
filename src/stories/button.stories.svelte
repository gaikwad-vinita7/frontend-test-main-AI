<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from '@storybook/addon-actions';
  import Button from '../components/Button.svelte';

  const { Story } = defineMeta({
    title: 'Components/Button',
    component: Button,
  });
</script>

<Story name="Default">
  <Button disabled={false}>Follow</Button>
</Story>

<Story name="Disabled">
  <Button disabled={true}>Follow</Button>
</Story>

<Story name="WithClickHandler">
  <Button disabled={false} on:click={action('Button clicked')}>
    Follow
  </Button>
</Story>
