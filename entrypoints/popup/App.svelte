<script lang="ts">
  import { app, resetApp, setTheme } from "@/state/app-state.svelte";
  import type { View } from "@/state/app-state.svelte";
  import { getUser, resetUser } from "@/state/user-state.svelte";
  import AppBar from "@/components/AppBar.svelte";
  import Error from "@/screens/Error.svelte";
  import Loading from "@/screens/Loading.svelte";
  import Setup from "@/screens/Setup.svelte";
  import Dashboard from "@/screens/Dashboard.svelte";
  import Themes from "@/screens/Themes.svelte";
  import ShowQRCode from "@/screens/ShowQRCode.svelte";
  import ShowSecretKey from "@/screens/ShowSecretKey.svelte";
  import Settings from "@/screens/Settings.svelte";

  let error = $derived(app.error);
  let autoLogin = $derived(app.autoLogin);
  let currentView = $derived(app.currentView);
  let currentTheme = $derived(app.theme);

  let neptunCode = $derived(getUser().neptunCode);

  $inspect(app.currentView, (view: View) => {
    console.log("Current view changed to:", view);
  });

  const handleViewChange = (view: View) => (app.currentView = view);
  const handleThemeChange = (theme: string) => setTheme(theme);
  const handleReset = () => {
    resetUser();
    resetApp();
  };
</script>

<div
  class="min-h-dvh min-w-full flex justify-center items-center bg-base-300/50"
>
  <div
    class="w-95 h-100 flex flex-col overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl border border-base-300"
  >
    {#if error}
      <Error bind:error {handleViewChange} {handleReset} />
    {:else if currentView === "loading"}
      <Loading {handleViewChange} />
    {:else}
      <AppBar {currentView} {handleViewChange} />
      <main class="p-4 flex-1 overflow-y-auto flex flex-col min-h-0">
        {#if currentView.startsWith("setup-")}
          <Setup {currentView} {handleViewChange} />
        {:else if currentView === "dashboard"}
          <Dashboard bind:autoLogin {neptunCode} {handleViewChange} />
        {:else if currentView === "themes"}
          <Themes {currentTheme} {handleThemeChange} />
        {:else if currentView === "settings"}
          <Settings {handleViewChange} {handleReset} />
        {:else if currentView === "show-qrcode"}
          <ShowQRCode {neptunCode} />
        {:else if currentView === "show-secretkey"}
          <ShowSecretKey {neptunCode} />
        {/if}
      </main>
    {/if}
  </div>
</div>
