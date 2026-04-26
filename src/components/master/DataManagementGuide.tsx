import styles from "@/src/components/master/MasterList.module.css";

type DataManagementGuideProps = {
  managedData: string;
  actions: string;
  deletionPolicy: string;
};

export function DataManagementGuide({
  managedData,
  actions,
  deletionPolicy,
}: DataManagementGuideProps) {
  return (
    <section className={styles.guideSection} aria-label="データ管理ガイド">
      <h2 className={styles.guideTitle}>この画面の使い方</h2>
      <ul className={styles.guideList}>
        <li>
          <strong>この画面で管理するデータ:</strong> {managedData}
        </li>
        <li>
          <strong>できる操作:</strong> {actions}
        </li>
        <li>
          <strong>削除について:</strong> {deletionPolicy}
        </li>
      </ul>
    </section>
  );
}
