import styles from './layout.module.sass';
import Container from '../../components/dashboard/container.jsx';
import Header from '../../components/dashboard/header.jsx';
import Sidebar from '../../components/dashboard/sidebar.mdx';
import { Component } from 'react';

export default class extends Component {
    render = ({ children, label, loading, rightContent }) => (
        <Container loading={loading ?? undefined}>
            <Header />
            <div className={styles.mainContainer}>
                <div className={styles.container}>
                    <Sidebar />
                </div>
                <div className={`${styles.container} ${styles.contentContainer}`}>
                    <h1 className={styles.title}>
                        {label}
                        {rightContent && <div className={styles.rightContent}>{rightContent}</div>}
                    </h1>
                    <div className={styles.seperator} />
                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </Container>
    );
};