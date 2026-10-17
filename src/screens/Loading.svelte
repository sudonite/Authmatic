<script lang="ts">
  import { onMount } from "svelte";
  import { KeyRound, ShieldCheck } from "lucide-svelte";
  import AuroraText from "@/components/AuroraText.svelte";
  import SparklesText from "@/components/SparklesText.svelte";
  import { app } from "@/state/app-state.svelte";
  import { initializeUser } from "@/state/user-state.svelte";

  const BOOT_STEP_MS = 300;
  const READY_HOLD_MS = 500;

  const BOOT_STEPS = [
    { id: "init", label: "Initializing application" },
    { id: "service", label: "Starting background services" },
    { id: "account", label: "Checking account state" },
  ] as const;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let completedSteps = $state(0);

  const progressValue = $derived(
    Math.round((completedSteps / BOOT_STEPS.length) * 100),
  );
  const isReady = $derived(completedSteps >= BOOT_STEPS.length);

  onMount(() => {
    const timers: number[] = [];

    installErrorHandlers();

    const userReady = initializeUser();

    timers.push(
      window.setTimeout(
        async () => {
          const user = await userReady;
          app.currentView = user ? "dashboard" : "setup-credentials";
        },
        BOOT_STEP_MS * BOOT_STEPS.length + READY_HOLD_MS,
      ),
    );

    BOOT_STEPS.forEach((_, index) => {
      timers.push(
        window.setTimeout(
          () => (completedSteps = index + 1),
          BOOT_STEP_MS * (index + 1),
        ),
      );
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  });
</script>

<div class="flex h-full flex-col p-5" role="status" aria-live="polite">
  <div class="flex flex-1 flex-col items-center justify-center gap-3">
    <div
      class="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-300 bg-base-200 text-secondary"
    >
      <KeyRound size={26} />
    </div>
    <SparklesText
      sparklesCount={prefersReducedMotion ? 0 : 3}
      colors={{
        first: "var(--color-primary)",
        second: "var(--color-secondary)",
      }}
      class="font-bold text-xl"
    >
      Auth<AuroraText speed={4}>matic</AuroraText>
    </SparklesText>
    <p class="text-xs text-base-content/60">
      Two-factor codes, encrypted on this device
    </p>
  </div>

  <div
    class="relative overflow-hidden rounded-lg border border-base-300 bg-base-200/60 p-3"
  >
    <span
      class="absolute top-1.5 left-1.5 h-2.5 w-2.5 border-t border-l border-base-content/25"
    ></span>
    <span
      class="absolute top-1.5 right-1.5 h-2.5 w-2.5 border-t border-r border-base-content/25"
    ></span>
    <span
      class="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-base-content/25"
    ></span>
    <span
      class="absolute right-1.5 bottom-1.5 h-2.5 w-2.5 border-r border-b border-base-content/25"
    ></span>

    <div class="flex items-center justify-between">
      <span
        class="font-mono text-[10px] font-semibold tracking-[0.2em] text-base-content/50 uppercase"
      >
        Boot sequence
      </span>
      <span class="inline-grid *:[grid-area:1/1]">
        {#if !isReady}
          <span class="status status-sm status-secondary animate-ping"></span>
        {/if}
        <span
          class="status status-sm {isReady
            ? 'status-success'
            : 'status-secondary'}"
        ></span>
      </span>
    </div>

    <ul class="mt-2 flex flex-col gap-1">
      {#each BOOT_STEPS as step, index (step.id)}
        {@const isDone = completedSteps > index}
        <li
          class="flex items-center gap-2 font-mono text-[11px] {isDone
            ? 'text-base-content'
            : 'text-base-content/40'}"
        >
          <span class="text-base-content/40">
            [{String(index + 1).padStart(2, "0")}]
          </span>
          <span class="flex-1 truncate">{step.label}</span>
          <span class={isDone ? "text-success" : ""}>
            {isDone ? "ok" : "…"}
          </span>
        </li>
      {/each}
    </ul>

    <progress class="progress mt-2.5 w-full" value={progressValue} max={100}
    ></progress>
    <div
      class="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-base-content/50"
    >
      <span>{isReady ? "System ready" : "Initializing"}</span>
      <span>{progressValue}%</span>
    </div>
  </div>

  <div
    class="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-base-content/50"
  >
    <ShieldCheck size={12} />
    <span>Secrets never leave this device</span>
  </div>
</div>
