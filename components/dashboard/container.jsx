import styles from './container.module.sass';
import { Component, useEffect } from 'react';

export default class extends Component {
    state = {
        loaded: false
    };

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
                <div className={this.props.container ?? styles.container}>
                    <div className={this.props.content ?? styles.content}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    };
};