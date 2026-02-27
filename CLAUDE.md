# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

広告キャンペーン管理のデモアプリ。MCP（Model Context Protocol）を使ってClaudeからキャンペーンデータを操作・分析できるインタラクティブUIを提供する。

## コマンド

```bash
# セットアップ
pnpm install

# 開発（全パッケージ並列起動: API:8787, MCP:8788, UI:5173）
pnpm dev

# 個別起動
pnpm dev:api          # API のみ
pnpm dev:mcp          # MCP server のみ
pnpm dev:ui           # UI のみ

# ビルド（UI → single HTML → MCP serverに埋め込み）
pnpm build

# コード品質
pnpm check            # Biome チェック
pnpm check:fix        # Biome 自動修正
pnpm format           # フォーマット
pnpm lint             # リント
pnpm knip             # 未使用コード検出
pnpm typecheck        # 全パッケージの型チェック
```

## アーキテクチャ

pnpmモノレポ（3パッケージ）。デプロイ先はCloudflare Workers。

```
Claude (MCP Client)
    │ HTTP
    ▼
@mcp-ui-demo/mcp-server (:8788)    ← MCPツール・UIリソース提供
    │ HTTP fetch
    ▼
@mcp-ui-demo/api (:8787)           ← Hono REST API（キャンペーンCRUD）
    │
    ▼
Mock Campaign Data (25件)
```

- **packages/api** — Hono製REST API。`GET /api/campaigns` でフィルタ（platform, status, search）付きキャンペーン取得。モックデータ使用。
- **packages/mcp-server** — MCP SDK + Hono。`list_campaigns`ツールと`ui://campaigns/list`リソースを登録。UIのHTMLをビルド時に埋め込む（`src/ui/html.ts`は自動生成・git除外）。
- **packages/ui** — React 19 + Tailwind CSS 4 + Radix UI/shadcn。Viteでビルドし`vite-plugin-singlefile`で単一HTMLに。`@modelcontextprotocol/ext-apps`のReact hooksでMCPクライアントとして動作。

### ビルドパイプライン

1. `pnpm build:ui` — Viteがuiパッケージを`dist/index.html`（単一ファイル）にビルド
2. `pnpm build` — `embed-ui.mjs`が上記HTMLを読み取り`mcp-server/src/ui/html.ts`を生成

## コード規約

- **Biome** — フォーマッタ兼リンター。タブインデント、行幅100、シングルクォート、セミコロンなし
- **TypeScript** — strict、`noUnusedLocals`/`noUnusedParameters`有効
- **未使用import** — Biomeで`error`レベル（コミット時にpre-commitフックで検出）
- **UIテキスト** — 日本語
