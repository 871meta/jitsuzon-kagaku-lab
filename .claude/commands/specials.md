---
description: 実存科学研究所サイトの万能スキル。スペシャルコラムの新規作成・編集、サイトデザイン変更、ページ追加・修正──サイトに関するあらゆる作業を受け付ける。「/specials」で起動。原稿を渡せば記事をHTML化し、デザイン指示を出せばダークラグジュアリー美学で実装する。
argument-hint: [原稿テキスト or ファイルパス or 作業指示]
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent]
---

# /specials ── 実存科学研究所サイト 万能スキル

ユーザーの指示: $ARGUMENTS

---

## このスキルでできること

1. **スペシャルコラム新規作成** ── 原稿を渡すだけでHTML記事を生成・公開
2. **既存記事の編集・ルール適用** ── 8つの編集ルールを適用
3. **サイトデザイン変更** ── ページのレイアウト・デザイン修正
4. **新規ページ追加** ── ダークラグジュアリー美学に従って作成
5. **サイト全体の一括修正** ── ナビ・フッター・CSS変更の全ファイル展開

指示内容に応じて自動判定する。

---

# Part A: スペシャルコラム

「キャラクターのMeta ── 自由意志なき世界の天命論」シリーズのHTML記事を作成・編集する。
ナウシカ篇（nausicaa.html）を正規テンプレートとする。

---

## 8つの編集ルール（必ず全て適用）

1. **h1ゴールドシマー** ── `<h1 class="hero-title--shimmer">` で金色に輝かせる
2. **さん付けはセッション対話内のみ** ── 対話外（分析テキスト）では呼び捨て。対話内のみ「さん」付け
3. **CTA統一ブロック** ── 下記の統一HTMLを使用（記事中盤＋記事末尾の2箇所）
4. **セッション見出し統一** ── 「天命の言語化セッション™︎」に統一
5. **クライアント側スピーカー名を紫に** ── `#b8a0d8`（箭内はゴールド `var(--color-gold)`）
6. **段落100文字制限** ── 対話外の本文段落が100文字超なら句点で分割（セッション対話は除く）
7. **フェーズマーカー禁止** ── `.session-phase` は使わない。あれば削除
8. **blockquote引用** ── 作品のセリフ引用は `<blockquote><p>` で囲む。`<main>` に `article-page` クラス必須

---

## 新規記事の作成手順

### Step 1: 準備

1. ユーザーから原稿テキストを受け取る
2. 作品名・キャラクター名・シリーズslug・英語タイトルを確認
3. ディレクトリ確認: `articles/tenmei-{slug}/` が存在するか

### Step 2: テンプレートを読み込む

正規テンプレートを読む:
```
articles/tenmei-nausicaa/nausicaa.html
```

### Step 3: HTMLファイル作成

ファイルパス: `articles/tenmei-{slug}/{character}.html`

#### HEAD構成（この順序で）:
1. Google Analytics（gtag.js G-8XFLECHPE2）
2. `<meta charset="UTF-8">`
3. Favicon 3種（`../../favicon-32x32.png` 等）
4. Canonical URL
5. Viewport
6. `<title>{キャラ名}のMeta ── 自由意志なき世界の天命論 | 実存科学研究所</title>`
7. meta description
8. OG tags（og:type="article", og:image="ogp-b.png"）
9. twitter:card
10. Google Fonts preload（非同期パターン）
11. `<link rel="stylesheet" href="../../css/style.min.css?v=27">`
12. `<style>` ページ固有CSS

#### ページ固有CSS（必須）:
- `h2.chapter-heading` ── 中央揃え、`::before`（金ライン上）、`::after`（金グラデーション下）
- `.chapter-number` ── Cormorant Garamond, uppercase, letter-spacing 0.35em, 金色
- `hr` ── グラデーション＋ダイヤモンド（◆）装飾
- `.session-dialogue` ── max-width 680px, 暗い背景, "SESSION" ラベル
- `.speaker-yanai` ── 金色 `var(--color-gold)`, font-weight 600
- `.speaker-{character}` ── 紫 `#b8a0d8`, font-weight 600
- `.line-yanai` ── 金色左ボーダー 2px
- `.line-character` ── margin-left 1.4rem
- `.silence` ── イタリック、中央揃え、装飾ライン
- `.highlight-block` ── 金色左ボーダーグラデーション、薄い金背景
- `h3.section-heading` ── 金色左ボーダー
- `.profiling-block` ── 暗い背景、ブラー、金色トップグラデーション
- `.author-block`, `.source-note`, `.series-note`
- レスポンシブ（600px, 480px）

