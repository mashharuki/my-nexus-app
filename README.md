新しい TanStack アプリへようこそ！

# はじめに

このアプリケーションを実行するには、次のコマンドを使用します。

```bash
bun install
bun run start
```

# 本番ビルド

本番環境向けにビルドするには、次を実行します。

```bash
bun run build
```

## テスト

このプロジェクトは [Vitest](https://vitest.dev/) をテストに使用します。テストは次のコマンドで実行できます。

```bash
bun run test
```

## スタイリング

このプロジェクトではスタイリングに [Tailwind CSS](https://tailwindcss.com/) を利用しています。

## Lint とフォーマット

このプロジェクトは lint とフォーマットに [eslint](https://eslint.org/) と [prettier](https://prettier.io/) を使用します。Eslint は [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint) を基に構成されています。利用できるスクリプトは次のとおりです。

```bash
bun run lint
bun run format
bun run check
```

## ルーティング

このプロジェクトは [TanStack Router](https://tanstack.com/router) を使用します。初期設定ではファイルベースのルーターになっており、`src/routes` 内のファイルとしてルートを管理します。

### ルートを追加する

新しいルートを追加したい場合は、`./src/routes` ディレクトリに新しいファイルを作成してください。

TanStack がルートファイルの内容を自動的に生成してくれます。

ルートが 2 つになったら、`Link` コンポーネントを使ってそれらの間を遷移できるようになります。

### リンクを追加する

SPA (Single Page Application) ナビゲーションを使うには、`@tanstack/react-router` から `Link` コンポーネントをインポートします。

```tsx
import { Link } from '@tanstack/react-router'
```

そのあと任意の JSX 内で次のように利用できます。

```tsx
<Link to="/about">About</Link>
```

これで `/about` ルートへ移動するリンクが生成されます。

`Link` コンポーネントの詳細は [ドキュメント](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent) を参照してください。

### レイアウトを使用する

ファイルベースルーティングのセットアップでは、レイアウトは `src/routes/__root.tsx` に配置されています。ここに追加した内容はすべてのルートで共有されます。ルート固有の内容は、JSX 内で `<Outlet />` コンポーネントを配置した位置に表示されます。

ヘッダーを含むレイアウトの例を以下に示します。

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

`<TanStackRouterDevtools />` コンポーネントは必須ではないので、レイアウトに含めたくない場合は削除して問題ありません。

レイアウトについて詳しくは [Layouts ドキュメント](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts) を参照してください。

## データ取得

アプリケーションでデータを取得する方法はいくつかあります。サーバーからの取得には TanStack Query を使えますし、TanStack Router に組み込まれている `loader` 機能を使えば、ルートを描画する前にデータを読み込むこともできます。

例を次に示します。

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json() as Promise<{
      results: {
        name: string
      }[]
    }>
  },
  component: () => {
    const data = peopleRoute.useLoaderData()
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    )
  },
})
```

ローダーを使うとデータ取得ロジックが大幅に簡略化されます。詳しくは [Loader ドキュメント](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters) を参照してください。

### React-Query

React-Query はルートローディングの補完や代替として優れた選択肢で、アプリへの組み込みも簡単です。

まず依存関係を追加します。

```bash
bun add @tanstack/react-query @tanstack/react-query-devtools
```

次にクエリクライアントとプロバイダーを作成します。これらは `main.tsx` に配置するのがおすすめです。

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ...

const queryClient = new QueryClient()

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
```

オプションとして、ルートルートに TanStack Query Devtools を追加することもできます。

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
})
```

これで `useQuery` を使ってデータを取得できるようになります。

```tsx
import { useQuery } from '@tanstack/react-query'

import './App.css'

function App() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  })

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

