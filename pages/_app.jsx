import '../styles/default.sass';
import Head from 'next/head';
import { Component } from 'react';

export default class App extends Component {
    render = ({ Component, pageProps }) => (
        <div>
            <Head>
                <meta name='viewport' content='width=device-width,initial-scale=1' />
                <title>Server Monitor - The best monitoring solution</title>
            </Head>
            <Component {...pageProps} />
        </div>
    );
};