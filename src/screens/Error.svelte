<script lang="ts">
  import { Copy, RotateCcw, TriangleAlert } from "@lucide/svelte";
  import type { CapturedError, View } from "@/state/app-state.svelte";

  interface Props {
    error: CapturedError | null;
    handleViewChange: (view: View) => void;
    handleReset: () => void;
  }

  let { error = $bindable(), handleViewChange, handleReset }: Props = $props();

  let copied = $state(false);

  const faultCode = (input: string): string => {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  };

  let code = $derived(
    error ? `FAULT-${faultCode(error.name + error.message)}` : "FAULT-??????",
  );

  let timestamp = $derived(
    error
      ? new Date(error.at).toLocaleTimeString("en-GB", { hour12: false })
      : "",
  );

  const copyReport = async () => {
    if (!error) return;

    await navigator.clipboard.writeText(formatFaultReport(error));
    copied = true;
    window.setTimeout(() => (copied = false), 1500);
  };

  const handleReload = () => {
    error = null;
    handleViewChange("loading");
  };

  const formatFaultReport = (error: CapturedError): string =>
    [
      `FAULT-${faultCode(error.name + error.message)}`,
      `${error.name}: ${error.message}`,
      `source: ${error.source}`,
      `at: ${error.at}`,
      error.stack ? `\n${error.stack}` : "",
    ]
      .filter(Boolean)
      .join("\n");
</script>

<div class="flex h-full flex-col p-5" role="alert">
  <div class="flex flex-1 flex-col items-center justify-center gap-3">
    <div
      class="flex h-14 w-14 items-center justify-center rounded-2xl border border-error/40 bg-error/10 text-error"
    >
      <TriangleAlert size={26} />
    </div>
    <div class="text-center">
      <p class="text-lg font-bold">System fault</p>
      <p class="mt-1 text-xs text-base-content/60">
        Something crashed while running. Your saved secrets stay on this device.
      </p>
    </div>
  </div>

  {#if error}
    <div
      class="relative overflow-hidden rounded-lg border border-error/40 bg-base-200/60 p-3"
    >
      <span
        class="absolute top-1.5 left-1.5 h-2.5 w-2.5 border-t border-l border-error/50"
      ></span>
      <span
        class="absolute top-1.5 right-1.5 h-2.5 w-2.5 border-t border-r border-error/50"
      ></span>
      <span
        class="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-error/50"
      ></span>
      <span
        class="absolute right-1.5 bottom-1.5 h-2.5 w-2.5 border-r border-b border-error/50"
      ></span>

      <div class="flex items-center justify-between">
        <span
          class="font-mono text-[10px] font-semibold tracking-[0.2em] text-base-content/50 uppercase"
        >
          Fault report
        </span>
        <span class="inline-grid *:[grid-area:1/1]">
          <span class="status status-sm status-error animate-ping"></span>
          <span class="status status-sm status-error"></span>
        </span>
      </div>

      <div
        class="mt-2 flex items-center justify-between font-mono text-[10px] tabular-nums text-base-content/50"
      >
        <span class="font-semibold text-error">{code}</span>
        <span>{timestamp}</span>
      </div>

      <p class="mt-1.5 font-mono text-[11px] font-semibold wrap-break-words">
        {error.name}: {error.message}
      </p>

      {#if error.stack}
        <div
          class="thin-scrollbar mt-2 max-h-24 overflow-y-auto rounded-md border border-base-300 bg-base-100/60 p-2 overscroll-contain"
        >
          <pre
            class="font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-base-content/60">{error.stack}</pre>
        </div>
      {/if}

      <div class="mt-2 flex items-center justify-between">
        <span class="font-mono text-[10px] text-base-content/40">
          {error.source}
        </span>
        <button
          class="btn btn-ghost btn-xs gap-1"
          onclick={copyReport}
          aria-label="Copy fault report"
        >
          <Copy size={12} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  {/if}

  <div class="mt-3 flex gap-2">
    <button class="btn btn-error btn-sm flex-1" onclick={handleReload}>
      <RotateCcw size={14} />
      Reload
    </button>
    <button class="btn btn-error btn-sm flex-1" onclick={handleReset}>
      <TriangleAlert size={14} />
      Delete all data
    </button>
  </div>
</div>
