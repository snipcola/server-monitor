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
import axios from 'axios';

export default class extends Component {
    state = {
        visible: false,
        ip: '',
        loading: false,
        userData: {
            email: '',
            username: '',
            password: ''
        },
        errors: [],
        registered: false
    };

    componentDidMount = () => axios.get('/api/user')
        .then((r) => r?.data?.data?.user
            ? Router.push(Links.dashboard.settings)
            : this.setState({ visible: true }))
        .catch(() => this.setState({ visible: true }));

    render = () => {
        const captchaRef = createRef();

        useEffect(async () => this.setState({ ip: await IPV4() }), []);

        const submit = async (e) => {
            e.preventDefault();
    
            this.setState({ registered: false });
            this.setState({ loading: true });
            
            axios.post(Links.api.emailVerification, { ...this.state.userData, ip: this.state.ip, captcha: captchaRef.current?.getValue() })
                .then((res) => {
                    if (!res?.data?.data?.success || res.data?.errors?.length > 0) this.setState({ errors: res.data.errors });
                    else {
                        this.setState({ errors: [] });
                        this.setState({ registered: true });
    
                        Router.push(`${Links.verifyEmail}?email=${this.state?.userData?.email}`);
                    };
    
                    this.setState({ loading: false });
                })
                .catch(() => this.setState({ loading: false }) && this.setState({ errors: [`API error, please try again.`] }));
    
            captchaRef.current?.reset();
        };
    
        const change = (e) => {
            const { name, value } = e.target;
    
            this.setState({ userData: { ...this.state.userData, [name]: value } });
        };

        return (
            <Layout loading={this.state.loading}>
                {this.state.visible ? (
                    <Container containerClass={loginStyles.container} contentClass={loginStyles.content}>
                        <div className={loginStyles.title}>
                            <h1 className={loginStyles.text}>Register</h1>
                            <p className={loginStyles.description}>Register a Server Monitor account.</p>
                        </div>
                        <Input className={loginStyles.input} name='email' onChange={change} placeholder='Email address' type='email' />
                        <Input className={loginStyles.input} name='username' onChange={change} placeholder='Username' type='text' />
                        <Input className={loginStyles.input} name='password' onChange={change} placeholder='Password' type='password' />
                        <Captcha className={loginStyles.captcha} ref={captchaRef} sitekey={`6LeJsxAiAAAAAM1g0-bOndBDAkaEs5VYYxnxx2Ep`} />
                        <div className={loginStyles.buttons}>
                            <Button onClick={submit} label='Register' variant='primary' />
                            <Button label='Login' variant='outline' link={Links.login} />
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