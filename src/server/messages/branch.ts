export interface TreeMessage {
  id: string;
  parentMessageId: string | null;
}

/** Walks from the leaf to the root and returns the visible branch oldest-first. */
export function branchToLeaf<T extends TreeMessage>(all: readonly T[], leafId: string | null): T[] {
  const byId = new Map(all.map((m) => [m.id, m]));
  const branch: T[] = [];
  const seen = new Set<string>();
  let cursor = leafId ? byId.get(leafId) : undefined;
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    branch.push(cursor);
    cursor = cursor.parentMessageId ? byId.get(cursor.parentMessageId) : undefined;
  }
  return branch.reverse();
}
