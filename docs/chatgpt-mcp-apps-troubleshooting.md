# ChatGPT MCP Apps UI 表示問題のトラブルシューティング

## 概要

ChatGPTでMCP Apps UIを表示した際に発生した2つの問題と、その原因・対応をまとめる。

---

## 問題1: iframeが黄色い画面のまま何も表示されない

### 症状

ChatGPTでツールを呼び出すと、iframe内が黄色い背景だけで、スピナーやテキストが一切見えない。

### 原因

`packages/ui/index.html` にデバッグ用の `boot-diag` div が残っていた。

```html
<div id="boot-diag" style="padding:12px;background:#fffbe6;border:1px solid #e6c300;margin:8px;">
  ✓ HTML loaded
</div>
```

ChatGPTのiframeは高さが制限されており、この黄色背景のdivが表示可能領域を占有し、その下のReactコンテンツ（`#app`）がスクロール外に押し出されていた。

### 対応

- `index.html` から `boot-diag` div と関連スクリプトを削除
- `main.tsx` から `boot-diag` への参照を削除
- `#app` をbody直下の最初の要素にした

### 教訓

ChatGPTのiframeは高さが厳しく制限される。デバッグ用の要素を入れる場合は、メインコンテンツの表示領域を圧迫しないよう注意する。

---

## 問題2: 「キャンペーンデータを取得中...」のまま変化しない

### 症状

iframe内にスピナーと「キャンペーンデータを取得中...」が表示されるが、データが到着せずUIが進まない。Claudeでは正常に動作する。

### 原因

元のコードは `ontoolresult` コールバック（ホストからのプッシュ通知）のみに依存していた。

```tsx
app.ontoolresult = (params) => {
  // データをパースしてstateにセット
}
```

ChatGPTでは以下のいずれかの理由で `ontoolresult` が発火しなかった:

- ChatGPTが `ui/notifications/tool-result` 通知をiframeに送信していない
- SDKの `PostMessageTransport` 内の `JSONRPCMessageSchema.safeParse()` でメッセージが落とされている
- `event.source` チェック（`event.source !== window.parent`）でフィルタされている

### 対応

3段階のデータ取得メカニズムを実装し、どの環境でも動くようにした。

#### 1. `callServerTool`（メイン・ChatGPT対応）

接続完了後にUIから能動的にツールを呼び出してデータを取得する。

```tsx
useEffect(() => {
  if (!app || !isConnected) return
  app.callServerTool({ name: 'list_campaigns', arguments: {} })
    .then((result) => { /* parse & setCampaigns */ })
    .catch(() => {})
}, [app, isConnected])
```

#### 2. `ontoolresult` コールバック（Claude互換）

`onAppCreated` で接続前にハンドラを登録し、通知の取りこぼしを防止。

```tsx
const { app, isConnected } = useApp({
  onAppCreated: (createdApp) => {
    createdApp.ontoolresult = (params) => { /* parse & setCampaigns */ }
  },
})
```

#### 3. 直接postMessageパーシング（SDKバイパス・フォールバック）

SDKの `PostMessageTransport` を迂回し、`window.addEventListener('message')` で `tool-result` 通知を直接キャプチャする。

```tsx
useEffect(() => {
  const handler = (event: MessageEvent) => {
    const data = event.data
    if (data?.method === 'ui/notifications/tool-result' && data.params) {
      handleToolResult(data.params)
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}, [])
```

### パース処理

`packages/ui/src/lib/parse-campaigns.ts` の共通ユーティリティを使用:

- `extractTextFromContent()` — content配列/オブジェクト/文字列からテキストを抽出
- `parseCampaigns()` — JSON文字列・配列・`{campaigns: [...]}` 形式・二重エンコードに対応

### 教訓

MCP Apps UIを複数ホスト（Claude, ChatGPT等）で動かす場合:

- **`ontoolresult` だけに依存しない** — ホストごとに通知の挙動が異なる
- **`callServerTool` を能動的に使う** — プッシュを待つのではなくプルで取りに行く
- **SDKバイパスのフォールバックを用意する** — SDKのtransport層でメッセージが落ちるケースがある

---

## 関連ファイル

| ファイル | 役割 |
|---|---|
| `packages/ui/index.html` | UIのHTMLテンプレート |
| `packages/ui/src/main.tsx` | Reactエントリポイント |
| `packages/ui/src/app.tsx` | メインアプリコンポーネント（データ取得ロジック） |
| `packages/ui/src/lib/parse-campaigns.ts` | ツール結果のパースユーティリティ |

## ビルド・デプロイ手順

```bash
pnpm build  # UI → single HTML → MCP serverに埋め込み
```

ビルド後、MCPサーバーを再起動（またはChatGPTで新規チャットを開始）して反映を確認する。
