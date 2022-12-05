import '../styles/default.sass';
import Head from 'next/head';
import { useEffect, Component } from 'react';
import TagManager from 'react-gtm-module';

export default class App extends Component {
    render = ({ Component, pageProps }) => {
        useEffect(() => TagManager.initialize({ gtmId: 'GTM-5HR709SKZ6' }), []);

        return (
            <div>
                <Head>
                    <meta name='viewport' content='width=device-width,initial-scale=1' />
                    <title>Server Monitor - The best monitoring solution</title>
                </Head>
    
                <Component {...pageProps} />
            </div>
        );
    };
};