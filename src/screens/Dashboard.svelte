<script lang="ts">
  import {
    Clock,
    Copy,
    Palette,
    UserCog,
    Check,
    Eye,
    EyeOff,
    Crown,
    Bot,
    BotOff,
    Globe,
    BroomSparkles,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import NumberFlow, { NumberFlowGroup } from "@number-flow/svelte";
  import type { View } from "@/state/app-state.svelte";
  import { getOtpState, OTP_PERIOD_SECONDS } from "@/services/totp-service";

  const neptunURL = "https://neptun-hweb.sze.hu/hallgato_ng/login";

  interface Props {
    autoLogin: boolean;
    neptunCode: string;
    handleViewChange: (view: View) => void;
    handleAutoLoginChange: (autoLogin: boolean) => void;
  }

  let {
    neptunCode,
    autoLogin,
    handleViewChange,
    handleAutoLoginChange,
  }: Props = $props();

  let otpCode = $state("");
  let otpSecondsLeft = $state(OTP_PERIOD_SECONDS);
  let otpPeriodSeconds = $state(OTP_PERIOD_SECONDS);
  let otpReady = $state(false);
  let lockOtp = $state(false);
  let copied = $state(false);
  let copyResetId: number | undefined;

  const otpDigits = $derived(otpCode.split(""));

  const handleCopy = () => {
    if (!otpCode) return;

    navigator.clipboard.writeText(otpCode);
    copied = true;

    clearTimeout(copyResetId);
    copyResetId = window.setTimeout(() => {
      copied = false;
    }, 3000);
  };

  onMount(() => {
    const tick = async () => {
      const state = await getOtpState();

      otpCode = state.code;
      otpSecondsLeft = state.secondsLeft;
      otpPeriodSeconds = state.periodSeconds;
      otpReady = true;
    };

    void tick();
    const interval = setInterval(() => void tick(), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(copyResetId);
    };
  });
</script>

<div class="flex flex-row mb-5 card bg-base-300 shadow-lg p-2 items-stretch">
  <div class="avatar avatar-placeholder flex items-center">
    <button
      onclick={() => handleViewChange("settings")}
      class="btn btn-primary btn-circle rounded-xl flex items-center justify-center hover:bg-primary/50 hover:cursor-pointer group relative"
      aria-label="Settings"
    >
      <Crown class="block group-hover:hidden transition-all" />
      <UserCog class="hidden group-hover:block transition-all" />
    </button>
  </div>

  <div class="flex-1 ml-4 flex items-stretch">
    <div class="flex flex-col justify-between h-full w-fit py-1 px-1 rounded">
      <span class="text-md font-semibold">{neptunCode || "ABC123"}</span>
      <div class="flex w-full justify-around items-center -m-0.5">
        <div aria-label="success" class="status status-success"></div>
        <div aria-label="success" class="status status-success"></div>
        <div aria-label="success" class="status status-success"></div>
        <div aria-label="success" class="status status-success"></div>
      </div>
    </div>
  </div>
  <div class="flex items-center space-x-2">
    <button
      class="btn btn-info btn-sm btn-square rounded-xl"
      onclick={() => window.open(neptunURL, "_blank")}
      aria-label="Open Neptun"
    >
      <Globe size={18} />
    </button>
    <button
      class="btn btn-secondary btn-sm btn-square rounded-xl"
      aria-label="Mark as seen messages"
    >
      <BroomSparkles size={18} />
    </button>
    <button
      class={`btn btn-sm btn-square rounded-xl ${autoLogin ? "btn-success" : "btn-error"}`}
      onclick={() => handleAutoLoginChange(!autoLogin)}
      aria-label="Auto Login"
    >
      {#if autoLogin}
        <Bot size={18} class="text-base-content" />
      {:else}
        <BotOff size={18} class="text-base-content" />
      {/if}
    </button>
    <button
      class="btn btn-accent btn-sm btn-square rounded-xl"
      onclick={() => handleViewChange("themes")}
      aria-label="Themes"
    >
      <Palette size={18} />
    </button>
  </div>
</div>
<div class="card card-body bg-base-300 shadow-lg">
  <div class="flex items-center justify-between mb-2 pt-1">
    <div class="flex items-center gap-1.5">
      {#if autoLogin}
        <Bot size={32} class="text-base-content/40" />
      {:else}
        <BotOff size={32} class="text-base-content/40" />
      {/if}
    </div>
    <div class="flex items-center gap-1 text-xs text-base-content/60">
      <Clock size={11} />
      <NumberFlowGroup>
        <div
          style="font-variant-numeric: tabular-nums"
          class="text-3xl flex items-baseline font-semibold"
        >
          <NumberFlow
            trend={-1}
            value={otpSecondsLeft}
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
      </NumberFlowGroup>
    </div>
  </div>

  <div class="text-center py-0">
    <NumberFlowGroup>
      <div
        style="font-variant-numeric: tabular-nums;"
        class="text-4xl py-2 font-bold tracking-[0.25em] font-mono text-base-content flex justify-center items-center h-10 animate-in fade-in transition-[filter] duration-300 ease-in-out"
      >
        {#if lockOtp}
          <span class="flex items-center">
            {#each otpDigits.slice(0, 3) as digit, i (i)}
              <NumberFlow value={Number(digit)} />
            {/each}
          </span>
          <span class="inline-block w-3"></span>
          <span class="flex items-center">
            {#each otpDigits.slice(3) as digit, i (i)}
              <NumberFlow value={Number(digit)} />
            {/each}
          </span>
        {:else}
          <span class="leading-none">••• •••</span>
        {/if}
      </div>
    </NumberFlowGroup>
  </div>

  <div class="w-full bg-base-300 rounded-full h-1.5 mb-4 mt-2">
    <div
      class="bg-base-content h-1.5 rounded-full {otpReady
        ? 'transition-[width] duration-1000 ease-linear'
        : ''}"
      style="width: {otpReady
        ? (otpSecondsLeft / otpPeriodSeconds) * 100
        : 0}%"
    ></div>
  </div>

  <div class="join grid grid-cols-2">
    <button
      class="btn btn-sm join-item w-full transition-all duration-700 {copied
        ? 'bg-success text-success-content border-success'
        : ''}"
      onclick={handleCopy}
    >
      {#if copied}
        <Check size={14} /> Copied!
      {:else}
        <Copy size={14} /> Copy
      {/if}
    </button>
    <button
      class="btn btn-sm join-item w-full"
      onclick={() => (lockOtp = !lockOtp)}
    >
      {#if lockOtp}
        <EyeOff size={14} /> Lock
      {:else}
        <Eye size={14} /> Unlock
      {/if}
    </button>
  </div>
</div>
