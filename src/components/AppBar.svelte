<script lang="ts">
  import { ChevronRight } from "lucide-svelte";
  import SparklesText from "./SparklesText.svelte";
  import AuroraText from "./AuroraText.svelte";
  import { app } from "@/state/app-state.svelte";

  let showBack = $derived(
    () =>
      app.currentView === "setup-method" ||
      app.currentView === "setup-qrcode" ||
      app.currentView === "setup-secretkey" ||
      app.currentView === "show-qrcode" ||
      app.currentView === "show-secretkey" ||
      app.currentView === "settings" ||
      app.currentView === "themes",
  );

  const handleBack = () => {
    switch (app.currentView) {
      case "setup-method":
        app.currentView = "setup-credentials";
        break;

      case "setup-qrcode":
      case "setup-secretkey":
        app.currentView = "setup-method";
        break;

      case "show-qrcode":
      case "show-secretkey":
        app.currentView = "settings";
        break;

      case "settings":
      case "themes":
        app.currentView = "dashboard";
        break;
    }
  };
</script>

<header
  class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-300"
>
  <div class="relative flex items-center justify-between px-4 h-14">
    <div class="flex items-center gap-2">
      {#if showBack()}
        <button
          class="btn btn-ghost btn-md btn-square rounded-2xl transition-transform duration-200 hover:scale-105 active:scale-65"
          onclick={handleBack}
          aria-label="Go back"
        >
          <ChevronRight size={18} class="rotate-180" />
        </button>
      {/if}
    </div>

    <div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
      <SparklesText
        sparklesCount={3}
        colors={{
          first: "var(--color-primary)",
          second: "var(--color-secondary)",
        }}
        class="font-bold text-xl"
      >
        Auth<AuroraText speed={4}>matic</AuroraText>
      </SparklesText>
    </div>
    <div class="flex items-center gap-1.5 text-base-content opacity-30">
      <div class="w-3.5 h-3.5 rounded-full bg-success"></div>
      <div class="w-3.5 h-3.5 rounded-full bg-warning"></div>
      <div class="w-3.5 h-3.5 rounded-full bg-error"></div>
    </div>
  </div>
</header>
