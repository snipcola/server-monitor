import Header from './header.jsx';
import Footer from './footer.mdx';
import styles from './layout.module.sass';
import { useState, useEffect } from 'react';

export default (props) => {
    const [loaded, setLoaded] = useState(false);
    const loading = !loaded ? (!loaded ?? props.loading) : (props.loading ?? !loaded);

    useEffect(() => {
        document.readyState === "complete" ? setLoaded(true) : (() => {
            window.addEventListener("load", () => setLoaded(true));
            return () => window.removeEventListener("load", () => setLoaded(true));
        })();
    }, []);
    
    return (
        <div className={styles.container}>
            <Header loading={loading} />
            <div className={`${styles.content} ${loading ? styles.loading : ''}`}>
                {props.children}
            </div>
            <Footer />
        </div>
    );
};