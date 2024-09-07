//#region imports
import styles from "./Note.module.css";
import * as React from "react";
import {
	LexicalComposer,
	type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalCanvasDndItemPlugin } from "../dnd/lexical-canvas-dnd-item-plugin";
import { TodoNode, TodoNodePlugin } from "../lexical/lexical-todo-element";
import { ITEM_CLASSNAME } from "../dnd/dnd-config";
import {
	readInitialLexicalState,
	saveLexicalState,
} from "../lexical/lexical-storage";
//#endregion imports

export interface Props {
	id: string;
}

export function Note({ id }: Props) {
	const contentEditableRef = React.useRef<HTMLDivElement>(null);
	const [initialConfig] = React.useState((): InitialConfigType => {
		return {
			namespace: "rich-text-dnd",
			theme: {
				tagged: styles.tagged,
				todo: styles.todo,
				todoChecked: styles.todoChecked,
				paragraph: `${styles.paragraph} ${ITEM_CLASSNAME}`,
			},
			onError: console.error,
			editorState: readInitialLexicalState(id),
			nodes: [TodoNode],
		};
	});

	return (
		<LexicalComposer initialConfig={initialConfig}>
			{React.useMemo(
				() => (
					<React.Fragment>
						<div className={styles.root}>
							<RichTextPlugin
								contentEditable={
									<ContentEditable
										ref={contentEditableRef}
										className={styles.contentEditable}
									/>
								}
								placeholder={
									<div className={styles.contentEditablePlaceholder}>
										Enter some text...
									</div>
								}
								ErrorBoundary={LexicalErrorBoundary}
							/>
						</div>
						<HistoryPlugin />
						<TodoNodePlugin />
						<OnChangePlugin
							onChange={(editorState) => saveLexicalState(id, editorState)}
						/>
					</React.Fragment>
				),
				[id],
			)}
			<LexicalCanvasDndItemPlugin
				contentEditableRef={contentEditableRef}
				overClassName={styles.over}
				overTopClassName={styles.overTop}
				overBottomClassName={styles.overBottom}
			/>
		</LexicalComposer>
	);
}
