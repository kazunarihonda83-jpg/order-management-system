# 受発注管理システム

完全な受発注管理システム - フロントエンド（React + Vite）とバックエンド（Node.js + Express + SQLite）

## 🚀 クイックスタート

### ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーを起動（フロントエンド）
npm run dev

# バックエンドサーバーを起動（別ターミナル）
npm run server
```

### ログイン情報
- **ユーザー名**: `admin`
- **パスワード**: `admin123`

## 📦 デプロイ

### 最速デプロイ（推奨）：Railway

```bash
# 1. GitHubにプッシュ
git add -A
git commit -m "Ready for deployment"
git push origin main

# 2. https://railway.app でログイン
# 3. "Deploy from GitHub repo" を選択
# 4. 完了！
```

詳細は [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) を参照してください。

### その他のオプション

- **Vercel（フロントエンド）**: 詳細は [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **複数の選択肢**: 詳細は [DEPLOYMENT_OPTIONS.md](./DEPLOYMENT_OPTIONS.md)

## 🎯 主要機能

### 1. ダッシュボード
- 統計情報の表示
- 今月の収支サマリー
- 最近の書類・発注一覧

### 2. 顧客管理
- 顧客情報のCRUD操作
- 検索機能
- 法人/個人の管理

### 3. 書類管理
- 見積書・発注書・納品書・請求書の作成
- 自動税額計算
- 編集・削除機能
- 書類番号の自動生成

### 4. 仕入先管理
- 仕入先情報の完全管理
- 連絡先情報の管理

### 5. 発注管理
- 発注書の作成・編集
- ステータス管理
- 自動計算機能

### 6. 会計帳簿
- ダッシュボード（収益・費用・純利益・利益率）
- 仕訳帳（CRUD、CSV出力）
- 試算表（CSV出力）
- 損益計算書
- 貸借対照表
- 日付範囲フィルター

## 🛠 技術スタック

### フロントエンド
- **React 18.3** - UIライブラリ
- **React Router 6** - ルーティング
- **Vite 5** - ビルドツール
- **Lucide React** - アイコン
- **Axios** - HTTP クライアント

### バックエンド
- **Node.js** - ランタイム
- **Express 4** - Webフレームワーク
- **SQLite3** - データベース
- **JWT** - 認証
- **bcryptjs** - パスワードハッシュ化

## 📁 プロジェクト構造

```
order-management-system/
├── src/                    # フロントエンドソース
│   ├── components/         # Reactコンポーネント
│   ├── contexts/           # React Context
│   ├── pages/              # ページコンポーネント
│   ├── utils/              # ユーティリティ
│   └── index.css           # グローバルスタイル
├── server/                 # バックエンドソース
│   ├── routes/             # APIルート
│   ├── database.js         # データベース設定
│   └── index.js            # サーバーエントリーポイント
├── public/                 # 静的ファイル
├── dist/                   # ビルド出力（自動生成）
├── vercel.json             # Vercel設定
├── railway.json            # Railway設定
├── render.yaml             # Render設定
└── package.json            # 依存関係とスクリプト
```

## 🎨 UIデザイン

- **カラーパレット**: シンプルな白とグレー
- **アクセントカラー**: 
  - 収益: ブルー (#2196f3)
  - 費用: レッド (#f44336)
  - 利益: グリーン (#4caf50)
  - 損失: オレンジ (#ff9800)
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **通貨表記**: 日本円（¥）

## 🔒 セキュリティ

- JWTトークンベースの認証
- bcryptによるパスワードハッシュ化
- CORS設定
- 環境変数による機密情報管理

## 📊 データベース

SQLiteデータベースを使用（`order_management.db`）

### テーブル
- administrators - 管理者
- customers - 顧客
- customer_contacts - 顧客連絡先
- documents - 書類
- document_items - 書類明細
- suppliers - 仕入先
- supplier_contacts - 仕入先連絡先
- purchase_orders - 発注書
- purchase_order_items - 発注明細
- accounts - 勘定科目
- journal_entries - 仕訳帳
- operation_history - 操作履歴

## 🌐 API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - ユーザー情報取得

### 顧客
- `GET /api/customers` - 顧客一覧
- `POST /api/customers` - 顧客作成
- `PUT /api/customers/:id` - 顧客更新
- `DELETE /api/customers/:id` - 顧客削除

### 書類
- `GET /api/documents` - 書類一覧
- `GET /api/documents/:id` - 書類詳細
- `POST /api/documents` - 書類作成
- `PUT /api/documents/:id` - 書類更新
- `DELETE /api/documents/:id` - 書類削除

### 仕入先
- `GET /api/suppliers` - 仕入先一覧
- `POST /api/suppliers` - 仕入先作成
- `PUT /api/suppliers/:id` - 仕入先更新
- `DELETE /api/suppliers/:id` - 仕入先削除

### 発注
- `GET /api/purchases/orders` - 発注一覧
- `GET /api/purchases/orders/:id` - 発注詳細
- `POST /api/purchases/orders` - 発注作成
- `PUT /api/purchases/orders/:id` - 発注更新
- `DELETE /api/purchases/orders/:id` - 発注削除

### 会計
- `GET /api/accounting/accounts` - 勘定科目一覧
- `GET /api/accounting/journal` - 仕訳帳一覧
- `POST /api/accounting/journal` - 仕訳登録
- `DELETE /api/accounting/journal/:id` - 仕訳削除
- `GET /api/accounting/trial-balance` - 試算表
- `GET /api/accounting/profit-loss` - 損益計算書
- `GET /api/accounting/balance-sheet` - 貸借対照表

## 🔧 開発

### 環境変数

`.env` ファイルを作成:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

### ビルド

```bash
# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

## 📝 ライセンス

MIT License

## 👥 サポート

問題が発生した場合は、以下のドキュメントを参照してください：

- [クイックデプロイガイド](./QUICK_DEPLOY.md)
- [Vercelデプロイガイド](./VERCEL_DEPLOYMENT.md)
- [デプロイオプション全体](./DEPLOYMENT_OPTIONS.md)
- [UI改善サマリー](./UPDATE_SUMMARY.md)

---

**最終更新**: 2025-12-02
**バージョン**: 1.0.0
