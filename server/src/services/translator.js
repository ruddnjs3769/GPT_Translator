const APIClient = require("../utils/api");

class TranslationService {
  async translate(texts, model) {
    try {
      if (model === "gpt_4o") {
        return await APIClient.translateWithGPT4(texts);
      } else if (model === "claude_3.5_sonnet") {
        return await APIClient.translateWithClaude(texts);
      } else {
        throw new Error("지원하지 않는 모델입니다.");
      }
    } catch (error) {
      throw new Error(`번역 서비스 오류: ${error.message}`);
    }
  }
}

module.exports = new TranslationService();
