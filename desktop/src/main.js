import { createApp } from "vue"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import "@/style/index.scss"
import App from "./App.vue"
import registerGlobalComponents from "@/components"

const app = createApp(App)

app.use(ElementPlus)
registerGlobalComponents(app)
app.mount("#app")
