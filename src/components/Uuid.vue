<script setup lang="ts">
import { ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import { ElNotification } from "element-plus";

const id = ref("");
let isUpper = false;

async function newUuid() {
    let tempId = uuidv4();
    if (isUpper) {
        tempId = tempId.toLocaleUpperCase();
    }
    id.value = tempId;
}

async function copy() {
    if (!id.value) {
        ElNotification({ message: "id为空", type: "error", duration: 1000, position: "bottom-right" });
        return;
    }
    navigator.clipboard.writeText(id.value).then(() => {
        ElNotification({ message: "复制成功", type: "success", duration: 1000, position: "bottom-right" });
    }).catch((err) => {
        ElNotification({ message: "复制失败", type: "error", duration: 1000, position: "bottom-right" });
    });
}

async function upper() {
    isUpper = true;
    id.value = id.value.toUpperCase();
}

async function lower() {
    isUpper = false;
    id.value = id.value.toLowerCase();
}
</script>

<template>
    <div class="button-group">
        <el-button class="generate" @click="newUuid">生成</el-button>
        <el-button class="upper" @click="upper" :disabled="!id">大写</el-button>
        <el-button class="lower" @click="lower" :disabled="!id">小写</el-button>
        <el-button class="copy" @click="copy" :disabled="!id">复制</el-button>
    </div>

    <div class="result">
        <el-input v-model="id" clearable></el-input>
    </div>
</template>

<style scoped>
.button-group {
    margin-bottom: 10px;
}

.result {
    width: 350px;
}

.copy {
    text-align: left;
}
</style>
