import styles from './container.module.sass';
import axios from 'axios';
import { Component, useEffect } from 'react';
import Links from '../../lib/links';
import Router from 'next/router';

export default class extends Component {
    state = {
        loaded: false,
        visible: false
    };

    componentDidMount = () => axios.get('/api/user')
        .then((r) => r?.data?.data?.user
            ? this.setState({ visible: true })
            : Router.push(Links.login))
        .catch(() => Router.push(Links.login));

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