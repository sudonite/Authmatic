<script lang="ts">
  import { Check, Sparkles } from "@lucide/svelte";
  import { themes } from "@/utils/themes";

  interface Props {
    currentTheme: string;
    handleThemeChange: (theme: string) => void;
  }

  let { currentTheme, handleThemeChange }: Props = $props();

  const applyTheme = (theme: string) => void handleThemeChange(theme);
</script>

<div class="flex h-full min-h-0 flex-col rounded-2xl bg-base-200">
  <div class="shrink-0 p-4 pb-3">
    <div class="flex items-center gap-3">
      <span
        class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"
      >
        <Sparkles size={22} />
      </span>
      <div class="min-w-0 flex-1">
        <h2 class="text-base font-bold leading-tight">Appearance</h2>
        <p class="truncate text-xs text-base-content/60">
          Pick a theme for the app
        </p>
      </div>
      {#if currentTheme}
        <span
          data-theme={currentTheme}
          class="rounded-lg border border-base-300 px-2.5 py-1 text-xs font-semibold text-base-content"
        >
          {currentTheme}
        </span>
      {/if}
    </div>
  </div>
  <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
    <div class="flex flex-col gap-4">
      {#each themes as theme (theme)}
        <button
          data-theme={theme}
          onclick={() => applyTheme(theme)}
          aria-pressed={currentTheme === theme}
          class="group overflow-hidden rounded-2xl border text-left transition-transform duration-150 active:scale-[0.98] {currentTheme ===
          theme
            ? 'border-primary ring-2 ring-primary'
            : 'border-base-300 hover:border-base-content/30'}"
        >
          <div class="bg-base-100 p-2.5 text-base-content">
            <div class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-error"></span>
              <span class="h-2 w-2 rounded-full bg-warning"></span>
              <span class="h-2 w-2 rounded-full bg-success"></span>
              <span class="ml-1 h-2 flex-1 rounded-full bg-base-300"></span>
            </div>
            <div class="mt-2.5 flex items-center gap-2">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-content"
              >
                {theme.charAt(0).toUpperCase()}
              </span>
              <span class="flex-1">
                <span class="block h-1.5 w-14 rounded-full bg-base-content/70"
                ></span>
                <span
                  class="mt-1 block h-1.5 w-9 rounded-full bg-base-content/30"
                ></span>
              </span>
            </div>
            <div class="mt-2.5 flex gap-1.5">
              <span class="h-4 flex-1 rounded bg-secondary"></span>
              <span class="h-4 flex-1 rounded bg-accent"></span>
              <span class="h-4 flex-1 rounded bg-neutral"></span>
            </div>
          </div>
          <div
            class="flex items-center justify-between bg-base-200 px-2.5 py-2"
          >
            <span
              class="truncate text-md font-semibold capitalize text-base-content"
            >
              {theme}
            </span>
            {#if currentTheme === theme}
              <span
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content"
              >
                <Check size={11} strokeWidth={3} />
              </span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
