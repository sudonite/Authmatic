<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    class: className = "",
    colors = [
      "var(--color-primary)",
      "var(--color-secondary)",
      "var(--color-accent)",
      "var(--color-primary)",
    ],
    speed = 5,
  }: {
    children: Snippet;
    class?: string;
    colors?: string[];
    speed?: number;
  } = $props();

  let gradient = $derived(colors.join(", "));
</script>

<span
  class={`aurora-text ${className}`}
  style={`--aurora-colors: ${gradient}; --aurora-speed: ${speed}s;`}
>
  {@render children()}
</span>

<style>
  .aurora-text {
    display: inline-block;
    background: linear-gradient(90deg, var(--aurora-colors));
    background-size: 300% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: aurora var(--aurora-speed) ease-in-out infinite;
  }

  @keyframes aurora {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }
</style>
