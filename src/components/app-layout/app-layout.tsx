import styles from './app-layout.module.css';

const AppLayout = () => {
  return (
    <div className={styles.main}>
      <header className={styles.main__header}>
        <div className={styles.main__container}>
          <p className={styles.blockTitle}>Header</p>
        </div>
      </header>
      <div className={styles.main__content}>
        <div className={styles.main__container}>
          <p className={styles.blockTitle}>Content</p>
        </div>
      </div>
      <footer className={styles.main__footer}>
        <div className={styles.main__container}>
          <p className={styles.blockTitle}>Footer</p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
