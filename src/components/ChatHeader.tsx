import doodleLogo from "@/assets/doodle-logo.svg";
import styles from "./ChatHeader.module.css";

const GROUP_NAME = "BerlinTeam";

function ChatHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <img className={styles.avatar} src={doodleLogo} alt="" />
        <h1 className={styles.title}>{GROUP_NAME}</h1>
      </div>
    </header>
  );
}

export default ChatHeader;
