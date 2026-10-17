<script lang="ts">
  import {
    copySecretKeyToClipboard,
    getSecretKey,
  } from "@/services/totp-service";
  import { Check, Copy, Eye, EyeOff, KeyRound } from "@lucide/svelte";

  interface Props {
    neptunCode: string;
  }

  let { neptunCode }: Props = $props();

  const colors = [
    "bg-primary/15 text-primary border-primary/30",
    "bg-secondary/15 text-secondary border-secondary/30",
    "bg-accent/15 text-accent border-accent/30",
    "bg-success/15 text-success border-success/30",
    "bg-info/15 text-info border-info/30",
    "bg-warning/15 text-warning border-warning/30",
  ];

  let revealed = $state(false);
  let copied = $state(false);
  let copyTimeout: number | undefined;

  const handleCopy = () => {
    copySecretKeyToClipboard();
    copied = true;

    clearTimeout(copyTimeout);
    copyTimeout = window.setTimeout(() => (copied = false), 2000);
  };
</script>

<div class="screen-in flex flex-1 flex-col items-center justify-center">
  <div
    class="key-pop w-full max-w-72 overflow-hidden rounded-3xl bg-base-200 shadow-lg"
  >
    <div
      class="relative bg-linear-to-br from-secondary via-accent to-primary p-3.5 text-secondary-content"
    >
      <div
        class="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-12 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
      ></div>

      <div class="relative flex items-center gap-2.5">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-sm"
        >
          <KeyRound size={18} />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-sm font-bold leading-tight">Secret Key</h2>
          <p class="truncate text-xs text-secondary-content/75">
            Neptun · {neptunCode}
          </p>
        </div>
        <button
          class="btn btn-circle btn-sm bg-white/20 border-none text-secondary-content hover:bg-white/30"
          aria-label={revealed ? "Hide secret key" : "Reveal secret key"}
          aria-pressed={revealed}
          onclick={() => (revealed = !revealed)}
        >
          {#if revealed}
            <EyeOff size={16} />
          {:else}
            <Eye size={16} />
          {/if}
        </button>
      </div>
    </div>
    <div class="p-4">
      <div class="flex flex-wrap justify-center gap-1.5">
        {#each getSecretKey().match(/.{1,4}/g) as group, i (i)}
          <span
            class="rounded-lg border px-2 py-1.5 font-mono text-[13px] font-bold tracking-widest transition-all duration-300 {colors[
              i % colors.length
            ]} {revealed ? 'scale-100 opacity-100' : 'scale-95 opacity-60'}"
            style="transition-delay: {i * 40}ms"
          >
            {#if revealed}
              {group}
            {:else}
              ••••
            {/if}
          </span>
        {/each}
      </div>

      <button
        class="btn btn-block btn-sm mt-4 gap-2 border-none shadow-none transition-colors duration-300 {copied
          ? 'bg-success text-success-content'
          : 'bg-primary text-primary-content hover:bg-primary/85'}"
        onclick={handleCopy}
      >
        {#if copied}
          <Check size={14} /> Copied to clipboard!
        {:else}
          <Copy size={14} /> Copy secret key
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .key-pop {
    animation: key-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes key-pop {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
