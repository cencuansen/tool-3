<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { el } from "element-plus/es/locale";

const oldDdl = ref(`CREATE TABLE \`user\` (\`id\` int(11) NOT NULL AUTO_INCREMENT,\`name\` varchar(255) NOT NULL,\`age\` int(11) NOT NULL,PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
const newDdl = ref(`CREATE TABLE \`user\` (\`id\` int(12) NOT NULL AUTO_INCREMENT,\`name\` varchar(255) NOT NULL,\`email\` varchar(255) DEFAULT NULL,PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

type DiffResult = {
    changed: boolean,
    name: string,
    type?: string,
    comment?: string,
    unique?: boolean,
    uniqueKeyName?: string | null,
    notNull?: boolean,
    autoIncrement?: boolean,
    primaryKey?: boolean
    primaryKeyName?: string | null,
    foreignKey?: boolean,
    foreignKeyReference?: string | null,
}

type ForeignKeyDefinition = {
    refTable: string,
    refColumn: string
}

type ColumnDefinition = {
    name: string,
    type: string,
    comment: string,
    unique: boolean,
    uniqueKeyName: string | null,
    notNull: boolean,
    autoIncrement: boolean,
    primaryKey: boolean
    primaryKeyName: string | null,
    foreignKey: boolean,
    foreignKeyReference: string | null,
}

type TableDefinition = {
    tableName: string,
    tableComment: string,
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
    tablesModify.value = [];

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
                    ddl: `alter table ${newTable.tableName} add column ${column?.name} ${column?.type};`
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
                    ddl: `alter table ${newTable.tableName} drop column ${column?.name};`
                }
            });
            tableModify.removeCols = removeColumnAndDdl;
        }

        // 待更新列
        const updateCols = [...oldFields].filter(x => newFields.has(x));
        if (updateCols.length > 0) {
            const updateColumnAndDdl = updateCols.map(columnName => {
                const column = oldTable.columns.find(col => col.name === columnName);
                const column1 = newTable.columns.find(col => col.name === columnName);
                const compareResult = compareColumn(column!, column1!)
                const ddl = diffUpdate(oldTable.tableName, compareResult);

                return {
                    columnName: column?.name || "",
                    ddl
                }
            }).filter(x => !!x.ddl);
            tableModify.updateCols = updateColumnAndDdl;
        }

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

function compareColumn(oldCol: ColumnDefinition, newCol: ColumnDefinition): DiffResult {
    const modify: DiffResult = {
        changed: false,
        name: newCol.name,
    };

    if (oldCol.type !== newCol.type) {
        modify.changed = true;
        modify.type = newCol.type || "";
    }
    if (oldCol.comment !== newCol.comment) {
        modify.changed = true;
        modify.comment = newCol.comment || "";
    }
    if (oldCol.unique !== newCol.unique) {
        modify.changed = true;
        modify.unique = newCol.unique;
    }
    if (oldCol.uniqueKeyName !== newCol.uniqueKeyName) {
        modify.changed = true;
        modify.uniqueKeyName = newCol.uniqueKeyName || "";
    }
    if (oldCol.notNull !== newCol.notNull) {
        modify.changed = true;
        modify.notNull = newCol.notNull;
    }
    if (oldCol.autoIncrement !== newCol.autoIncrement) {
        modify.changed = true;
        modify.autoIncrement = newCol.autoIncrement;
    }
    if (oldCol.primaryKey !== newCol.primaryKey) {
        modify.changed = true;
        modify.primaryKey = newCol.primaryKey;
    }
    if (oldCol.primaryKeyName !== newCol.primaryKeyName) {
        modify.changed = true;
        modify.primaryKeyName = newCol.primaryKeyName || "";
    }
    if (oldCol.foreignKey !== newCol.foreignKey) {
        modify.changed = true;
        modify.foreignKey = newCol.foreignKey;
    }
    if (oldCol.foreignKeyReference !== newCol.foreignKeyReference) {
        modify.changed = true;
        modify.foreignKeyReference = newCol.foreignKeyReference || "";
    }
    return modify;
}

function diffUpdate(tableName: string, diff: DiffResult) {
    if (diff.changed) {
        let sql = `alter table ${tableName} modify ${diff.name} ${diff.type ? diff.type : ''} ${diff.notNull ? 'not null' : 'null'} ${diff.autoIncrement ? 'auto_increment' : ''} ${diff.primaryKey ? 'primary key' : ''} ${diff.unique ? 'unique' : ''} comment '${diff.comment ?? ''}';`.replace(/\s+/g, ' ');
        return sql;
    }
    return "";
}

function parseDDL(ddl: string): TableDefinition {

    const tableName = getTableName(ddl);
    const tableComment = getTableComment(ddl);
    const columns = getTableColumns(ddl);

    return {
        tableName,
        tableComment,
        columns
    };
}

// 表名称
function getTableName(ddl: string) {
    const pattern = /CREATE\s+TABLE\s+\`?(\w+)\`?/i;
    const matchTable = ddl.match(pattern);
    if (!matchTable) {
        throw new Error("Invalid SQL DDL statement");
    }
    return matchTable[1];
}

// 表注释
function getTableComment(ddl: string) {
    // (['"])：使用捕获组来匹配单引号或双引号。
    // (.*?)：使用非贪婪模式的匹配来匹配引号之间的任意字符。
    // \1：使用反向引用来匹配第一个捕获组匹配到的引号字符。
    // 在执行 match 方法时，设置了全局标志（g）以匹配多个字符串。输出的结果是一个包含所有匹配到的字符串的数组。
    const pattern = /CREATE\s+TABLE\s+\`?\w+\`?\s+\([\s\S]*\).*COMMENT=(['"])(.*)\1/;
    const matchs = ddl.match(pattern);
    if (matchs) {
        return matchs[2];
    }
    return "";
}

// 列信息
function getTableColumns(ddl: string): ColumnDefinition[] {
    const regex = /CREATE\s+TABLE\s+\`?\w+\`?\s+\(([\s\S]*)\).*/gi;
    const postPKPatten = /(CONSTRAINT\s+(pk_\w+)\s+)?PRIMARY\s+KEY\s+\((.*)\)/i;
    const postFKPatten = /FOREIGN\s+KEY\s+\((.*?)\)\s+REFERENCES\s+(\w+\(\w+\))/gi;
    const postUniquePatten = /(CONSTRAINT\s+(uq_\w+)\s+)?UNIQUE\s+\((.*)\)/gi;
    const matches = regex.exec(ddl);

    if (matches) {
        const primaryKeyPatten = /\s+PRIMARY\s+KEY/i;
        const commentPatten = /\s+COMMENT\s+(['"])(.*)\1/i;
        const autoIncrementPatten = /AUTO_INCREMENT/i;
        const notNullPatten = /\s+NOT\s+NULL/i;
        const uniquePatten = /\s{1,}UNIQUE/i;

        // ,(?![^(]*\)) 匹配一个逗号，但排除了包含在括号内的逗号。
        // (?:\s*\n\s*|\s+) 匹配空格或者换行，其中 \s*\n\s* 匹配换行并且忽略前后空格，\s+ 匹配空格。
        // 使用 (?![^(]*\)) 来排除 PRIMARY KEY (id, name)。这个正则表达式会匹配 , 后面不在括号内的空格或者换行符。
        const splitColumnPatten = /(?:\([^)]*\)|[^,()])+?(?=,|$)/g;

        const columnDefs = matches[1].match(splitColumnPatten)?.map(rg => rg.replaceAll("\n", "")).map((x) => x.trim()) ?? [];
        const columns: ColumnDefinition[] = columnDefs
            .filter((columnDef) => {
                const result = !(postPKPatten.test(columnDef) || postFKPatten.test(columnDef) || postUniquePatten.test(columnDef));
                // !! 坑
                // 由于正则表达式的全局标志 g，在匹配第一个元素时，已经将 lastIndex 属性设置为了字符串中第一个匹配项的结束位置。
                // 当匹配第二个元素时，正则表达式会从上次匹配结束的位置开始匹配，因此会直接跳过第二个元素，导致没有匹配到。
                // 解决方法是在每次循环开始前，手动将正则表达式对象的 lastIndex 属性重置为 0，
                // 即：postFKPatten.lastIndex = 0;
                postFKPatten.lastIndex = 0;
                postUniquePatten.lastIndex = 0;
                return result;
            })
            .map((columnDef) => {
                const definitions = columnDef.trim().split(/\s+/);
                const name = definitions[0].replaceAll("`", "");
                const type = definitions[1];
                const notNull = notNullPatten.test(columnDef);
                const autoIncrement = autoIncrementPatten.test(columnDef);
                const comment = commentPatten.exec(columnDef)?.[2] ?? null;
                const unique = uniquePatten.test(columnDef);
                // 匹配行内主键约束
                const primaryKey = primaryKeyPatten.test(columnDef);
                return { name, type, notNull: primaryKey || unique || notNull, unique, autoIncrement, comment, primaryKey, uniqueKeyName: null, primaryKeyName: null, foreignKey: false, foreignKeyReference: null } as ColumnDefinition;
            });

        // 处理后置约束中的主键约束
        const postPKConstrant = postPKPatten.exec(ddl);
        if (postPKConstrant) {
            const keys = postPKConstrant[3].split(/,\s+/);
            columns.forEach((column) => {
                if (keys.includes(column.name)) {
                    column.primaryKey = true;
                    column.notNull = true;
                    if (postPKConstrant[2]) {
                        // 说明设置了主键名
                        column.primaryKeyName = postPKConstrant[2];
                    }
                }
            });
        }

        // 处理后置约束中的外键约束
        const postFKConstrant = ddl.match(postFKPatten);
        if (postFKConstrant) {
            postFKConstrant.forEach((fk) => {
                const fKConstrant = postFKPatten.exec(fk);
                // !! 坑
                postFKPatten.lastIndex = 0;
                const foreignKey = fKConstrant?.[1];
                columns.forEach((column) => {
                    if (foreignKey === column.name) {
                        column.foreignKey = true;
                        column.foreignKeyReference = fKConstrant?.[2] ?? null;
                    }
                });
            });
        }

        // 处理后置约束中的唯一键约束
        const postUniqueConstrant = ddl.match(postUniquePatten);
        if (postUniqueConstrant) {
            postUniqueConstrant.forEach((uni) => {
                const uniqueConstrant = postUniquePatten.exec(uni);
                postUniquePatten.lastIndex = 0;
                const keys = uniqueConstrant?.[3].split(/,\s+/) ?? [];
                columns.forEach((column) => {
                    if (keys.includes(column.name)) {
                        column.unique = true;
                        column.notNull = true;
                        if (uniqueConstrant?.[2]) {
                            // 说明设置了唯一键名
                            column.uniqueKeyName = uniqueConstrant[2];
                        }
                    }
                });
            });
        }
        return columns;
    }
    return [];
}

