# connect-ai-marketer

**무인 AI 자율화 회사의 마케팅팀. 24시간, 일주일 내내 내 로그인된 브라우저에서 일합니다.**
CONNECT AI LAB 공개 코드 · MIT + Commons Clause (무료로 쓰되 판매 금지) · [에고라이트(Ego Lite)](https://lite.ego.app) 위에서 동작

```bash
npx github:wonseokjung/connect-ai-marketer setup
```

## 처음이면 이 순서대로

1. **에고라이트 설치**: [lite.ego.app](https://lite.ego.app)에서 내 컴퓨터(맥 또는 윈도우)용을 받아 열고, 첫 안내를 끝까지 마칩니다.
   - 맥에서 열리지 않으면: 시스템 설정 > 개인정보 보호 및 보안 > 그래도 열기
   - 윈도우: 설치 파일을 실행하고, 첫 안내가 끝나면 PowerShell을 새로 엽니다.
2. **Node.js 설치**: [nodejs.org](https://nodejs.org)에서 LTS를 받아 설치합니다. 터미널(윈도우는 PowerShell)을 새로 열고 `node -v`가 v18 이상이면 됩니다.
3. **바이브코딩 도구 하나**: Claude Code, ChatGPT Codex, Antigravity(Gemini) 중 쓰는 것 하나면 됩니다. 글은 이 도구가 씁니다.
4. **설치 한 줄**: 터미널에서 아래를 실행합니다. 바이브코딩 도구에게 실행해 달라고 해도 됩니다.
   ```bash
   npx github:wonseokjung/connect-ai-marketer setup
   ```
5. **에고라이트에서 로그인**: 팀이 일할 사이트(인스타그램, X, 스레드, 유튜브 스튜디오)에 에고라이트 안에서 로그인해 둡니다. 비밀번호와 2단계 인증은 직접 합니다.
6. **점검하고 근무 시작**:
   ```bash
   npx github:wonseokjung/connect-ai-marketer doctor
   npx github:wonseokjung/connect-ai-marketer watch
   ```

![connect-ai-marketer](docs/hero.webp)

AI 팀원 8명이 일합니다. 팀원은 하나씩 만들고 근무표(`team.json`)로 엮습니다. 댓글은 10분마다, 리스닝은 매일 아침, 업로드 마무리와 게시는 영상이 올라갈 때마다. `npx github:wonseokjung/connect-ai-marketer watch` 하면 팀이 24시간 근무를 시작합니다. 글은 여러분의 에이전트(Claude Code, Codex, Antigravity)가 쓰고, 킷은 에고라이트 안에서 찾고, 확인하고, 결재함에 넣고, 입력합니다. 내 탭은 건드리지 않습니다.

| 팀원 | 하는 일 | 상태 |
|---|---|---|
| 댓글 담당 comment-replier | 인스타 새 댓글을 모으고, 댓글 단 사람의 언어로 답글 | v0.1 |
| 리스닝 담당 listener | X와 스레드에서 키워드 검색, 반응 순 정리, 리포트 | v0.1 |
| 업로드 마무리 담당 studio-finisher | 시트대로 제목, 설명, 재생목록, 태그를 채우고 저장, 새로고침해서 비교 | v0.1 |
| 게시 담당 crossposter | 채널별 초안, X 가중치 글자 수, 결재함, 승인하면 입력 | v0.1 |
| 숫자 담당 analyst | 내 X 최근 글 숫자, 반응 좋은 글 5개와 답글 | v0.1 |
| 벤치마크 담당 benchmarker | 키워드로 유튜브 최근 2주 영상을 조회수 순으로, 제목 패턴 | v0.1 |
| 뜯어보기 담당 breakdown | 터진 글 · 영상의 글, 숫자, 첫 몇 초 장면 | v0.1 |
| 신청서 담당 form-filler | 크리에이터 프로그램 신청서를 채우고 제출 직전에 멈춤 | v0.1 |
| 상품 태그 담당 tagger | 쇼핑 태그 | 다음 |

## 팀이 일하는 방식
- **역할**: `roles/<id>/` 의 `role.json` + `run.mjs`. 역할끼리는 작업 폴더의 JSON 파일로 주고받습니다.
- **순서표** `team.json`: 작업 폴더에 복사해서 순서를 바꾸면 나만의 팀이 됩니다.
- **결재함**: 모든 게시와 답글은 `approve <id>` 전까지 기다립니다. 믿는 역할만 `config.autoSend` 에 넣으세요.
- **책상**: `desk` 가 오늘의 결재, 답글, 업로드 확인, 사람들이 하는 말을 한 장으로 엽니다.
- **사람 문**: 로그인, 모든 게시, 마지막 게시 버튼(`crossposter.finalClick` 을 켜지 않으면).

명령은 영어 README와 같습니다. 작업 폴더는 `~/.connect-ai-marketer` 이고 킷 안에는 아무것도 쓰지 않습니다.

## 라이선스
MIT + Commons Clause. 읽고, 쓰고, 고치고, 나눠도 되고, 내 사업 홍보에 써도 됩니다. 이 코드를 팔거나, 이 코드로 유료 강의 · 호스팅 · 서비스를 파는 것은 안 됩니다. 자세한 내용은 LICENSE.
