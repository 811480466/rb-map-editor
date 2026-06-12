import AppShell from "./app-shell/index.vue";

export default function registerGlobalComponents(app) {
  app.component("AppShell", AppShell);
}
