# AI 설정 가이드 (AI Configuration Guide)

이 프로젝트는 **Vercel AI SDK**를 사용하여 다양한 AI 모델(Google Gemini, Anthropic Claude, OpenAI)을 지원합니다. 소스 코드를 수정하지 않고 `.env` 파일 설정만으로 사용할 모델을 자유롭게 변경할 수 있습니다.

## 1. 환경 변수 설정 (`.env`)

`.env` 파일에서 다음 변수들을 설정하여 AI 엔진을 제어합니다.

### 핵심 설정
| 변수명 | 설명 | 허용 값 |
| :--- | :--- | :--- |
| `AI_PROVIDER` | 사용할 AI 서비스 제공자 | `google`, `anthropic`, `openai` |
| `AI_MODEL` | 사용할 구체적인 모델 ID | 아래 모델 예시 참고 |

### API 키 설정
| 변수명 | 해당 서비스 |
| :--- | :--- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini |
| `ANTHROPIC_API_KEY` | Anthropic Claude |
| `OPENAI_API_KEY` | OpenAI |

---

## 2. 사용 예시

### Google Gemini 사용 시 (권장)
```bash
AI_PROVIDER=google
AI_MODEL=gemini-1.5-flash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Anthropic Claude 사용 시
```bash
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20240620
ANTHROPIC_API_KEY=your_api_key_here
```

### OpenAI 사용 시
```bash
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_api_key_here
```

---

## 3. 엔진 선택 우선순위 (Auto-detection)

`AI_PROVIDER`를 명시적으로 설정하지 않은 경우, 입력된 API 키를 바탕으로 다음 우선순위에 따라 엔진이 자동 선택됩니다:

1.  **Google Gemini** (`GOOGLE_GENERATIVE_AI_API_KEY`가 있는 경우)
2.  **Anthropic Claude** (`ANTHROPIC_API_KEY`가 있는 경우)
3.  **OpenAI** (`OPENAI_API_KEY`가 있는 경우)
4.  **Mock Data** (모든 키가 없는 경우 고정된 답변 반환)

---

## 4. 지원되는 기본 모델

별도로 `AI_MODEL`을 지정하지 않을 경우 다음 모델들이 기본값으로 사용됩니다:

*   **Google**: `gemini-1.5-flash`
*   **Anthropic**: `claude-3-5-sonnet-20240620`
*   **OpenAI**: `gpt-4o-mini` (또는 `OPENAI_MODEL` 변수 값)
