<script lang="ts">
  import { ChevronRight, Eye, EyeOff, FingerprintPattern } from "lucide-svelte";

  interface Props {
    handleSubmit: (neptunCode: string, password: string) => void;
  }

  let { handleSubmit }: Props = $props();

  let neptunCode = $state("");
  let password = $state("");
  let showPassword = $state(false);
</script>

<div class="text-center mb-4">
  <div class="flex items-center justify-center">
    <div
      class="w-14 h-14 rounded-2xl bg-base-300 flex items-center justify-center mx-auto mb-3"
    >
      <FingerprintPattern size={28} class={"text-base-content/60"} />
    </div>
  </div>
  <p class="text-xs text-base-content/60 mt-1">
    Enter your credentials to continue
  </p>
</div>
<fieldset class="fieldset">
  <div class="space-y-3">
    <label class="floating-label">
      <span>Neptun Code</span>
      <input
        type="text"
        bind:value={neptunCode}
        placeholder="Enter your Neptun code"
        class="input input-sm w-full"
        required
        minlength="3"
      />
    </label>
    <p class="validator-hint hidden">Must be at least 3 characters</p>

    <label class="floating-label">
      <span>Password</span>
      <div class="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          class="input input-sm w-full pr-10"
          bind:value={password}
          required
          minlength="6"
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
          onclick={() => (showPassword = !showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {#if showPassword}
            <EyeOff size={16} />
          {:else}
            <Eye size={16} />
          {/if}
        </button>
      </div>
    </label>
    <p class="validator-hint hidden">Must be at least 6 characters</p>
  </div>

  <button
    disabled={neptunCode.length < 6 || password.length < 1}
    class="btn btn-primary btn-sm w-full mt-4"
    onclick={() => handleSubmit(neptunCode, password)}
  >
    Continue
    <ChevronRight size={16} />
  </button>
</fieldset>
