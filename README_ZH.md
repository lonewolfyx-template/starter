# Giget 模板注册表

[English](./README.md) | 简体中文

基于 Zod 的 JSON Schema 生成器，用于定义 [giget](https://github.com/unjs/giget) 模板注册文件的结构。

注册文件的格式定义在 [`src/index.ts`](./src/index.ts) 中，包含模板元数据及 giget 下载模板所需的地址。每个模板对应一份 `templates/<模板标识>.json` 文件，例如，`starter-ts` 对应 `templates/starter-ts.json`。

## 生成 JSON Schema

在项目根目录安装依赖：

```bash
pnpm install
```

执行一次生成：

```bash
pnpm exec tsx src/index.ts
```

也可以监听源码变化并自动重新生成：

```bash
pnpm dev
```

生成器通过 `z.toJSONSchema()` 转换 `registrySchema`，将结果写入当前工作目录下的 `schema.json`，覆盖已有文件。输出使用两空格缩进，并以换行结尾。请在项目根目录执行命令，以便模板注册文件通过 `../schema.json` 引用生成结果。

该命令仅生成 Schema，不会创建、校验或发布模板注册文件。生成失败时会输出错误，并设置非零退出码。

### Schema 目标版本

当前源码指定了 `target: 'draft-2026-10'`。它不是已安装 Zod 版本的内置目标，因此生成的 Schema 不包含根级 `$schema` 版本声明。如需输出带有明确版本声明的 Schema，请将 `src/index.ts` 中的目标改为受支持的值，例如 `draft-2020-12`，然后重新生成。

## 注册文件字段

以下要求来自本项目的 `registrySchema`。除 giget 最低要求的 `name` 和 `tar` 外，本项目还要求提供其他模板元数据。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `$schema` | `string` | 否 | 供编辑器补全和校验使用的 Schema 地址；支持相对路径，提供时必须为非空字符串 |
| `name` | `string` | 是 | 模板名称，可以与注册文件名不同 |
| `description` | `string` | 是 | 模板描述 |
| `tar` | URL 字符串 | 是 | 模板 `.tar.gz` 压缩包的下载地址 |
| `url` | URL 字符串 | 是 | 模板仓库或介绍页面的地址 |
| `version` | `string` | 否 | 模板版本标识 |
| `repo` | `string` | 是 | GitHub 仓库标识，例如 `lonewolfyx-template/starter` |
| `defaultDir` | `string` | 是 | 默认创建的目标目录名称 |

`tar` 和 `url` 使用 Zod 的 URL 校验。其余必填字段使用普通的 `z.string()`：字段必须存在，但允许空字符串。Schema 不会强制检查 `repo` 是否符合 `owner/repository` 格式，也不会检查 `version` 是否符合语义化版本规范。

定义使用 `z.looseObject()`，因此允许并保留额外属性，但不会针对这些属性执行专门的字段校验。修改 `repo` 或 `version` 不会自动更新 `tar`；切换仓库、分支或标签时，需要显式修改下载地址。

## 注册模板

按以下结构创建或编辑 `templates/<模板标识>.json`。示例描述的是 `lonewolfyx-template/starter-ts` 仓库的 `main` 分支：

```json
{
  "$schema": "../schema.json",
  "name": "starter ts",
  "description": "Starter template for TypeScript library",
  "tar": "https://codeload.github.com/lonewolfyx-template/starter-ts/tar.gz/refs/heads/main",
  "url": "https://github.com/lonewolfyx-template/starter-ts",
  "repo": "lonewolfyx-template/starter-ts",
  "defaultDir": "starter-ts"
}
```

注册文件中可选的 `$schema` 字段用于让编辑器找到生成的 Schema，与 Schema 文档自身的版本声明是两个不同的概念。giget 不使用该字段校验注册文件。

## 使用注册表

将注册文件发布到可访问的 HTTP(S) 地址后，giget 会按 `<registry>/<模板标识>.json` 获取模板定义。以下 GitHub Raw 地址需要先将本地的 `schema.json` 和模板注册文件提交并推送到 `main` 才会生效。

### 可用模板

[`templates` 目录清单](https://api.github.com/repos/lonewolfyx-template/starter/contents/templates?ref=main) 当前包含以下模板：

| 模板标识 | 说明 | 默认目录 |
| --- | --- | --- |
| `starter-ts` | TypeScript 库起始模板 | `starter-ts` |
| `starter-cli` | Node.js CLI 起始模板 | `starter-cli` |

文件名去掉 `.json` 后即为传给 giget 的模板标识。上方的 GitHub Contents API 链接是 `main` 分支当前已发布模板的清单来源。

### 创建项目

对于私有仓库，需要在环境变量 `GIGET_AUTH` 中设置具有仓库读取权限的 GitHub token。使用 Fine-grained token 时，需要 Contents 和 Metadata 的读取权限。giget 会将它用于获取注册文件和下载压缩包；不要将 token 写入注册 JSON。

使用默认目录 `starter-ts` 创建 TypeScript 库项目：

```bash
GIGET_REGISTRY=https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates \
  pnpm dlx giget starter-ts
```

传入目标目录可以覆盖模板的 `defaultDir`：

```bash
GIGET_REGISTRY=https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates \
  pnpm dlx giget starter-ts my-typescript-library
```

创建 Node.js CLI 项目：

```bash
GIGET_REGISTRY=https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates \
  pnpm dlx giget starter-cli my-cli
```

`GIGET_REGISTRY` 填写目录地址，不带末尾 `/`。也可以直接使用注册文件 URL，无需设置环境变量：

```bash
pnpm dlx giget https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates/starter-cli.json my-cli
```

省略目标目录参数时使用 `defaultDir`。添加其他模板时，复制示例为 `templates/<新的模板标识>.json` 并修改相应字段即可。

参考：[官方注册表说明](https://github.com/unjs/giget#template-registry)、[模板类型](https://github.com/unjs/giget/blob/main/src/types.ts)、[私有仓库认证](https://github.com/unjs/giget#providing-token-for-private-repositories)。
