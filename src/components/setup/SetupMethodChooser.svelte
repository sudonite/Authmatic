<script lang="ts">
  import type { SetupMethodView } from "@/state/app-state.svelte";
  import { ChevronRight, QrCode, KeyRound } from "lucide-svelte";

  interface Props {
    handleSubmit(view: SetupMethodView): void;
  }

  let { handleSubmit }: Props = $props();
</script>

<p class="text-sm font-semibold">Choose a setup method</p>
<p class="text-xs text-base-content/60 mt-1 mb-4">
  Pick how you'd like to add your account to the authenticator
</p>

<div class="flex flex-col gap-3">
  <button
    class="group relative w-full overflow-hidden rounded-xl border border-base-300 bg-base-200 p-4 text-left cursor-pointer transition-all duration-200 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-2 focus-visible:outline-primary active:scale-[0.99]"
    onclick={() => handleSubmit("setup-qrcode")}
  >
    <span
      class="absolute inset-y-0 left-0 w-1 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    ></span>
    <span class="flex items-center gap-4">
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/5 text-primary transition-transform duration-200 group-hover:scale-105"
      >
        <QrCode size={22} />
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-2">
          <span class="text-sm font-semibold">QR Code</span>
        </span>
        <span class="mt-0.5 block text-xs text-base-content/60">
          Upload an image of a QR code
        </span>
      </span>
      <ChevronRight
        size={16}
        class="shrink-0 text-base-content/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary"
      />
    </span>
  </button>

  <button
    class="group relative w-full overflow-hidden rounded-xl border border-base-300 bg-base-200 p-4 text-left cursor-pointer transition-all duration-200 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/10 focus-visible:outline-2 focus-visible:outline-secondary active:scale-[0.99]"
    onclick={() => handleSubmit("setup-secretkey")}
  >
    <span
      class="absolute inset-y-0 left-0 w-1 bg-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    ></span>
    <span class="flex items-center gap-4">
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-secondary/20 to-secondary/5 text-secondary transition-transform duration-200 group-hover:scale-105"
      >
        <KeyRound size={22} />
      </span>
      <span class="min-w-0 flex-1">
        <span class="text-sm font-semibold">Secret Key</span>
        <span class="mt-0.5 block text-xs text-base-content/60">
          Enter the URI or Secret Key
        </span>
      </span>
      <ChevronRight
        size={16}
        class="shrink-0 text-base-content/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-secondary"
      />
    </span>
  </button>
</div>
