type App = {
  currentView: View
  error: CapturedError | null
}

type View =
  | "loading"
  | "error"
  | "setup-credentials"
  | "setup-method"
  | "setup-qrcode"
  | "setup-secretkey"
  | "dashboard"
  | "themes"
  | "settings"
  | "show-qrcode"
  | "show-secretkey";

type CapturedError = {
  name: string;
  message: string;
  stack: string | null;
  source: "uncaught" | "unhandled-rejection";
  at: string;
};

type SetupMethodView = Extract<View, "setup-qrcode" | "setup-secretkey">;

const app: App = $state({
  currentView: "loading",
  error: null,
});

export { app };
export type { App, CapturedError, View, SetupMethodView };