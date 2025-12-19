import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // Ensure this path matches your router file

const app = createApp(App)
app.use(router)  // Register the router
app.mount('#app')