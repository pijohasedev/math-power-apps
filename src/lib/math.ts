export function normalizeAnswer(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\\\\,/g, "")
    .replace(/\\\\;/g, "")
    .replace(/\\\\:/g, "");
}

export function compareAnswers(
  given: string,
  correct: string
): boolean {
  return normalizeAnswer(given) === normalizeAnswer(correct);
}