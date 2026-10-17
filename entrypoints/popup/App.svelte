<script lang="ts">
  import { app } from "@/state/app-state.svelte";
  import AppBar from "@/components/AppBar.svelte";
  import Error from "@/screens/Error.svelte";
  import Loading from "@/screens/Loading.svelte";
  import Setup from "@/screens/Setup.svelte";
  import Dashboard from "@/screens/Dashboard.svelte";

  let error = $derived(app.error);
  let currentView = $derived(app.currentView);
</script>

<div
  class="min-h-dvh min-w-full flex justify-center items-center bg-base-300/50"
>
  <div
    class="w-95 h-100 flex flex-col overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl border border-base-300"
  >
    {#if error}
      <Error />
    {:else if currentView === "loading"}
      <Loading />
    {:else}
      <AppBar />
      <main class="p-4 flex-1 overflow-y-auto flex flex-col min-h-0">
        {#if currentView.startsWith("setup-")}
          <Setup />
        {:else if currentView.startsWith("dashboard")}
          <Dashboard />
        {/if}
      </main>
    {/if}
  </div>
</div>
