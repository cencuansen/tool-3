<script setup lang="ts">
import { ref } from "vue";
import { http } from "@tauri-apps/api";


const ip = ref("");

async function getIp() {
    const api = "";
    if (!api) {
        return;
    }
    const response = await http.fetch(api, { method: 'GET', responseType: 1 });
    ip.value = response.data as string;
}
</script>

<template>
    <el-button @click="getIp">查IP</el-button>
    <el-input>{{ ip }}</el-input>
</template>

<style scoped></style>
