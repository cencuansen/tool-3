<script setup lang="ts">
import { ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import { ElMessage } from "element-plus";

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
        ElMessage({ message: "id为空", type: "error" });
        return;
    }
    navigator.clipboard.writeText(id.value).then(() => {
        ElMessage({ message: "复制成功", type: "success" });
    }).catch((err) => {
        ElMessage({ message: "复制失败", type: "error" });
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
    <el-row class="row">
        <el-col :span="2" class="generate"><el-button @click="newUuid">生成</el-button></el-col>
        <el-col :span="2" class="upper"><el-button @click="upper">大写</el-button></el-col>
        <el-col :span="2" class="lower"><el-button @click="lower">小写</el-button></el-col>
        <el-col :span="2" class="copy"><el-button @click="copy">复制</el-button></el-col>
    </el-row>
    <el-row class="row">
        <el-col :span="10"><el-input v-model="id"></el-input></el-col>
    </el-row>
</template>

<style scoped>
.row {
    margin-bottom: 10px;
}

.copy {
    text-align: left;
}
</style>
