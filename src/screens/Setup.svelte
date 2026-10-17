<script lang="ts">
  import type { View } from "@/state/app-state.svelte";
  import type { User } from "@/state/user-state.svelte";
  import SetupCredentials from "@/components/setup/SetupCredentials.svelte";
  import SetupMethodChooser from "@/components/setup/SetupMethodChooser.svelte";
  import SetupQRCode from "@/components/setup/SetupQRCode.svelte";
  import SetupSecretKey from "@/components/setup/SetupSecretKey.svelte";
  import { persistUser } from "@/state/user-state.svelte";

  interface Props {
    currentView: View;
    handleViewChange: (view: View) => void;
  }

  let { currentView, handleViewChange }: Props = $props();

  let setupUser: User = $state({
    neptunCode: "",
    password: "",
    secretKey: "",
  });

  const handleSubmitCredentials = (neptunCode: string, password: string) => {
    setupUser.neptunCode = neptunCode;
    setupUser.password = password;
    handleViewChange("setup-method");
  };

  const handleSubmitMethod = (method: View) => handleViewChange(method);

  const handleSubmitSecretKey = (secretKey: string) => {
    setupUser.secretKey = secretKey;
    void persistUser({ ...setupUser });
    handleViewChange("dashboard");
  };

  $inspect(setupUser, "setupUser");
</script>

<div
  class="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300 flex min-h-0 flex-1 flex-col"
>
  <div class="card flex min-h-0 flex-1 flex-col bg-base-200 shadow-lg">
    <div class="card-body flex min-h-0 flex-1 flex-col p-5">
      {#if currentView === "setup-credentials"}
        <SetupCredentials handleSubmit={handleSubmitCredentials} />
      {:else if currentView === "setup-method"}
        <SetupMethodChooser handleSubmit={handleSubmitMethod} />
      {:else if currentView === "setup-qrcode"}
        <SetupQRCode handleSubmit={handleSubmitSecretKey} />
      {:else if currentView === "setup-secretkey"}
        <SetupSecretKey handleSubmit={handleSubmitSecretKey} />
      {/if}
    </div>
  </div>
</div>
