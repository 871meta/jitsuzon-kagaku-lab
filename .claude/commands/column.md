---
description: 通常コラム（column-*）の新規作成スキル。原稿テキストを渡すとHTML記事を生成し、目次・アコーディオンUI・ダークラグジュアリーデザインで公開する。
argument-hint: [原稿テキスト or ファイルパス]
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent]
---

# /通常コラム ── 通常コラム記事の新規作成

ユーザーの指示: $ARGUMENTS

---

## 概要

「スペシャルコラム（作品分析記事）」ではない通常のコラム記事を作成するスキル。
正規テンプレート: `articles/column-session-body.html`

---

## 作成手順

### Step 1: 準備

1. ユーザーから原稿テキストを受け取る
2. 記事タイトル・サブタイトルを確認
3. ファイル名を決定: `articles/column-{slug}.html`
4. 正規テンプレートを読み込む: `articles/column-session-body.html`

### Step 2: 原稿を分析し構成を決める

原稿を読み、以下を判断する:

- **セクション分割**: 意味のまとまりでセクションに分ける
- **アコーディオンUI**: 長文（3000文字超目安）ならアコーディオンで畳む。短文なら不要
- **色分け**: Gold（WHAT/仕組み）/ Rose（WHY/理由）/ Purple（HOW/実践）の3色をセクションに割り当て
- **各セクションのタイトルとサブタイトル**: 番号（01〜）+ タイトル + 1行サブタイトル

ユーザーに構成案を提示し、承認を得てから実装に進む。

### Step 3: HTML作成

#### HEAD構成:
1. Google Analytics（gtag.js G-8XFLECHPE2）
2. `<meta charset="UTF-8">`
3. Favicon 3種（`../favicon-32x32.png` 等）
4. Canonical URL
5. Viewport, author
6. `<title>{記事タイトル}｜実存科学研究所</title>`
7. meta description
8. Google Fonts preload（非同期パターン + noscriptフォールバック）
9. `<style>` ページ固有CSS（グローバルstyle.min.cssは使わない。テンプレート準拠）

#### ページ固有CSS:
テンプレート（column-session-body.html）の `<style>` ブロックをベースにする。
アコーディオン使用時は以下を含める:
- `.article-acc` 系クラス（ヘッダー、ボディ、コンテンツ、アイコン）
- 3色バリアント: `.article-acc--gold`, `.article-acc--rose`, `.article-acc--purple`
- 番号バッジ: `.article-acc__num`
- 開閉アニメーション: `max-height` トランジション + `is-open` クラス

#### BODY構成:
```
<body>
  <!-- サイトヘッダー（../プレフィックスのナビ） -->
  <!-- テンプレートのナビをコピー -->

  <div class="container">
    <!-- ヘッダー -->
    <div class="header">
      パンくず: TOP > 記事一覧 > {記事タイトル}
      EXISTENTIAL SCIENCE RESEARCH INSTITUTE
      カテゴリタグ: コラム
      <h1 class="hero-title--shimmer">{タイトル}</h1>
      サブタイトル
      著者 | 実存科学研究所
    </div>

    <hr>

    <!-- pull-quote（冒頭の印象的な一文） -->
    <div class="pull-quote fade-in">
      <p>{キャッチコピー}</p>
    </div>

    <!-- 目次（アコーディオン使用時） -->
    <div class="article-acc fade-in">
      01 {タイトル} ... +
      02 {タイトル} ... +
      ...
    </div>

    <!-- 締め -->
    <div class="highlight-block fade-in">
      <p><strong>{まとめの一文}</strong></p>
    </div>

    <!-- CTA -->
    <section class="cta-block fade-in">...</section>

    <!-- 参考文献（あれば） -->
    <!-- ナビフッター -->
  </div>

  <!-- サイトフッター -->
  <!-- アコーディオンJS（インライン） -->
  <!-- 検索モーダル -->
  <!-- main.min.js -->
</body>
```

### Step 4: テキスト編集ルール

#### sp-only方針（最重要）
- **デフォルトは「入れない」**。自然な折り返しに任せる
- 鍵括弧リスト（「X」「Y」「Z」を1行ずつ並べたい場合）だけ `<br class="sp-only">` を使う
- 句読点（、。）や助詞の後にsp-onlyを入れてはいけない
- 文章を短く刻んではいけない。散文は散文として流す

#### 通常の改行 `<br>`
- 明確に改行したい箇所にのみ使う（例: 詩的な対比構造）
- 「Aした。Bした。Cした。」のような並列を意図的に1行ずつ見せたい場合

#### 段落 `<p>`
- 意味のまとまりで段落を分ける
- 1段落が長すぎる場合は句点で分割

#### テキスト保全
- 原稿のテキストは勝手に変えない。構成・配置は変えてよいが、文言の変更はユーザーに確認する

### Step 5: 登録作業

1. **archives.html** にリンク追加
2. **sitemap.xml** に `<url>` 追加
3. **js/search-index.json** にエントリ追加

### Step 6: 最終チェックリスト

- [ ] h1に `hero-title--shimmer` クラスがある
- [ ] pull-quoteがある（パープルシマー）
- [ ] 目次がある（アコーディオン使用時）
- [ ] CTA統一ブロックがある
- [ ] sp-onlyは鍵括弧リストのみ（句読点後のsp-onlyがない）
- [ ] パンくず: TOP > 記事一覧 > 記事タイトル
- [ ] canonical URL が正しい
- [ ] meta description がある
- [ ] Google Fonts が preload 非同期パターン
- [ ] ナビ・フッターのパスが `../` プレフィックス
- [ ] 罫線が `──`（U+2500）
- [ ] archives.html にリンク追加済み
- [ ] sitemap.xml に追加済み
- [ ] search-index.json に追加済み
- [ ] `git push` 済み

---

## アコーディオンJS（コピペ用）

```javascript
document.querySelectorAll('.article-acc__header').forEach(function(header){
  header.addEventListener('click',function(){
    var item=this.parentElement;
    var body=item.querySelector('.article-acc__body');
    var content=body.querySelector('.article-acc__content');
    var isOpen=item.classList.contains('is-open');
    this.setAttribute('aria-expanded',!isOpen);
    if(isOpen){ body.style.maxHeight='0'; item.classList.remove('is-open'); }
    else{ body.style.maxHeight=content.scrollHeight+'px'; item.classList.add('is-open'); }
  });
});
```

---

## CTA統一ブロック（コピペ用）

```html
<section class="cta-block fade-in">
  <div class="container">
    <h2 class="cta-block__title">天命の言語化セッション&trade;</h2>
    <p class="cta-block__desc">2時間で天命が言語化できる場所。</p>
    <div class="cta-block__features">
      <span class="cta-block__feature">Zoom完結</span>
      <span class="cta-block__feature">事前学習不要</span>
      <span class="cta-block__feature">対話のみ</span>
    </div>
    <a href="../trial.html" class="btn">無料トライアルに申し込む &rarr;</a>
  </div>
</section>
```

---

## 注意事項

- **テンプレートを必ず読んでから作業する**: `articles/column-session-body.html` の実際のCSS・HTML構造を確認
- **推測で作らない**: CSSの値、クラス名、構造はテンプレートから取る
- **pushまで完了する**: 変更後は確認なしで `git push`
- **日本語編集はPython経由**: Edit toolは日本語で文字化けするため、`python3` スクリプトで編集する
