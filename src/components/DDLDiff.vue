<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { el } from "element-plus/es/locale";

const oldDdl = ref(`CREATE TABLE \`user\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`age\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
const newDdl = ref(`CREATE TABLE \`user\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`email\` varchar(255) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
const resultDdl = ref("");

type ForeignKeyDefinition = {
    refTable: string,
    refColumn: string
}

type ColumnDefinition = {
    name: string,
    type: string,
    comment: string,
    unique: boolean,
    nullable: boolean,
    autoIncrement: boolean,
    primaryKey: boolean
    foreignKey: ForeignKeyDefinition | null
}

type TableDefinition = {
    tableName: string,
    columns: ColumnDefinition[],
}


type TableModify = {
    tableName: string,
    addCols?: ColumnModify[],
    removeCols?: ColumnModify[],
    updateCols?: ColumnModify[],
}

type ColumnModify = {
    columnName: string,
    ddl: string
}

const tablesModify = ref<TableModify[]>([]);

async function compare() {
    const oldTable = parseDDL(oldDdl.value);
    const newTable = parseDDL(newDdl.value);
    console.log(oldTable);
    console.log(newTable);

    // 获取需要新增的字段
    if (newTable.tableName === oldTable.tableName) {

        const tableModify: TableModify = {
            tableName: newTable.tableName,
        };

        const newFields = new Set(newTable.columns.map(c => c.name));
        const oldFields = new Set(oldTable.columns.map(c => c.name));

        // 待新增列
        const addCols = [...newFields].filter(x => !oldFields.has(x));
        if (addCols.length > 0) {
            const addColumnAndDdl = addCols.map(columnName => {
                const column = newTable.columns.find(col => col.name === columnName);
                return {
                    columnName: column?.name || "",
                    ddl: `ALTER TABLE ${newTable.tableName} ADD COLUMN ${column?.name} ${column?.type};`
                }
            });
            tableModify.addCols = addColumnAndDdl;
        }

        // 待删除列
        const removeCols = [...oldFields].filter(x => !newFields.has(x));
        if (removeCols.length > 0) {
            const removeColumnAndDdl = removeCols.map(columnName => {
                const column = oldTable.columns.find(col => col.name === columnName);
                return {
                    columnName: column?.name || "",
                    ddl: `ALTER TABLE ${newTable.tableName} DROP COLUMN ${column?.name};`
                }
            });
            tableModify.removeCols = removeColumnAndDdl;
        }

        // 待更新列
        // TODO

        const index = tablesModify.value.findIndex(t => t.tableName === newTable.tableName);
        if (index > -1) {
            tablesModify.value.splice(index, 1, tableModify)
        } else {
            tablesModify.value.push(tableModify);
        }
    } else {
        // 这种情况可能是表名也变更
    }
}

function parseDDL(ddl: string): TableDefinition {
    const patternTable = /CREATE\s+TABLE\s+`?(\w+)`?/i;
    const patternColumns = /`(\w+)`\s+([\w\s()]+)(\s+COMMENT\s+'(.+?)')?,?/ig;
    const patternPK = /PRIMARY\s+KEY\s+\(`(.+?)`\)/i;
    const patternFK = /FOREIGN\s+KEY\s+\(`(.+?)`\)\s+REFERENCES\s+`?(\w+)`?\.`?(\w+)`?\(`(.+?)`\)/ig;
    const patternUnique = /UNIQUE\s+\(`(.+?)`\)/ig;

    const matchTable = ddl.match(patternTable);
    if (!matchTable) {
        throw new Error('Invalid SQL DDL statement');
    }

    const tableName = matchTable[1];
    const columns = [];
    let matchColumns;
    while ((matchColumns = patternColumns.exec(ddl)) !== null) {
        const column: ColumnDefinition = {
            name: matchColumns[1],
            type: matchColumns[2].trim(),
            comment: matchColumns[4] ? matchColumns[4].trim() : '',
            primaryKey: false,
            foreignKey: null,
            unique: false,
            nullable: true,
            autoIncrement: false
        };
        columns.push(column);
    }

    const matchPK = ddl.match(patternPK);
    if (matchPK) {
        const pkColumns = matchPK[1].split(',').map(col => col.trim());
        for (const col of columns) {
            if (pkColumns.includes(col.name)) {
                col.primaryKey = true;
            }
        }
    }

    let matchFK;
    while ((matchFK = patternFK.exec(ddl)) !== null) {
        const fkColumn = matchFK[1];
        const refTable = matchFK[2];
        const refColumn = matchFK[4];
        for (const col of columns) {
            if (col.name === fkColumn) {
                col.foreignKey = { refTable, refColumn };
            }
        }
    }

    let matchUnique;
    while ((matchUnique = patternUnique.exec(ddl)) !== null) {
        const uniqueColumns = matchUnique[1].split(',').map(col => col.trim());
        for (const col of columns) {
            if (uniqueColumns.includes(col.name)) {
                col.unique = true;
            }
        }
    }

    return {
        tableName,
        columns
    };
}

</script>

<template>
    <el-row>
        <el-button @click="compare">对比</el-button>
    </el-row>
    <el-row :gutter="30">
        <el-col :span="12">
            <div><el-text class="label">旧：</el-text></div>
            <el-input v-model="oldDdl" type="textarea" autosize></el-input>
        </el-col>
        <el-col :span="12">
            <div><el-text class="label">新：</el-text></div>
            <el-input v-model="newDdl" type="textarea" autosize></el-input>
        </el-col>
    </el-row>
    <div v-for="table in tablesModify">
        <el-row><el-text>表名：{{ table.tableName }}</el-text></el-row>
        <div v-if="(table.addCols?.length ?? 0) > 0">
            <el-row><el-text>新增：</el-text></el-row>
            <el-row v-for="add in table.addCols">
                <el-col :span="1">

                </el-col>
                <el-col :span="3">
                    {{ add.columnName }}
                </el-col>
                <el-col :span="15">
                    {{ add.ddl }}
                </el-col>
            </el-row>
        </div>
        <div v-if="(table.removeCols?.length ?? 0) > 0">
            <el-row><el-text>删除：</el-text></el-row>
            <el-row v-for="remove in table.removeCols">
                <el-col :span="1">

                </el-col>
                <el-col :span="3">
                    {{ remove.columnName }}
                </el-col>
                <el-col :span="15">
                    {{ remove.ddl }}
                </el-col>
            </el-row>
        </div>
        <div v-if="(table.updateCols?.length ?? 0) > 0">
            <el-row><el-text>更新：</el-text></el-row>
            <el-row v-for="update in table.updateCols">
                <el-col :span="1">

                </el-col>
                <el-col :span="2">
                    {{ update.columnName }}
                </el-col>
                <el-col :span="15">
                    {{ update.ddl }}
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<style scoped>
.el-row {
    margin-bottom: 10px;
}

.row {
    display: flex;
    margin-bottom: 10px;
}

.resultRow {
    display: flex;
    margin-bottom: 10px;
}

.resultRow>.columnName {
    width: 50px;
}

.resultRow>.columnDdl {}

.col {
    width: 48%;
    display: flex;
    flex-direction: column;
}

.label {
    width: 50px;
}

.result {
    width: 100%;
}

.result>div {
    margin-bottom: 10px;
}
</style>
