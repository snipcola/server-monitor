import '../styles/default.sass';
import Head from 'next/head';
import { Component } from 'react';

export default class App extends Component {
    render = ({ Component, pageProps }) => (
        <div>
            <Head>
                <meta name='viewport' content='width=device-width,initial-scale=1' />
                <title>TEMPORARY TEST</title>
            </Head>

            <Component {...pageProps} />
        </div>
    );
};