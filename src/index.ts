import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'

const registrySchema = z.looseObject({
  $schema: z.string().min(1).optional().describe('供编辑器使用的 JSON Schema 地址，支持相对路径'),
  name: z.string().describe('模板名称'),
  description: z.string().describe('模板描述'),
  tar: z.url().describe('模板 tar.gz 压缩包的下载地址'),
  url: z.url().describe('模板仓库或介绍页面的地址'),
  version: z.string().optional().describe('模板版本标识'),
  repo: z.string().describe('模板 Github 仓库名称'),
  defaultDir: z.string().describe('模板默认克隆文件夹名称'),
}).meta({
  title: 'Giget Template Registry Entry',
  description: 'giget 自定义注册表中的单个模板定义',
})

async function main(): Promise<void> {
  const jsonSchema = z.toJSONSchema(registrySchema, {
    target: 'draft-2026-10',
  })
  const outputPath = resolve(process.cwd(), 'schema.json')

  await writeFile(outputPath, `${JSON.stringify(jsonSchema, null, 2)}\n`, 'utf8')

  console.log(`Schema generated at: ${outputPath}`)
}

main().catch((error: unknown) => {
  console.error('Failed to generate schema:', error)
  process.exitCode = 1
})
