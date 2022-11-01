import styles from './modal.module.sass';

export default (props) => props.show && (
    <div {...props} className={styles.container}>
        <div className={styles.contentContainer}>
            {props.title && (
                <div>
                    <h1 className={styles.title}>{props?.title?.toUpperCase()}</h1>
                    <div className={styles.seperator} />
                </div>
            )}
            <div className={styles.content}>{props.children}</div>
            {props.footer && (
                <div>
                    <div className={styles.seperator} />
                    <div className={styles.footer}>{props.footer}</div>
                </div>
            )}
        </div>
    </div>
);