import type { z } from 'zod'
import type { registrySchema } from '@/index.ts'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

async function createDemoTemplate(): Promise<void> {
  const demo = {
    $schema: '../schema.json',
    name: 'template name',
    description: 'template description',
    tar: 'https://codeload.github.com/{owner/repo}/tar.gz/refs/heads/{branch name}',
    url: 'https://example.com/template',
    version: '0.0.0',
    repo: 'https://github.com/{owner/repo}',
    defaultDir: '{template name}',
  } as z.infer<typeof registrySchema>

  await writeFile(resolve(process.cwd(), 'templates/demo.json'), JSON.stringify(demo, null, 2), 'utf-8')
}

createDemoTemplate()
  .catch((error: unknown) => {
    console.log(error)
    process.exit(1)
  })
