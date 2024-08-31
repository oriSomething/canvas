import { EditorState } from "lexical";

const LS_KEY = "rich-text-dnd-experiment";

function getId(id: string) {
	return id ? LS_KEY + "-" + id : LS_KEY;
}

export function readInitialLexicalState(id: string) {
	return localStorage.getItem(getId(id)) ?? undefined;
}

export function saveLexicalState(id: string, editorState: EditorState) {
	localStorage.setItem(getId(id), JSON.stringify(editorState.toJSON()));
}
