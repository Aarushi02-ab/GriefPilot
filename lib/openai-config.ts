export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function getMaxOutputTokens(defaultValue: number) {
  const rawValue = process.env.OPENAI_MAX_OUTPUT_TOKENS;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : defaultValue;

  if (Number.isNaN(parsedValue) || parsedValue < 100) {
    return defaultValue;
  }

  return parsedValue;
}

export function shouldUseMockOpenAI() {
  return process.env.OPENAI_MOCK_RESPONSES === "true";
}
