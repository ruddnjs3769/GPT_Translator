class APIClient {
  constructor() {
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    this.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  }

  async translateWithGPT4(texts) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "당신은 전문 번역가입니다. 주어진 텍스트를 한국어로 자연스럽게 번역해주세요.",
          },
          {
            role: "user",
            content: texts.join("\n---\n"),
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "GPT-4 번역 실패");
    return data.choices[0].message.content.split("\n---\n");
  }

  async translateWithClaude(texts) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `다음 텍스트들을 한국어로 번역해주세요:\n${texts.join(
              "\n---\n"
            )}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error?.message || "Claude 번역 실패");
    return data.content[0].text.split("\n---\n");
  }
}

module.exports = new APIClient();
