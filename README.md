# draken-player

## 環境構築

```sh
# 依存パッケージをインストール
yarn

# コンテンツIDを設定
# src/main.tsとdemo.htmlで参照
# buildにはこの値は出力されない
cp ./.env.development{,.local}
vi ./.env.development.local # 実際に使うコンテンツIDを入力
```

## 開発環境

```sh
yarn dev
```

## ビルド

```sh
# endpointを固定の値に埋め込みたい場合は編集する
cp ./.env.production{,.local}
vi ./.env.production.local
yarn build
```

## デモ(ビルドした後の js で確認する場合)

```sh
yarn build:browser
vi ./demo.html # コンテンツIDやendpointなどを編集する
# yarn add global http-server
http-server
open http://localhost:8080/demo.html
```
