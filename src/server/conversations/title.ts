export function provisionalTitle(prompt: string): string {
  const oneLine = prompt.replace(/\s+/g, " ").trim();
  if (!oneLine) return "New chat";
  return oneLine.length > 40 ? `${oneLine.slice(0, 40).trimEnd()}...` : oneLine;
}

export function cleanModelTitle(raw: string): string | null {
  const title = raw
    .replace(/^["'\s]+|["'.\s]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 60);
  return title.length > 0 ? title : null;
}
