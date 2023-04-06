<script setup lang="ts">
import UUID from "./components/Uuid.vue";
import ChangeRate from "./components/ChangeRate.vue";
import TimeConvert from "./components/TimeConvert.vue";
import { invoke } from "@tauri-apps/api/tauri";
import { ref, shallowRef } from "vue";

async function greet() {
  await invoke("greet", { name: "-.-" });
}

const menus = ref<{ name: string, icon: string, component: any }[]>([
  { name: "UUID", icon: "→", component: shallowRef(UUID) },
  { name: "时间戳", icon: "", component: shallowRef(TimeConvert) },
  { name: "变更幅度", icon: "", component: shallowRef(ChangeRate) },
]);

let activeComponent = shallowRef(UUID);

async function switchMenu(menu: { name: string, icon: string, }) {
  const old = menus.value.find(x => x.icon === "→");
  const target = menus.value.find(x => x.name === menu.name);
  old!.icon = "";
  target!.icon = "→";
  activeComponent.value = target?.component;
}

</script>

<template>
  <el-container id="main-container">
    <el-aside id="main-aside">
      <template v-for="menu in menus">
        <el-row class="menu-item" @click="switchMenu(menu)">
          <el-col :span="6" class="menu-icon">{{ menu.icon }}</el-col>
          <el-col :span="18" class="menu-name">{{ menu.name }}</el-col>
        </el-row>
      </template>
    </el-aside>
    <el-main id="main-main">
      <keep-alive>
        <component :is="activeComponent"></component>
      </keep-alive>
    </el-main>
  </el-container>
</template>

<style scoped>
#app {
  height: 100vh;
  overflow-y: hidden;
}

#main-container {
  height: 100vh;
}

#main-aside {
  width: 180px;
  user-select: none;
  padding: 10px 10px;
  border-right: 1px solid #aaa;
}

.menu-item {
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  line-height: 30px;
}

.menu-icon {
  text-align: left;
}

.menu-name {
  text-align: left;
}

.menu-name:hover {
  color: coral;
}
</style>
