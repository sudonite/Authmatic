<script lang="ts">
  import {
    Check,
    ChevronRight,
    KeyRound,
    Link2,
    Smartphone,
  } from "lucide-svelte";
  import { extractSecretFromInput } from "@/services/topt-service";

  interface Props {
    handleSubmit: (secretKey: string) => void;
  }

  let { handleSubmit }: Props = $props();

  const BASE32_LENGTH = 56;

  type FormatId = "base32" | "otpauth" | "migration";
  type FormatState = "idle" | "reading" | "match";

  interface SecretFormat {
    id: FormatId;
    label: string;
    example: string;
    icon: typeof KeyRound;
    matches: (value: string) => boolean;
    reads: (value: string) => boolean;
  }

  const FORMATS: SecretFormat[] = [
    {
      id: "base32",
      label: "Base32 key",
      example: "JBSWY3DPEHPK3PXP…",
      icon: KeyRound,
      matches: (value) => /^[A-Z2-7]{56}$/i.test(value),
      reads: (value) => /^[A-Z2-7]{1,56}$/i.test(value),
    },
    {
      id: "otpauth",
      label: "otpauth URI",
      example: "otpauth://totp/…",
      icon: Link2,
      matches: (value) =>
        /^otpauth:\/\/totp\/[a-zA-Z0-9]{6}\?secret=[A-Z2-7]{56}(?:&.*)?$/i.test(
          value,
        ),
      reads: (value) => value.startsWith("otpauth://"),
    },
    {
      id: "migration",
      label: "Migration export",
      example: "otpauth-migration://offline?…",
      icon: Smartphone,
      matches: (value) =>
        /^otpauth-migration:\/\/offline\?data=[a-zA-Z0-9%._~-]+$/.test(value),
      reads: (value) => value.startsWith("otpauth-migration://"),
    },
  ];

  const ROW_STYLES: Record<FormatState, string> = {
    idle: "border-base-300 bg-base-200/40",
    reading: "border-secondary/50 bg-secondary/10",
    match: "border-success/50 bg-success/10",
  };

  const STATUS_LABELS: Record<FormatState, string> = {
    idle: "waiting",
    reading: "reading",
    match: "recognized",
  };

  let inputValue = $state("");
  let isProcessing = $state(false);
  let inputError = $state("");

  let trimmed = $derived(inputValue.trim());

  let formatStates = $derived.by((): Record<FormatId, FormatState> => {
    const states: Record<FormatId, FormatState> = {
      base32: "idle",
      otpauth: "idle",
      migration: "idle",
    };
    if (!trimmed) return states;

    for (const format of FORMATS) {
      states[format.id] = format.matches(trimmed)
        ? "match"
        : format.reads(trimmed)
          ? "reading"
          : "idle";
    }
    return states;
  });

  let isInputValid = $derived(Object.values(formatStates).includes("match"));

  const handleContinue = () => {
    if (isProcessing || !isInputValid) return;

    inputError = "";
    isProcessing = true;

    try {
      const secretKey = extractSecretFromInput(trimmed);
      handleSubmit(secretKey);
    } catch (error) {
      inputError =
        error instanceof Error
          ? error.message
          : "Failed to process the provided code.";
    } finally {
      isProcessing = false;
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") handleContinue();
  };
</script>

<div class="flex flex-1 flex-col justify-center gap-3">
  <input
    id="secret-input"
    type="text"
    class="input input-sm mt-1.5 w-full font-mono tracking-wider"
    placeholder="Paste your key or otpauth:// URI"
    bind:value={inputValue}
    autocomplete="off"
    spellcheck="false"
    onkeydown={handleKeydown}
  />

  {#if inputError}
    <div class="alert alert-error alert-soft py-2 text-xs" role="alert">
      <span>{inputError}</span>
    </div>
  {/if}

  <div class="flex flex-1 flex-col gap-2.5">
    <div class="w-full">
      <div class="flex w-full items-center justify-between">
        <span
          class="text-[10px] font-semibold tracking-widest text-base-content/40 uppercase"
        >
          Accepted formats
        </span>

        {#if trimmed.length > 0}
          {@const isBase32Active =
            formatStates["base32"] === "reading" ||
            formatStates["base32"] === "match"}
          <span
            class="text-[10px] font-semibold tracking-widest text-base-content/40 uppercase text-right"
          >
            {trimmed.length}{#if isBase32Active}/{BASE32_LENGTH}{" "}chars{:else}{" "}chars{/if}
          </span>
        {/if}
      </div>
    </div>
    <ul class="flex flex-col gap-1.5">
      {#each FORMATS as format (format.id)}
        {@const state = formatStates[format.id]}
        {@const Icon = format.icon}
        <li
          class="flex items-center gap-2.5 rounded-lg border p-2 transition-colors duration-200 {ROW_STYLES[
            state
          ]}"
        >
          <span
            class="h-2.5 w-2.5 shrink-0 border transition-colors duration-200 {state ===
            'match'
              ? 'border-success bg-success'
              : state === 'reading'
                ? 'border-secondary bg-secondary'
                : 'border-base-300'}"
          ></span>
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-base-100/60 text-base-content/60"
          >
            <Icon size={15} />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-semibold">
              {format.label}
            </span>
            <span
              class="block truncate font-mono text-[10px] text-base-content/50"
            >
              {format.example}
            </span>
          </span>
          <span
            class="flex shrink-0 items-center gap-1 text-[10px] font-medium tracking-wide uppercase {state ===
            'match'
              ? 'text-success'
              : state === 'reading'
                ? 'text-secondary'
                : 'text-base-content/40'}"
          >
            {#if state === "match"}
              <Check size={11} />
            {/if}
            {STATUS_LABELS[state]}
          </span>
        </li>
      {/each}
    </ul>
  </div>

  <button
    class="btn btn-secondary btn-sm w-full"
    disabled={!isInputValid || isProcessing}
    onclick={handleContinue}
  >
    {isProcessing ? "Processing…" : "Continue"}
    <ChevronRight size={16} />
  </button>
</div>
