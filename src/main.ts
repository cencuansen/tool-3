import './base.css';
import './custom.css';
import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { appWindow } from '@tauri-apps/api/window';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { el } from 'element-plus/es/locale';

const app = createApp(App);

app.use(ElementPlus);
app.mount('#app');

appWindow.theme().then(val => {
    if (val === "dark") {
        document.querySelector('html')?.classList.add('dark');
        document.querySelector('body')?.classList.add('dark');
    } else {
        document.querySelector('html')?.classList.remove('dark');
        document.querySelector('body')?.classList.remove('dark');
    }
});
