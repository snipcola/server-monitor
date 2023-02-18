import { Html, Head, Main, NextScript } from 'next/document';

export default () => (
    <Html>
        <Head>
            <meta charSet='utf-8' />
            <link rel='icon' href='/icon.ico' />
        </Head>

        <body>
            <Main />
            <NextScript />
        </body>
    </Html>
);