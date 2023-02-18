import styles from './redirect.module.sass';
import Container from './container.mdx';
import Router from 'next/router';
import { Component } from 'react';
import Link from 'next/link';
import Layout from './layout.jsx';

export default class Redirect extends Component {
    constructor (props) {
        super(props);
    };

    componentDidMount = () => Router.push(this.props.link);
    
    render = () => (
        <Layout>
            <Container containerClass={styles.redirect} contentClass={styles.content}>
                <h1>You will be redirected shortly,</h1>
                <p>If you are not redirected, attempt to refresh the page or click <Link href={this.props.link}><a className={styles.link}>here</a></Link>.</p>
            </Container>
        </Layout>
    );
};