React-Query の詳しい使い方は [React-Query ドキュメント](https://tanstack.com/query/latest/docs/framework/react/overview) を参照してください。

## 状態管理

React アプリでよく求められる要件として、状態管理があります。React で状態管理を行う方法は多数ありますが、TanStack Store はプロジェクトの出発点として最適です。

まず TanStack Store を依存関係に追加します。

```bash
bun add @tanstack/store
```

次に `src/App.tsx` にシンプルなカウンターを作成してみましょう。

```tsx
import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

function App() {
  const count = useStore(countStore)
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  )
}

export default App
```

TanStack Store の利点のひとつは、既存の状態から派生状態を作成できる点です。派生状態は元の状態が更新されると自動的に更新されます。

次に、派生状態を使ってカウントを 2 倍にする例を確認します。

```tsx
import { useStore } from '@tanstack/react-store'
import { Store, Derived } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
})
doubledStore.mount()

function App() {
  const count = useStore(countStore)
  const doubledCount = useStore(doubledStore)

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  )
}

export default App
```

`Derived` クラスを使って他のストアから派生したストアを作成しています。`Derived` クラスの `mount` メソッドを呼び出すと、派生ストアの更新が開始されます。

派生ストアを作成したら、`useStore` フックを使って通常のストアと同じように `App` コンポーネントで利用できます。

TanStack Store の詳細は [TanStack Store ドキュメント](https://tanstack.com/store/latest) を参照してください。

# コンポーネント構成ガイド
## ディレクトリ概要
- `providers/Web3Provider.tsx` — Wagmi・RainbowKit・TanStack Query・NexusProvider をひとまとめにし、ウォレット接続やネットワーク選択状態をコンテキストとして供給します。
- `components/` — 画面に表示する機能的なコンポーネント群。`header.tsx` や `connect-wallet.tsx` などのアプリ専用 UI がまとまっています。
- `components/ui/` — Radix UI をラップした再利用可能なプレゼンテーション部品 (Button, Card, Dialog など)。Tailwind CSS のユーティリティを統一化したいときに利用します。
- `lib/utils.ts` — Tailwind のクラス結合を助ける `cn` ヘルパーを提供します。
- `routes/` — TanStack Router のファイルベースルート。`__root.tsx` がアプリ全体のラッパー、`index.tsx` がトップページ本体です。
- `routeTree.gen.ts` — ルーティング定義から自動生成されるファイルで、手動編集は不要です。

## レンダリングフロー
1. `src/main.tsx` が `createRouter` でルーターを組み立て、`RouterProvider` をレンダリングします。
2. ルート定義の `__root.tsx` が最上位で呼ばれ、`Web3Provider` を通して全体にウォレット/SDK の文脈を渡しつつ `Header` と子ルート (`Outlet`) を描画します。
3. `index.tsx` がトップページを構築し、ウォレット接続状態 (`useAccount`) を参照して Nexus 関連ウィジェットや案内を切り替えます。

## コアコンポーネントの役割
- `Header` — Avail ロゴと RainbowKit の `ConnectButton` を配置した最上部バー。
- `WalletConnection` — RainbowKit の接続状態を監視し、接続済みのウォレットを Nexus SDK に橋渡しします。切断時は SDK を初期化解除。
- `Nexus` — Bridge / Transfer / Swap / Bridge & Execute の各 Nexus ウィジェットをボタンでまとめ、必要に応じて SDK 初期化を走らせます。
- `ViewUnifiedBalance` — モーダルダイアログ内で `getUnifiedBalances` などの SDK API を呼び出し、チェーン別の資産内訳を表示します。
- `components/ui/*` — Tailwind と Radix を統合した薄いラッパー。スタイル一貫性を保ちながら他コンポーネントから利用します。

## カスタマイズのヒント
- 新しいチェーンやテーマを追加する場合は `Web3Provider.tsx` の `getDefaultConfig` や `RainbowKitProvider` の設定を変えます。
- Nexus ウィジェットの事前入力やボタン挙動は `Nexus` コンポーネントで制御できます。`wizardButtonClick` のロジックを拡張することで複数アクションを連鎖させることも可能です。
- Unified Balance に表示するフィルター条件や並び順は `ViewUnifiedBalance` 内で自由に書き換えられます。
- 再利用可能な UI 部品を増やしたい場合は `components/ui` に追加し、`cn` ヘルパーでクラス合成を行うと既存のスタイル体系に馴染みます。

# デモファイル

`demo` で始まるファイルは安全に削除できます。導入した機能を試すための出発点として用意されています。

# さらに学ぶ

TanStack が提供するすべてについては [TanStack ドキュメント](https://tanstack.com) を参照してください。
