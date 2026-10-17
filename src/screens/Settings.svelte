<script lang="ts">
  import type { View } from "@/state/app-state.svelte";
  import { KeyRound, LogOut, ScanText } from "@lucide/svelte";

  interface Props {
    handleViewChange: (view: View) => void;
    handleReset: () => void;
  }

  let { handleViewChange, handleReset }: Props = $props();

  let confirmingSignOut = $state(false);
</script>

<div class="screen-in space-y-5">
  <div class="w-full bg-base-200 rounded-xl">
    <div
      class="p-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider"
    >
      Security & Backup
    </div>
    <div class="p-2 space-y-2">
      <button
        class="btn btn-ghost btn-sm justify-start gap-3 w-full"
        onclick={() => {
          handleViewChange("show-qrcode");
          confirmingSignOut = false;
        }}
      >
        <ScanText size={16} />
        <span class="text-sm">Show QR Code</span>
      </button>
      <button
        class="btn btn-ghost btn-sm justify-start gap-3 w-full"
        onclick={() => {
          handleViewChange("show-secretkey");
          confirmingSignOut = false;
        }}
      >
        <KeyRound size={16} />
        <span class="text-sm">Show OTP Secret</span>
      </button>
    </div>
  </div>

  <div class="w-full bg-base-200 rounded-xl">
    <div
      class="p-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider"
    >
      Account Setings
    </div>
    <div class="p-2">
      <button
        class="btn btn-ghost btn-sm justify-start gap-3 w-full text-error transition-colors duration-200 {confirmingSignOut
          ? 'bg-error/10'
          : ''}"
        aria-expanded={confirmingSignOut}
        onclick={() => (confirmingSignOut = !confirmingSignOut)}
      >
        <LogOut
          size={16}
          class="transition-transform duration-300 {confirmingSignOut
            ? 'rotate-90'
            : ''}"
        />
        <span class="text-sm">Sign Out</span>
      </button>

      <div class="sign-out-confirm" class:open={confirmingSignOut}>
        <div class="overflow-hidden min-h-0">
          <div class="confirm-actions flex gap-2 pt-2 mt-2">
            <button
              class="btn btn-error btn-sm flex-1 gap-2"
              onclick={() => {
                handleReset();
                confirmingSignOut = false;
              }}
            >
              <LogOut size={14} />
              <span class="text-sm">Yes, sign out</span>
            </button>
            <button
              class="btn btn-ghost btn-sm flex-1 text-sm"
              onclick={() => (confirmingSignOut = false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .sign-out-confirm {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sign-out-confirm.open {
    grid-template-rows: 1fr;
  }

  .confirm-actions {
    opacity: 0;
    transform: translateY(-6px);
    transition:
      opacity 180ms ease,
      transform 180ms ease;
  }

  .sign-out-confirm.open .confirm-actions {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 80ms;
  }
</style>
