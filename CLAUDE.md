# 사업하는 예수쟁이 플랫폼 (godsbizman)

## 프로젝트 개요
- **플랫폼명**: 사업하는 예수쟁이
- **GitHub 레포**: https://github.com/ggumsikman/godsbizman
- **라이브 URL**: https://ggumsikman.github.io/godsbizman
- **로컬 경로**: `C:\Users\leese\jesusbiz-platform\`
- **제작자**: 꿈의식판 꿈식맨 (이석훈)

## 주인공
**이강락 대표 (李康洛)**
- 케이알컨설팅(주) 대표
- CBMC 한국기독실업인회 서부연합 경영고문
- 평광교회 장로
- 서울대학교 기계설계과 졸업
- 유튜브: https://www.youtube.com/@leekrtv
- 페이스북: https://www.facebook.com/leekrf
- 페이스북 그룹(묵상): https://www.facebook.com/groups/361360333899357/
- 책(교보문고): https://product.kyobobook.co.kr/detail/S000219494358
- 책 소개(블로그): https://blog.naver.com/iloveoti/224227351166

## 타겟
기독교인 중 사업하는 사람 또는 사업을 꿈꾸는 사람 (경영 + 신앙 통합 콘텐츠)

## 파일 구조
```
jesusbiz-platform/
├── index.html        # 메인 파일 (전부 단일 파일로 구성)
├── assets/
│   ├── profile.jpg   # 이강락 대표 프로필 사진
│   └── book-cover.jpg # 사업하는 예수쟁이 책 표지
└── CLAUDE.md         # 이 파일
```

## 자료 폴더 (로컬)
`C:\Users\leese\OneDrive\문서\카카오톡 받은 파일\사업하는 예수쟁이\`
- 이강락대표사진.jpg
- links.txt (링크 모음)
- `사업하는 예수쟁이 책\` — 책 표지 이미지
- `월드베스트 기업만들기\` — 강의 홍보물

## 디자인 컨셉
책 표지 "사업하는 예수쟁이" 수묵화 스타일
- 배경: 흰 크림 종이 (#FAFAF7)
- 글자: 먹색 잉크 블랙 (#1C1C1C)
- 히어로: SVG 수묵 배 일러스트 직접 구현
- 여백 중심, 절제된 디자인
- 섹션 구분: 수평선 (물결 모티프)

## 현재 구현된 섹션
1. **네비게이션** — 고정 상단바, 모바일 햄버거 메뉴
2. **히어로** — SVG 배 일러스트 + 책 인용구 + CTA 버튼
3. **소개** — 이강락 대표 프로필 사진 + 경력 + SNS 링크
4. **강의** — 카드형 6개 (이강락TV 연결)
5. **칼럼** — 페이스북 칼럼 목록형 (샘플 3개)
6. **도서** — 책 표지 3D 효과 + 교보문고 / 책소개 링크
7. **선한영향력** — 수치 인포그래픽 (30년, 4기, 30강)
8. **Q&A** — Coming Soon (DB 미연결)
9. **푸터** — 링크 모음 + 꿈식맨 제작자 표기

## 미완료 / 다음 작업 후보
- [ ] Q&A 게시판 DB 연결 (Supabase 또는 Firebase)
- [ ] 실제 강의 영상 썸네일 및 유튜브 링크 개별 연결
- [ ] 실제 칼럼 내용 페이스북에서 가져와 반영
- [ ] 이강락TV 유튜브 영상 임베드
- [ ] 도메인 연결 (godsbizman.com 등)
- [ ] 월드베스트 기업만들기 강의 커리큘럼 상세 페이지

## 작업 규칙
- 단일 HTML 파일로 유지 (CSS/JS 인라인)
- 새 이미지는 `assets/` 폴더에 저장
- 작업 후 반드시 git commit + push
- 관리자 비밀번호: 1234 (추후 변경 예정)
- 브랜치: master
