<script setup lang="ts">
import { ref } from "vue";
import { invoke } from '@tauri-apps/api';

const oldHostsContent = ref("");
const hostsContent = ref("");

async function read() {
    const content = await invoke('read_hosts_file');
    hostsContent.value = content as string;
    oldHostsContent.value = hostsContent.value;
}

async function write() {
    await invoke('write_hosts_file', { content: hostsContent.value });
    oldHostsContent.value = hostsContent.value;
}

async function clear() {
    hostsContent.value = "";
}
</script>

<template>
    <div class="row">
        <el-button @click="read">读取 hosts</el-button>
        <el-button @click="write" :disabled="hostsContent.length === 0 ||
            oldHostsContent === hostsContent">写入
            hosts</el-button>
        <el-button @click="clear" :disabled="hostsContent.length === 0">清空文本框</el-button>
    </div>
    <el-input v-model="hostsContent" type="textarea" autosize></el-input>
</template>

<style scoped>
.row {
    margin-bottom: 10px;
}
</style>
