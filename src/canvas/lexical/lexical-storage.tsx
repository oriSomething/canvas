import { EditorState } from "lexical";

const LS_KEY = "rich-text-dnd-experiment";

export function readInitialLexicalState() {
	return localStorage.getItem(LS_KEY) ?? undefined;
}

export function saveLexicalState(editorState: EditorState) {
	localStorage.setItem(LS_KEY, JSON.stringify(editorState.toJSON()));
}
