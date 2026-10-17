<script lang="ts">
  import { app } from "@/state/app-state.svelte";
</script>

<div>
  <button
    class="btn btn-error btn-sm flex-1"
    onclick={() => (app.currentView = "loading")}
  >
    Go back to loading
  </button>
</div>
