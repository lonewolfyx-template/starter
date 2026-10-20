# Giget Template Registry

English | [简体中文](./README_ZH.md)

A Zod-based JSON Schema generator for template registry entries used with [giget](https://github.com/unjs/giget).

The registry entry format is defined in [`src/index.ts`](./src/index.ts). It includes template metadata and the URLs giget needs to download a template. Each entry lives in `templates/<slug>.json`; for example, the `starter-ts` slug resolves to `templates/starter-ts.json`.

## Generate the JSON Schema

Install dependencies from the project root:

```bash
pnpm install
```

Generate the schema once:

```bash
pnpm exec tsx src/index.ts
```

Or regenerate it automatically when the source changes:

```bash
pnpm dev
```

The generator converts `registrySchema` with `z.toJSONSchema()` and writes `schema.json` to the current working directory, replacing any existing file. The output uses two-space indentation and a trailing newline. Run these commands from the project root so template entries can reference `../schema.json`.

This command generates the schema only; it does not create, validate, or publish template entries. If generation fails, it logs the error and sets a nonzero exit code.

### Schema Target

The source currently specifies `target: 'draft-2026-10'`. This is not a built-in target in the installed Zod version, and the generated schema does not include a root-level `$schema` dialect declaration. To emit a declared dialect, update the target in `src/index.ts` to a supported value such as `draft-2020-12` and regenerate the file.

## Registry Entry Fields

The following requirements come from this project's `registrySchema`. They include additional required metadata beyond giget's minimum `name` and `tar` fields.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `$schema` | `string` | No | Schema location for editor completion and validation; supports relative paths and must be non-empty when present |
| `name` | `string` | Yes | Template name; can differ from the registry filename |
| `description` | `string` | Yes | Description of the template |
| `tar` | URL string | Yes | Download URL for the template's `.tar.gz` archive |
| `url` | URL string | Yes | Template repository or information page |
| `version` | `string` | No | Template version identifier |
| `repo` | `string` | Yes | GitHub repository identifier, for example `lonewolfyx-template/starter` |
| `defaultDir` | `string` | Yes | Default destination directory name |

`tar` and `url` use Zod's URL validation. The other required fields use plain `z.string()`: they must be present but may be empty. The schema does not enforce an `owner/repository` format for `repo` or semantic versioning for `version`.

The definition uses `z.looseObject()`, so additional properties are accepted and preserved without field-specific validation. Changing `repo` or `version` does not update `tar`; set the download URL explicitly when switching repositories, branches, or tags.

## Register a Template

Create or edit `templates/<slug>.json` using the following structure. This example describes the `main` branch of `lonewolfyx-template/starter-ts`:

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

The entry's optional `$schema` field points editors to the generated schema; it is separate from the schema document's own dialect declaration. Giget does not use this field to validate registry entries.

## Use the Registry

Once registry entries are available over HTTP(S), giget resolves templates at `<registry>/<slug>.json`. Before using the GitHub Raw URLs below, commit and push `schema.json` and the template entries to `main`.

### Available Templates

The [`templates` directory listing](https://api.github.com/repos/lonewolfyx-template/starter/contents/templates?ref=main) currently exposes these templates:

| Slug | Description | Default directory |
| --- | --- | --- |
| `starter-ts` | TypeScript library starter | `starter-ts` |
| `starter-cli` | Node.js CLI starter | `starter-cli` |

The filename without `.json` is the slug passed to giget. The GitHub Contents API link above is the source of truth for the templates currently published from `main`.

### Create a Project

For private repositories, set the `GIGET_AUTH` environment variable to a GitHub token with repository read access. Fine-grained tokens need read access to Contents and Metadata. Giget uses the token to fetch registry entries and download archives; do not store it in registry JSON files.

Create a TypeScript library in its default `starter-ts` directory:

```bash
GIGET_REGISTRY=https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates \
  pnpm dlx giget starter-ts
```

Pass a destination to override the template's `defaultDir`:

```bash
GIGET_REGISTRY=https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates \
  pnpm dlx giget starter-ts my-typescript-library
```

Create a Node.js CLI project:

```bash
GIGET_REGISTRY=https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates \
  pnpm dlx giget starter-cli my-cli
```

Set `GIGET_REGISTRY` to the directory URL without a trailing `/`. You can also use a registry entry URL directly, without setting the environment variable:

```bash
pnpm dlx giget https://raw.githubusercontent.com/lonewolfyx-template/starter/main/templates/starter-cli.json my-cli
```

Omit the destination argument to use `defaultDir`. To register another template, copy the example to `templates/<new-slug>.json` and update its fields.

References: [Template registry documentation](https://github.com/unjs/giget#template-registry), [template types](https://github.com/unjs/giget/blob/main/src/types.ts), and [private repository authentication](https://github.com/unjs/giget#providing-token-for-private-repositories).
