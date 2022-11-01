import loginStyles from './login.module.sass';
import Layout from '../components/layout.jsx';
import Container from '../components/container.mdx';
import Alert from '../components/alert.mdx';
import Input from '../components/input.mdx';
import Button from '../components/button.mdx';
import { faCircleExclamation as Error, faCheckCircle as Check } from '@fortawesome/free-solid-svg-icons';
import Links from '../lib/links.js';
import { useState, createRef, useEffect } from 'react';
import NextLink from 'next/link';
import Captcha from 'react-google-recaptcha';
import { useRouter } from 'next/router';
import { publicIpv4 as IPV4 } from 'public-ip';
import axios from 'axios';

export default () => {
    const [ip, setIp] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        email: '',
        code: ''
    });
    const [errors, setErrors] = useState([]);
    const [validated, setValidated] = useState(false);
    const captchaRef = createRef();

    useEffect(() => router.isReady && setUserData({ email: router.query.email ?? '', code: router.query.code ?? '' }), [router, setUserData]);
    useEffect(async () => setIp(await IPV4()), []);

    const submit = async (e) => {
        e.preventDefault();

        setValidated(false);
        setLoading(true);

        axios.delete(Links.api.emailVerification, { data: { ...userData, captcha: captchaRef.current?.getValue(), ip } })
            .then((res) => {
                if (!res.data?.data?.success || res.data?.errors?.length > 0) setErrors(res.data.errors);
                else {
                    setErrors([]);
                    setValidated(true);
                };

                setLoading(false);
            })
            .catch(() => setLoading(false) && setErrors([`API error, please try again.`]));

        captchaRef.current?.reset();
    };

    const change = (e) => {
        const { name, value } = e.target;

        setUserData({ ...userData, [name]: value });
    };

    return (
        <Layout loading={loading}>
            <Container containerClass={loginStyles.container} contentClass={loginStyles.content}>
                <div className={loginStyles.title}>
                    <h1 className={loginStyles.text}>Email Verification</h1>
                    <p className={loginStyles.description}>Check your email (including the spam folder) as we've sent you a 6 digit code that you'll need.</p>
                </div>
                <Input className={loginStyles.input} value={userData.email} name='email' onChange={change} placeholder='Email address' type='email' />
                <Input className={loginStyles.input} value={userData.code} name='code' onChange={change} placeholder='Six digit code (123-456)' type='text' />
                <Captcha className={loginStyles.captcha} ref={captchaRef} sitekey={`6LeJsxAiAAAAAM1g0-bOndBDAkaEs5VYYxnxx2Ep`} />
                <div className={loginStyles.buttons}>
                    <Button onClick={submit} label='Verify' variant='primary' />
                    <Button label='Login' variant='outline' link={Links.login} />
                </div>
                <Alert style={{ display: errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                    <p>
                        The following errors occured:
                        {errors.map((e) => <li>{e}</li>)}
                    </p>
                )} className={loginStyles.alert} />
                <Alert style={{ display: validated ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully verified your email, click <NextLink href={Links.login}><a className={loginStyles.link}>here</a></NextLink> to login.</p>)} className={loginStyles.alert} />
            </Container>
        </Layout>
    );
};