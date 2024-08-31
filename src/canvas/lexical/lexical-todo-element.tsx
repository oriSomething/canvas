//#region imports
import * as React from "react";
import {
	EditorConfig,
	type LexicalNode,
	TextNode,
	$isParagraphNode,
	ParagraphNode,
	$createParagraphNode,
	SerializedParagraphNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
//#endregion

const TYPE = "todo-node";
const TODO_RE = /^\[[ x+-]\]/;
const TODO_UNCHECKED_RE = /^\[[ ]\]/;
const TODO_CHECKED_RE = /^\[[x+-]\]/;

export function $createTodoNode(checked: boolean): TodoNode {
	return new TodoNode(checked);
}

export function $isTodoNode(
	node: LexicalNode | null | undefined,
): node is TodoNode {
	return node instanceof TodoNode;
}

interface SerializedTodoNode extends SerializedParagraphNode {
	checked?: boolean;
}

export class TodoNode extends ParagraphNode {
	static getType(): string {
		return TYPE;
	}

	static clone(node: TodoNode): TodoNode {
		return new TodoNode(node.__checked, node.__key);
	}

	static importJSON(serializedNode: SerializedTodoNode) {
		return new TodoNode(serializedNode.checked ?? false);
	}

	__checked: boolean;

	constructor(checked: boolean, key?: string | undefined) {
		super(key);
		this.__checked = checked;
	}

	isChecked() {
		return this.__checked;
	}

	setChecked(checked: boolean) {
		const instance = this.getWritable();
		instance.__checked = checked;
		return instance;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const element = super.createDOM(config);
		addClassNamesToElement(
			element,
			config.theme.todo,
			this.__checked ? config.theme.todoChecked : undefined,
		);
		return element;
	}

	updateDOM(): boolean {
		return false;
	}

	exportJSON(): SerializedTodoNode {
		return {
			...super.exportJSON(),
			checked: this.__checked,
			type: TYPE,
		};
	}
}

export function TodoNodePlugin() {
	const [editor] = useLexicalComposerContext();

	React.useEffect(() => {
		if (!editor.hasNodes([TodoNode])) {
			throw new Error(
				"TodoElementPlugin: TodoElementPlugin not registered on editor",
			);
		}
	}, [editor]);

	React.useEffect(() => {
		return editor.registerNodeTransform(TextNode, (node) => {
			const parent = node.getParent();
			if (parent == null) return;
			if (node.getIndexWithinParent() !== 0) return;
			const textContent = node.getTextContent();

			if ($isTodoNode(parent)) {
				if (!parent.isChecked() && TODO_CHECKED_RE.test(textContent)) {
					const element = $createTodoNode(true);
					const children = parent.getChildren();
					for (const child of children) element.append(child);
					parent.replace(element);
					return;
				}

				if (parent.isChecked() && TODO_UNCHECKED_RE.test(textContent)) {
					const element = $createTodoNode(false);
					const children = parent.getChildren();
					for (const child of children) element.append(child);
					parent.replace(element);
					return;
				}

				if (TODO_RE.test(textContent)) return;
				const element = $createParagraphNode();
				const children = parent.getChildren();
				for (const child of children) element.append(child);
				parent.replace(element);
			}

			if ($isParagraphNode(parent)) {
				if (!TODO_RE.test(textContent)) return;

				const checked = TODO_CHECKED_RE.test(textContent);
				const element = $createTodoNode(checked);
				const children = parent.getChildren();
				for (const child of children) element.append(child);
				parent.replace(element);
			}
		});
	}, [editor]);

	return null;
}