async function clear() {
    oldDdl.value = "";
    newDdl.value = "";
}
</script>

<template>
    <el-row>
        <el-button @click="compare" :disabled="!oldDdl || !newDdl">对比</el-button>
        <el-button @click="clear" :disabled="!oldDdl && !newDdl">清空</el-button>
    </el-row>
    <el-row :gutter="30">
        <el-col :span="12">
            <el-row><el-text class="label">旧：</el-text></el-row>
            <el-input v-model="oldDdl" type="textarea" autosize></el-input>
        </el-col>
        <el-col :span="12">
            <el-row><el-text class="label">新：</el-text></el-row>
            <el-input v-model="newDdl" type="textarea" autosize></el-input>
        </el-col>
    </el-row>
    <div v-for="table in tablesModify">
        <el-row><el-text class="readOnlyLabel">表名：{{ table.tableName }}</el-text></el-row>
        <div v-if="(table.addCols?.length ?? 0) > 0">
            <el-row><el-text class="readOnlyLabel">新增：</el-text></el-row>
            <el-row v-for="add in table.addCols" :gutter="20">
                <el-col :span="1">

                </el-col>
                <el-col :span="3" align="right">
                    <el-text class="readOnlyLabel">{{ add.columnName }}</el-text>
                </el-col>
                <el-col :span="20">
                    <el-text>{{ add.ddl.toLowerCase() }}</el-text>
                </el-col>
            </el-row>
        </div>
        <div v-if="(table.removeCols?.length ?? 0) > 0">
            <el-row><el-text class="readOnlyLabel">删除：</el-text></el-row>
            <el-row v-for="remove in table.removeCols" :gutter="20">
                <el-col :span="1">

                </el-col>
                <el-col :span="3" align="right">
                    <el-text class="readOnlyLabel">{{ remove.columnName }}</el-text>
                </el-col>
                <el-col :span="20">
                    <el-text>{{ remove.ddl.toLowerCase() }}</el-text>
                </el-col>
            </el-row>
        </div>
        <div v-if="(table.updateCols?.length ?? 0) > 0">
            <el-row><el-text class="readOnlyLabel">更新：</el-text></el-row>
            <el-row v-for="update in table.updateCols" :gutter="20">
                <el-col :span="1">

                </el-col>
                <el-col :span="3" align="right">
                    <el-text class="readOnlyLabel">{{ update.columnName }}</el-text>
                </el-col>
                <el-col :span="20">
                    <el-text>{{ update.ddl.toLowerCase() }}</el-text>
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

.readOnlyLabel {
    user-select: none;
}
</style>
