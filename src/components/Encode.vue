<script setup lang="ts">
import { ref } from "vue";

const inputValue = ref("");
const outputValue = ref("");

async function encode() {
    outputValue.value = encodeURI(inputValue.value);
}

async function decode() {
    outputValue.value = decodeURI(inputValue.value);
}

async function escape() {
    outputValue.value = encodeURIComponent(inputValue.value);
}

async function htmlEscape() {
    outputValue.value = inputValue.value.replace(/[&<>"']/g, function (match) {
        switch (match) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#39;';
            default:
                return match;
        }
    });
}

async function base64Encode() {
    outputValue.value = btoa(inputValue.value);
}

async function base64Decode() {
    outputValue.value = atob(inputValue.value);
}

async function clear() {
    inputValue.value = "";
    outputValue.value = "";
}
</script>

<template>
    <div class="row button-group">
        <el-button @click="base64Encode" :disabled="!inputValue">base64 编码</el-button>
        <el-button @click="base64Decode" :disabled="!inputValue">base64 解码</el-button>
        <el-button @click="encode" :disabled="!inputValue">URI 编码</el-button>
        <el-button @click="decode" :disabled="!inputValue">URI 解码</el-button>
    </div>
    <div class="row button-group">
        <el-button @click="htmlEscape" :disabled="!inputValue">HTML 转义</el-button>
        <el-button @click="escape" :disabled="!inputValue">文本转义</el-button>
        <el-button @click="clear" :disabled="!inputValue && !outputValue">清空</el-button>
    </div>
    <div class="row">
        <el-text class="label">输入：</el-text>
        <el-input class="input" :type="'textarea'" v-model="inputValue" autosize />
    </div>
    <div class="row">
        <el-text class="label">输出：</el-text>
        <el-input class="input" readonly :type="'textarea'" v-model="outputValue" autosize />
    </div>
</template>

<style scoped>
.row {
    display: flex;
    margin-bottom: 10px;
    max-width: 800px;
}

.button-group {
    display: flex;
    justify-content: center;
}

.label {
    width: 50px;
}
</style>
