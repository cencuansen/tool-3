<script setup lang="ts">
import { ref, computed } from "vue";

const text = ref('{"pjncjq":{"kexbusmcnwm":"IurbpHDAUix4zGrpUW","iulgp":true,"brmocovhqvh":"jJ_xdyXTMaFIZB1-kTzV"},"mipcckru":[["IgI0S4dGpdyP",-493815549.7200581,-188699608.2039967]],"znxhempxht":"SnC_0ZVxZCxT3l5"}');

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

function _escape(_, val) {
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
    <el-container>
        <el-header>
            <el-button @click="format" :disabled="!text">格式化</el-button>
            <el-button @click="uglyfy" :disabled="!text">压缩</el-button>
            <el-button @click="escape" :disabled="!text">转义</el-button>
            <el-button @click="clear" :disabled="!text">清空</el-button>
        </el-header>
        <el-main>
            <el-input class="text-area" v-model="text" type="textarea"/>
        </el-main>
    </el-container>
</template>

<style scoped>
.el-container {
    height: 100%;
}

.text-area {
    height: 100%;
}

.text-area :deep(.el-textarea__inner) {
    height: 100%;
    resize: none;
    font-family: "Consolas";
}
</style>
