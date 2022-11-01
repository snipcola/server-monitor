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
import Router from 'next/router';
import { publicIpv4 as IPV4 } from 'public-ip';
import axios from 'axios';

export default () => {
    const [ip, setIp] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        email: ''
    });
    const [errors, setErrors] = useState([]);
    const [completed, setCompleted] = useState(false);
    const captchaRef = createRef();

    useEffect(async () => setIp(await IPV4()), []);

    const submit = async (e) => {
        e.preventDefault();

        setCompleted(false);
        setLoading(true);

        axios.post(Links.api.forgotPassword, { ...userData, captcha: captchaRef.current?.getValue(), ip })
            .then((res) => {
                if (!res.data?.data?.success || res.data?.errors?.length > 0) setErrors(res.data?.errors);
                else {
                    setErrors([]);
                    setCompleted(true);

                    Router.push(`${Links.forgotPassword}?email=${userData?.email}`);
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
                    <h1 className={loginStyles.text}>Forgot your password?</h1>
                    <p className={loginStyles.description}>Fill in your email below, and we'll send you a 6-digit-code to reset your password.</p>
                </div>
                <Input className={loginStyles.input} value={userData.email} name='email' onChange={change} placeholder='Email address' type='email' />
                <Captcha className={loginStyles.captcha} ref={captchaRef} sitekey={`6LeJsxAiAAAAAM1g0-bOndBDAkaEs5VYYxnxx2Ep`} />
                <div className={loginStyles.buttons}>
                    <Button onClick={submit} label='Reset' variant='primary' />
                    <Button label='Login' variant='outline' link={Links.login} />
                </div>
                <Alert style={{ display: errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                    <p>
                        The following errors occured:
                        {errors.map((e) => <li>{e}</li>)}
                    </p>
                )} className={loginStyles.alert} />
                <Alert style={{ display: completed ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>Check your email address for a 6-digit-code, click <NextLink href={Links.forgotPassword}><a className={loginStyles.link}>here</a></NextLink> to reset your password.</p>)} className={loginStyles.alert} />
            </Container>
        </Layout>
    );
};