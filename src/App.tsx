import styles from './App.module.css';
import { Canvas } from './canvas/Cavnas';

export function App() {
  return (
    <div className={styles.root}>
      <Canvas />
    </div>
  );
}
