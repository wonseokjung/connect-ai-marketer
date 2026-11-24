# connect-ai-marketer

**무인 AI 자율화 회사의 마케팅팀. 24시간, 일주일 내내 내 로그인된 브라우저에서 일합니다.**
CONNECT AI LAB 공개 코드 · MIT + Commons Clause (무료로 쓰되 판매 금지) · [에고라이트(Ego Lite)](https://lite.ego.app) 위에서 동작

```bash
npx github:wonseokjung/connect-ai-marketer setup
```

![connect-ai-marketer](docs/hero.webp)

AI 팀원 8명이 일합니다. 팀원은 하나씩 만들고 근무표(`team.json`)로 엮습니다. 댓글은 10분마다, 리스닝은 매일 아침, 업로드 마무리와 게시는 영상이 올라갈 때마다. `npx connect-ai-marketer watch` 하면 팀이 24시간 근무를 시작합니다. 글은 여러분의 에이전트(Claude Code, Codex, Antigravity)가 쓰고, 킷은 에고라이트 안에서 찾고, 확인하고, 결재함에 넣고, 입력합니다. 내 탭은 건드리지 않습니다.

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

<!-- team:start -->
## CONNECT AI LAB의 AI 직원들

AI 직원을 하나씩 오픈소스로 만들고 있어요. 필요한 직원부터 데려가 쓰세요.

<table>
<tr><td width="34%" valign="top"><b>사업 해부 직원</b><br><a href="https://github.com/wonseokjung/reversebusiness"><code>reversebusiness</code></a></td><td valign="top">사업 웹사이트 주소 하나 주면 그 사업이 어떻게 돈 버는지 읽어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>영상 편집 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-video-motion"><code>connect-ai-video-motion</code></a></td><td valign="top">내 영상을 주면 몸을 피해서 빈자리에 모션그래픽을 넣어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>모션그래픽 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-motion"><code>connect-ai-motion</code></a></td><td valign="top">글 몇 줄 주면 모션그래픽 영상을 만들어 줘요. 찍은 영상은 없어도 돼요.</td></tr>
<tr><td width="34%" valign="top"><b>마케팅팀</b> · <b>지금 보는 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-marketer"><code>connect-ai-marketer</code></a></td><td valign="top">내 브라우저에서 24시간 댓글, 리스닝, 업로드를 맡아요.</td></tr>
<tr><td width="34%" valign="top"><b>글쓰기 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-writer"><code>connect-ai-writer</code></a></td><td valign="top">영상 하나 주면 플랫폼마다 내 말투로 글을 쓰고 사진까지 같이 만들어 줘요.</td></tr>
</table>
<!-- team:end -->
