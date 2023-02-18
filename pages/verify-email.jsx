import loginStyles from './login.module.sass';
import Layout from '../components/layout.jsx';
import Container from '../components/container.mdx';
import Alert from '../components/alert.mdx';
import Input from '../components/input.mdx';
import Button from '../components/button.mdx';
import { faCircleExclamation as Error, faCheckCircle as Check } from '@fortawesome/free-solid-svg-icons';
import Links from '../lib/links.js';
import { Component, createRef, useEffect } from 'react';
import NextLink from 'next/link';
import Captcha from 'react-google-recaptcha';
import { useRouter } from 'next/router';
import { publicIpv4 as IPV4 } from 'public-ip';
import { apiRequest, setUser } from '../lib/functions';
import { captchaConfig } from '../../config';

const { siteKey } = captchaConfig;

export default class extends Component {
    state = {
        visible: false,
        ip: '',
        elementsDisabled: false,
        userData: {
            email: '',
            code: ''
        },
        errors: [],
        validated: false
    };

    componentDidMount = () => setUser((a) => this.setState(a), null, null, (u) => {
        if (u) Router.push(Links.dashboard.settings);
        else this.setState({ visible: true });
    });
    
    render = () => {
        const router = useRouter();
        const captchaRef = createRef();

        useEffect(async () => router.isReady && this.setState({
            userData: {
                email: router.query.email ?? '',
                code: router.query.code ?? ''
            },
            ip: await IPV4()
        }), [router]);

        const submit = async (e) => {
            e.preventDefault();
            
            apiRequest(Links.api.emailVerification, 'DELETE', {
                ...this.state.userData,
                captcha: captchaRef.current?.getValue(),
                ip: this.state.ip
            }, (a) => this.setState(a), 'validated');

            captchaRef.current?.reset();
        };

        const change = (e) => {
            const { name, value } = e.target;

            this.setState({ userData: {
                ...this.state.userData,
                [name]: value
            }});
        };

        return (
            <Layout>
                {this.state.visible ? (
                    <Container containerClass={loginStyles.container} contentClass={loginStyles.content}>
                        <div className={loginStyles.title}>
                            <h1 className={loginStyles.text}>Email Verification</h1>
                            <p className={loginStyles.description}>Check your email (including the spam folder) as we've sent you a 6 digit code that you'll need.</p>
                        </div>
                        <Input className={loginStyles.input} value={this.state.userData?.email} name='email' onChange={change} placeholder='Email address' type='email' disabled={this.elementsDisabled} />
                        <Input className={loginStyles.input} value={this.state.userData?.code} name='code' onChange={change} placeholder='Six digit code (123-456)' type='text' disabled={this.elementsDisabled} />
                        <Captcha className={loginStyles.captcha} ref={captchaRef} sitekey={siteKey} />
                        <div className={loginStyles.buttons}>
                            <Button onClick={submit} label='Verify' variant='primary' disabled={this.elementsDisabled} />
                            <Button label='Login' variant='outline' link={Links.login} disabled={this.elementsDisabled} />
                        </div>
                        <Alert style={{ display: this.state.errors?.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                            <p>
                                The following errors occured:
                                {this.state.errors?.map((e) => <li>{e}</li>)}
                            </p>
                        )} className={loginStyles.alert} />
                        <Alert style={{ display: this.state.validated ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully verified your email, click <NextLink href={Links.login}><a className={loginStyles.link}>here</a></NextLink> to login.</p>)} className={loginStyles.alert} />
                    </Container>
                ) : (
                    <Container containerClass={loginStyles.container} contentClass={loginStyles.content}>
                        <p>Authenticating...</p>
                    </Container>
                )}
            </Layout>
        );
    };
};