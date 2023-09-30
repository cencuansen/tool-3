<script setup lang="ts">
import moment from 'moment';
import { ref, computed } from "vue";

moment.suppressDeprecationWarnings = true;

const timeStampInput = ref("");
const dateTimeInput = ref("");

const dateTimeOutput = computed(() => {
    try {
        if (timeStampInput.value.length === 10) {
            return moment(new Date(Number(`${timeStampInput.value}000`))).format("YYYY-MM-DD HH:mm:ss");
        } else if (timeStampInput.value.length === 13) {
            return moment(new Date(Number(timeStampInput.value))).format("YYYY-MM-DD HH:mm:ss");
        }
    } catch {

    }
    return "不合法";
});

const timeStampOutput = computed(() => {
    try {
        if (!moment(dateTimeInput.value).isValid()) { return "不合法"; }
        return Date.parse(dateTimeInput.value).toString();
    } catch {

    }
    return "不合法";
});

const now = ref(0);

async function getNow() {
    now.value = Date.now();
}
</script>

<template>
    <div class="row-now">
        <el-button @click="getNow">当前时间</el-button>
        <div>→</div>
        <div>{{ now }}</div>
        <div>→</div>
        <div>{{ moment(new Date(now)).format("YYYY-MM-DD HH:mm:ss") }}</div>
    </div>

    <el-row class="row">
        <el-col :span="6">
            <el-input v-model="timeStampInput" placeholder="数值" type="number"></el-input></el-col>
        <el-col :span="1" class="arrow">→</el-col>
        <el-col :span="10" class="result">{{ dateTimeOutput }}</el-col>
    </el-row>

    <el-row class="row">
        <el-col :span="6">
            <el-input v-model="dateTimeInput" placeholder="日期" type="datetime"></el-input></el-col>
        <el-col :span="1" class="arrow">→</el-col>
        <el-col :span="10" class="result">{{ timeStampOutput }}</el-col>
    </el-row>
</template>

<style scoped>
.row-now {
    display: flex;
    font-size: 18px;
    margin-right: 10px;
    margin-bottom: 10px;
}

.row-now>div {
    display: flex;
    align-items: center;
    padding-left: 10px;
}

.arrow {
    display: flex;
    user-select: none;
    align-items: center;
    justify-content: center;
}

.result {
    display: flex;
    font-size: 18px;
    align-items: center;
    justify-content: left;
}

.row {
    margin-bottom: 10px;
}
</style>
