<script setup lang="ts">
import {ref, computed} from "vue";

const num1 = ref(1);
const num2 = ref(1);
const num3 = ref(1);

const changeRate = computed(() => {
  if (num1.value * num2.value === 0) {
    return "不合法";
  }
  const result = (num2.value - num1.value) / num1.value;
  return `${(result * 100).toFixed(2)}%`
});

const balance = computed(() => {
  if (num1.value * num2.value === 0) {
    return "不合法";
  }
  return ((1 + (num2.value - num1.value) / num1.value) * num3.value).toFixed(3);
});

</script>

<template>
  <el-row class="row">
    <el-col :span="4">
      <el-input v-model="num1" placeholder="数值" type="number"></el-input>
    </el-col>
    <el-col :span="1" class="arrow">→</el-col>
    <el-col :span="4">
      <el-input v-model="num2" placeholder="数值" type="number"></el-input>
    </el-col>
    <el-col :span="1" class="equals">=</el-col>
    <el-col :span="4" class="result">{{ changeRate }}</el-col>
  </el-row>
  <el-row class="row">
    <el-col :span="4" :offset="5">
      <el-input v-model="num3" placeholder="成本" type="number"></el-input>
    </el-col>
    <el-col :span="1" class="equals">=</el-col>
    <el-col :span="4" class="result">{{ balance }}</el-col>
  </el-row>
</template>

<style scoped>
.row {
  margin-bottom: 10px;
}

.arrow,
.equals {
  display: flex;
  user-select: none;
  align-items: center;
  justify-content: center;
}

.result {
  display: flex;
  font-size: 18px;
  align-items: center;
}
</style>
