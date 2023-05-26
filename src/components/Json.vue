<script setup lang="ts">
import { ref } from "vue";

const text = ref("");

async function format() {
    const json = JSON.parse(text.value);
    const result = JSON.stringify(json, null, " ");
    text.value = result;
}

async function uglyfy() {
    const json = JSON.parse(text.value);
    const result = JSON.stringify(json);
    text.value = result;
}

async function escape() {
    const json = JSON.parse(text.value);
    const result = JSON.stringify(json, _escape);
    text.value = result;
}

function _escape(key: string, val: string) {
    if (typeof (val) != "string") return val;
    return val
        .replace(/[\\]/g, '\\\\')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t')
        .replace(/"/g, '\\"')
        .replace(/\\'/g, "\\'");
}

async function clear() {
    text.value = "";
}
</script>

<template>
    <div class="row">
        <el-button @click="format" :disabled="!text">格式化</el-button>
        <el-button @click="uglyfy" :disabled="!text">压缩</el-button>
        <el-button @click="escape" :disabled="!text">转义</el-button>
        <el-button @click="clear" :disabled="!text">清空</el-button>
    </div>
    <div class="row">
        <el-input class="text-area" v-model="text" type="textarea" autosize />
    </div>
</template>

<style scoped>
.row {
    display: flex;
    margin-bottom: 10px;
}

.text-area {
    height: 100%;
}

.text-area :deep(.el-textarea__inner) {
    height: 100%;
    font-family: "Consolas";
}
</style>