#### BODY構成:
```html
<body>
  <!-- ヘッダー（../../ プレフィックスのナビ） -->
  <header class="site-header"> ... </header>
  <div class="reading-progress"></div>

  <!-- ヒーロー -->
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb">
        TOP > Specials > {作品名}篇 > {キャラ名}のMeta
      </nav>
      <p class="page-hero__sub">{English Title}</p>
      <h1 class="hero-title--shimmer">{キャラ名}のMeta</h1>
      <p class="page-hero__lead">
        自由意志なき世界の天命論<br>箭内宏紀｜実存科学研究所
      </p>
    </div>
  </section>

  <!-- 本文 -->
  <main class="container article-page">

    [ネタバレ注意]

    [導入セクション]
    <hr>

    [シャドウ・プロファイリング]
      h2.chapter-heading > span.chapter-number "Profiling"
      .profiling-block × 複数（Meta / Shadow / 天命転換点）
    <hr>

    [セッションへの橋渡し]
    <hr>

    [セッション対話]
      h2.chapter-heading > span.chapter-number "Session"
      div.session-dialogue
        p.line-yanai > span.speaker-yanai "箭内"
        p.line-character > span.speaker-{name} "{名前}さん"
        p.silence "（沈黙）"
    <hr>

    [セッション分析]
      h2.chapter-heading > span.chapter-number "Session Analysis"
      ★ CTA 1個目（記事中盤）
    <hr>

    [チャプター I, II, III ...]
      h2.chapter-heading > span.chapter-number "Chapter 01"
      .text-panel + .highlight-block 交互
      <blockquote> でセリフ引用
    <hr>

    [結論]
      h2.chapter-heading
      ★ CTA 2個目（記事末尾）

    [著者ブロック]
    [シリーズノート]
    [ソースノート]
  </main>

  <!-- フローティングTOC -->
  <!-- フッター -->
  <!-- main.min.js -->
  <!-- JSON-LD（@type: "Article"） -->
  <!-- 検索モーダル -->
</body>
```

### Step 4: CTA統一ブロック（コピペ用）

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
    <a href="../../trial.html" class="btn">無料トライアルに申し込む &rarr;</a>
  </div>
</section>
```

### Step 5: セッション対話フォーマット

```html
<div class="session-dialogue fade-in">
  <p class="line-yanai"><span class="speaker-yanai">箭内</span>「セリフ」</p>
  <p class="line-character"><span class="speaker-{name}">{名前}さん</span>「セリフ」</p>
  <p class="silence">（沈黙）</p>
</div>
```

- 箭内の発言: `.line-yanai` + `.speaker-yanai`（金色）
- キャラの発言: `.line-character` + `.speaker-{name}`（紫）
- 対話内のみ「さん」付け
- 沈黙: `.silence` クラス

### Step 6: JSON-LD構造化データ

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{キャラ名}のMeta ── 自由意志なき世界の天命論",
  "description": "{meta description と同じ}",
  "url": "https://jitsuzon-kagaku-lab.yanaihiroki.com/articles/tenmei-{slug}/{character}.html",
  "author": {
    "@type": "Person",
    "name": "箭内宏紀",
    "url": "https://jitsuzon-kagaku-lab.yanaihiroki.com/founder.html"
  },
  "publisher": {
    "@type": "Organization",
    "name": "実存科学研究所",
    "url": "https://jitsuzon-kagaku-lab.yanaihiroki.com/"
  },
  "inLanguage": "ja",
  "isPartOf": {
    "@type": "WebSite",
    "name": "実存科学研究所",
    "url": "https://jitsuzon-kagaku-lab.yanaihiroki.com/"
  }
}
</script>
```

### Step 7: シリーズインデックスの更新

既存の `articles/tenmei-{slug}/index.html` にカードを追加。なければ新規作成（`@type: "CollectionPage"`）。

### Step 8: specials.html の更新

