import styles from './container.module.sass';
import { Component, useEffect } from 'react';
import Links from '../../lib/links';
import Router from 'next/router';
import { setUser } from '../../lib/functions';

export default class extends Component {
    state = {
        loaded: false,
        visible: false
    };

    componentDidMount = () => setUser((a) => this.setState(a), null, null, (u) => {
        if (!u) Router.push(Links.login);
        else this.setState({ visible: true });
    });

    render = () => {
        const loading = !this.state.loaded ? (!this.state.loaded ?? this.props.loading) : (this.props.loading ?? !this.state.loaded);

        useEffect(() => document.readyState === "complete" ? this.setState({ loaded: true }) : (() => {
            window.addEventListener("load", () => this.setState({ loaded: true }));
            return () => window.removeEventListener("load", () => this.setState({ loaded: true }));
        })(), []);

        return (
            <div>
                <style global jsx>{`html { background-color: #242532 !important; }`}</style>
                {loading && <div className={styles.loading}><div className={styles.bar} /></div>}
                {this.state.visible ? (
                    <div className={this.props.container ?? styles.container}>
                        <div className={this.props.content ?? styles.content}>
                            {this.props.children}
                        </div>
                    </div>
                ) : (
                    <div className={styles.container}>
                        <p className={styles.loadingText}>Authenticating...</p>
                    </div>
                )}
            </div>
        );
    };
};