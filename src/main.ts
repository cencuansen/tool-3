import { createApp } from "vue";
import App from "./App.vue";
import { appWindow } from '@tauri-apps/api/window';
import ElementPlus from 'element-plus';

import('./base.css');
import('./custom.css');
import('element-plus/dist/index.css');
import('element-plus/theme-chalk/dark/css-vars.css');

const app = createApp(App);

app.mount('#app');
app.use(ElementPlus);
appWindow.theme().then(val => {
    if (val === "dark") {
        document.querySelector('html')?.classList.add('dark');
        document.querySelector('body')?.classList.add('dark');
    } else {
        document.querySelector('html')?.classList.remove('dark');
        document.querySelector('body')?.classList.remove('dark');
    }
});