新シリーズの場合のみ、specials.htmlに `.sp-card` を追加し、`.sp-index` のクイックインデックスにもエントリを追加。

### Step 9: sitemap.xml の更新

新しいURLを `sitemap.xml` に追加。

### Step 10: 最終チェックリスト

- [ ] h1に `hero-title--shimmer` クラスがある
- [ ] セッション対話外で「さん」付けしていない
- [ ] CTA が2箇所（中盤＋末尾）にある
- [ ] セッション見出しが「天命の言語化セッション™︎」
- [ ] スピーカー色: 箭内=金、キャラ=紫
- [ ] 100文字超の段落がない（対話外）
- [ ] `.session-phase` を使っていない
- [ ] 作品セリフは `<blockquote>` で囲んでいる
- [ ] `<main>` に `article-page` クラスがある
- [ ] パンくず: TOP > Specials > シリーズ > 記事
- [ ] OGタグ・canonical・JSON-LD のURL正しい
- [ ] Google Fonts が preload 非同期パターン
- [ ] ナビ・フッターのパスが `../../` プレフィックス
- [ ] CSS cache buster が最新（?v=27）
- [ ] シリーズインデックスにカード追加済み
- [ ] sitemap.xml に追加済み
- [ ] 罫線が `──`（U+2500）で `——`（em-dash）でない

---

## 既存記事へのルール適用

ユーザーが既存記事への編集・ルール適用を指示した場合:

1. 対象ファイルを読む
2. 8ルールのチェックリストを実行
3. 違反箇所を修正
4. 変更内容を報告

---

## 注意事項

- テキスト保全: 既存テキストは削除しない（CLAUDE.md最上位ルール）
- 推測で作らない: 必ず正規テンプレート（nausicaa.html）を読んでから作業
- pushまで完了する: 変更後は確認なしで `git push`
- CSS変更時: `npx clean-css-cli css/style.css -o css/style.min.css` で再生成し、?v= を +1

---

# Part B: サイトデザイン編集

スペシャルコラム以外のサイト編集（ページデザイン変更、新規ページ追加、レイアウト修正等）。

## 作業前の確認事項

1. **MEMORY.md を読む** ── デザイン好み・カラーパレット・NG集を確認
2. **対象ファイルを読む** ── 現在の状態を把握
3. **css/style.css を確認** ── 該当するCSS値を実測（推測NG）

## ダークラグジュアリー美学（要約）

### カラーパレット
| 役割 | 色 | 用途 |
|------|-----|------|
| 主役 | ゴールド `#c0a878` | 見出し、ボタン、境界線、シマー |
| 準主役 | パープル `#b8a0d8` | サブテキスト、タグライン、シマー |
| 背景 | ダーク `#0c0a16` 系 | 深い闘が高級感を作る |

### 厳守ルール
- **ゴールドシマー**: 重要見出しに `gold-shimmer` アニメーション
- **パープルシマー**: サブテキストに `purple-shimmer` アニメーション（5s周期）
- **ボタン**: 濃いめゴールド + シャインアニメーション（透明ガラス・紫系は却下済み）
- **カード**: 高い不透明度（0.75〜0.92）+ backdrop-filter blur（低い不透明度はNG）
- **罫線**: `──`（Box Drawing U+2500）。em-dashは使わない

### NG集
1. チープ・ダサい（フラットすぎ、装飾なし）
2. 薄い・弱い（低不透明度、輝き不足）
3. ブレ・不統一
4. 不要な余白
5. ローマ字署名（漢字「箭内宏紀」を使う）
6. 改行崩れ
7. 推測で作る（実CSS値を確認せず）
8. plain text-panel（必ずカード化）
9. 中央揃えの長文
10. 自己啓発用語（ミッション、ビジョン等）
11. 同トーンカードの羅列

## CSS変更時のワークフロー

1. `css/style.css` を編集
2. `npx clean-css-cli css/style.css -o css/style.min.css` で再生成
3. 全HTMLの `?v=` を +1 する（現在 v=27）
4. `git add` → `git commit` → `git push`

## ナビ・フッター変更時

- `grep -rl` で全対象ファイルを洗い出し一括更新
- ナビ2パターン: ルート直下（相対パス）/ サブディレクトリ（`../../`）
- フッター3パターン: ルート直下 / サブディレクトリ / beginner.html（絶対URL）
