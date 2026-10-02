# protein-market-analysis

“프로틴” 키워드로 **쿠팡 · 다나와 · 네이버쇼핑** 공개 검색 결과를 수집해 만든 HTML 슬라이드 덱입니다.

## Live

- GitHub Pages: https://hyunsoo-sd.github.io/protein-market-analysis/

## 구성

- `index.html` — reveal.js 기반 슬라이드 덱 (11 슬라이드)
- `styles.css` — 다크 테마, 오브 애니메이션, 카운트업/바 애니메이션
- `deck.js` — Chart.js 차트(평균가·가격레인지·가격대 도넛·브랜드·평점/리뷰 버블) + anime.js 모션
- `data.json` / `data.js` — 수집·분석 결과 (원본 CSV: 상위 디렉터리 `protein_products.csv`)
- `assets/img/` — 16:9 이미지 플레이스홀더 (교체 방법은 `IMAGE_REQUIREMENTS.md`)
- `IMAGE_REQUIREMENTS.md` — Google Flow 이미지 에셋 요구사항 및 교체 가이드

## 데이터 수집

- 도구: Firecrawl `v2/scrape` (JSON 추출)
- 키워드: `프로틴`
- 채널: 쿠팡, 다나와, 네이버쇼핑
- 네이버쇼핑은 봇 차단(HTTP 418)으로 통합검색 표면으로 대체 수집

## 데이터 정제 방법론

원본 수집 데이터(`protein_products.csv`, 상위 디렉터리)는 **수정하지 않고 그대로 보존**합니다.
프레젠테이션에는 정제 데이터셋(`protein_products.cleaned.csv`)을 사용하며, 모든 파생 통계
(KPI·차트·리더보드·인사이트)는 정제 데이터셋에서 재계산됩니다.

- 정제 기준
  1. 단백질 제품이 아닌 품목(예: 휴대폰 액세서리)
  2. 반려동물용 제품(인체용 단백질 시장과 무관)
- 제외 건수: 원본 24건 중 2건 제외 → 최종 22건(가격 확인 20건)
- 제외 항목과 사유는 `data.json`의 `methodology.excluded`에 기록되며, 덱의 “수집 개요” 슬라이드에 방법론 노트로 표시됩니다.

## 로컬 실행

```bash
npx --yes serve .
# 또는
python -m http.server 8080
```

> `data.js`를 직접 로드하므로 `file://`로도 동작하지만, 일부 브라우저 보안 정책을 피하려면 로컬 서버 사용을 권장합니다.

## 고지

공개된 정보에 대한 개인·비조직적 조회 목적의 수집입니다. 가격·재고는 시점에 따라 변동되며, 각 상표는 해당 권리자에게 있습니다. 이 덱은 어떤 제3자 서비스와도 공식 제휴 관계가 없습니다.
