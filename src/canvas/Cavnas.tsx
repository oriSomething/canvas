//#region imports
import styles from "./Canvas.module.css";
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
import { CanvasDnDPlugin } from "./CanvasDnDPlugin";
import { TaggedPlugin, TaggedNode } from "./CanvasTodo";
//#endregion imports

const LS_KEY = "AAAAAAAAAAAAA";

const initialConfig: InitialConfigType = {
  namespace: "rich-text-dnd",
  theme: {
    tagged: styles.tagged,
  },
  onError: console.error,
  editorState: localStorage.getItem(LS_KEY) ?? undefined,
  nodes: [TaggedNode],
};

export function Canvas() {
  const contentEditableRef = React.useRef<HTMLDivElement>(null);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {React.useMemo(
        () => (
          <>
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
            <TaggedPlugin />
            <OnChangePlugin
              onChange={(editorState) => {
                localStorage.setItem(
                  LS_KEY,
                  JSON.stringify(editorState.toJSON())
                );
              }}
            />
          </>
        ),
        []
      )}
      <CanvasDnDPlugin
        contentEditableRef={contentEditableRef}
        overClassName={styles.over}
      />
    </LexicalComposer>
  );
}
