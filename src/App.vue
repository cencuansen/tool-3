<script setup lang="ts">
import Ip from "./components/Ip.vue";
import Json from "./components/Json.vue";
import UUID from "./components/Uuid.vue";
import ChangeRate from "./components/ChangeRate.vue";
import TimeConvert from "./components/TimeConvert.vue";
import Encode from "./components/Encode.vue";
import YAML from "./components/YAML.vue";
import Hosts from "./components/Hosts.vue";
import DDLDiff from "./components/DDLDiff.vue";
import { invoke } from "@tauri-apps/api/tauri";

import { ref, shallowRef } from "vue";

async function greet() {
  await invoke("greet", { name: "-.-" });
}

const menus = ref<{ name: string, icon: string, component: any }[]>([
  { name: "JSON", icon: "→", component: shallowRef(Json) },
  { name: "YAML", icon: "", component: shallowRef(YAML) },
  { name: "编码", icon: "", component: shallowRef(Encode) },
  { name: "时间戳", icon: "", component: shallowRef(TimeConvert) },
  { name: "hosts", icon: "", component: shallowRef(Hosts) },
  { name: "DDL Diff", icon: "", component: shallowRef(DDLDiff) },
  { name: "UUID", icon: "", component: shallowRef(UUID) },
  { name: "增幅计算", icon: "", component: shallowRef(ChangeRate) },
  // { name: "IP", icon: "", component: shallowRef(Ip) },
]);

let activeComponent = shallowRef(Json);

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
