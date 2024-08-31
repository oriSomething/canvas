//#region imports
import styles from "./Canvas.module.css";
import * as React from "react";
import { Note } from "./note/Note";
//#endregion imports

export function Canvas() {
	const [items, setItems] = React.useState(["1", "2"]);

	return (
		<div className={styles.root}>
			{items.map((item) => {
				return (
					<div key={item} className={styles.item}>
						<Note id={item} />
					</div>
				);
			})}

			<div className={styles.item}>
				<button type="button" className={styles.add}>
					Add
				</button>
			</div>
		</div>
	);
}
