<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import yaml from "js-yaml";

const inputValue = ref("");
const outputValue = ref("");
const textType = ref("");

async function toJson() {
    outputValue.value = JSON.stringify(yaml.load(inputValue.value), null, "    ");
}

async function toYaml() {
    outputValue.value = yaml.dump(JSON.parse(inputValue.value));
    // 顺带格式化 json
    // inputValue.value = JSON.stringify(JSON.parse(inputValue.value), null, "    ");
}

async function detectFormat() {
    inputValue.value = inputValue.value.trim();
    if (inputValue.value.length === 0) {
        textType.value = "empty";
    } else if (inputValue.value.startsWith("{") && inputValue.value.endsWith("}") || inputValue.value.startsWith("[") && inputValue.value.endsWith("]")) {
        textType.value = "json";
    } else {
        textType.value = "yaml";
    }
}

async function clear() {
    inputValue.value = "";
    outputValue.value = "";
    textType.value = "empty";
}
</script>

<template>
    <div class="row button-group">
        <el-button @click="toJson" :disabled="textType === 'empty' || textType !== 'yaml'">YAML 转 JSON</el-button>
        <el-button @click="toYaml" :disabled="textType === 'empty' || textType !== 'json'">JSON 转 YAML</el-button>
        <el-button @click="clear" :disabled="!inputValue && !outputValue">清空</el-button>
    </div>
    <div class="row">
        <el-text class="label">输入：</el-text>
        <el-input class="input" :type="'textarea'" v-model="inputValue" autosize @input="detectFormat" />
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
