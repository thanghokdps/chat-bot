// Page backgrounds drawn in the design (ui-map tokens); shared by the schema and the client.
export const BACKGROUNDS = ["gray", "blue", "pink", "yellow", "green"] as const;
export type Background = (typeof BACKGROUNDS)[number];
