import loginStyles from './login.module.sass';
import Layout from '../components/layout.jsx';
import Container from '../components/container.mdx';
import Alert from '../components/alert.mdx';
import Input from '../components/input.mdx';
import Button from '../components/button.mdx';
import { faCircleExclamation as Error, faCheckCircle as Check } from '@fortawesome/free-solid-svg-icons';
import Links from '../lib/links';
import { createRef, useEffect, Component } from 'react';
import NextLink from 'next/link';
import Captcha from 'react-google-recaptcha';
import Router from 'next/router';
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
            username: '',
            password: ''
        },
        errors: [],
        registered: false
    };

    componentDidMount = () => setUser((a) => this.setState(a), null, null, (u) => {
        if (u) Router.push(Links.dashboard.settings);
        else this.setState({ visible: true });
    });

    render = () => {
        const captchaRef = createRef();

        useEffect(async () => this.setState({ ip: await IPV4() }), []);

        const submit = async (e) => {
            e.preventDefault();

            apiRequest(Links.api.emailVerification, 'POST', {
                ...this.state.userData,
                captcha: captchaRef.current?.getValue(),
                ip: this.state.ip
            }, (a) => this.setState(a), 'registered', ({ success }) => {
                if (success) Router.push(`${Links.verifyEmail}?email=${this.state?.userData?.email}`)
            });
    
            captchaRef.current?.reset();
        };
    
        const change = (e) => {
            const { name, value } = e.target;
    
            this.setState({ userData: { ...this.state.userData, [name]: value } });
        };

        return (
            <Layout>
                {this.state.visible ? (
                    <Container containerClass={loginStyles.container} contentClass={loginStyles.content}>
                        <div className={loginStyles.title}><h1 className={loginStyles.text}>Register</h1></div>
                        <Input className={loginStyles.input} name='email' onChange={change} placeholder='Email address' type='email' disabled={this.state.elementsDisabled} />
                        <Input className={loginStyles.input} name='username' onChange={change} placeholder='Username' type='text' disabled={this.state.elementsDisabled} />
                        <Input className={loginStyles.input} name='password' onChange={change} placeholder='Password' type='password' disabled={this.state.elementsDisabled} />
                        <Captcha className={loginStyles.captcha} ref={captchaRef} sitekey={siteKey} />
                        <div className={loginStyles.buttons}>
                            <Button onClick={submit} label='Register' variant='primary' disabled={this.state.elementsDisabled} />
                            <Button label='Login' variant='outline' link={Links.login} disabled={this.state.elementsDisabled} />
                        </div>
                        <Alert style={{ display: this.state.errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                            <p>
                                The following errors occured:
                                {this.state.errors.map((e) => <li>{e}</li>)}
                            </p>
                        )} className={loginStyles.alert} />
                        <Alert style={{ display: this.state.registered ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully registered, you must verify your email before you login, click <NextLink href={Links.verifyEmail}><a className={loginStyles.link}>here</a></NextLink> to do so.</p>)} className={loginStyles.alert} />
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