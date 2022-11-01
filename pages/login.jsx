import styles from './login.module.sass';
import Layout from '../components/layout.jsx';
import Container from '../components/container.mdx';
import Alert from '../components/alert.mdx';
import Input from '../components/input.mdx';
import Button from '../components/button.mdx';
import { faCircleExclamation as Error } from '@fortawesome/free-solid-svg-icons';
import Links from '../lib/links';
import { createRef, Component } from 'react';
import Captcha from 'react-google-recaptcha';
import axios from 'axios';
import Router from 'next/router';

export default class extends Component {
    state = {
        visible: false,
        userData: {
            email: '',
            password: ''
        },
        errors: []
    };

    componentDidMount = () => axios.get('/api/user')
        .then((r) => r?.data?.data?.user
            ? Router.push(Links.dashboard.settings)
            : this.setState({ visible: true }))
        .catch(() => this.setState({ visible: true }));

    render = () => {
        const captchaRef = createRef();

        const submit = (e) => {
            e.preventDefault();
    
            this.setState({ loading: true })
    
            axios.post('/api/user/validate', { ...this.state.userData, captcha: captchaRef.current?.getValue() })
                .then((res) => {
                    if (!res.data?.data?.success || !res.data?.data?.auth_token || res.data?.errors?.length > 0) this.setState({ errors: res.data.errors });
                    else {
                        this.setState({ errors: [] })
    
                        axios.post('/api/user/login', { auth_token: res.data?.data?.auth_token })
                            .then((r) => r?.data?.data?.success
                                ? Router.push(Links.dashboard.settings)
                                : this.setState({ errors: ['API error, try again.'] }))
                            .catch(() => this.setState({ errors: ['API error, try again.'] }));
                    };
    
                    this.setState({ loading: false })
                })
                .catch(() => this.setState({ loading: false }) && this.setState({ errors: ['API error, try again.'] }));
    
            captchaRef.current?.reset();
        };
    
        const change = (e) => {
            const { name, value } = e.target;
    
            this.setState({ userData: { ...this.state.userData, [name]: value } });
        };

        return (
            <Layout loading={this.state.loading}>
                {this.state.visible ? (
                    <Container containerClass={styles.container} contentClass={styles.content}>
                        <div className={styles.title}>
                            <h1 className={styles.text}>Log in</h1>
                            <p className={styles.description}>Log into your Server Monitor account.</p>
                        </div>
                        <Input className={styles.input} name='email' onChange={change} placeholder='Email address' type='email' />
                        <Input className={styles.input} name='password' onChange={change} placeholder='Password' type='password' />
                        <Captcha className={styles.captcha} ref={captchaRef} sitekey={`6LeJsxAiAAAAAM1g0-bOndBDAkaEs5VYYxnxx2Ep`} />
                        <div className={styles.buttons}>
                            <Button onClick={submit} label='Login' variant='primary' />
                            <Button label='Register' variant='outline' link={Links.register} />
                        </div>
                        <Button className={styles.forgotPasswordButton} label='Forgotten your password?' variant='text' link={Links.submitForgotPassword} />
                        <Alert style={{ display: this.state.errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                            <p>
                                The following errors occured:
                                {this.state.errors.map((e) => <li>{e}</li>)}
                            </p>
                        )} className={styles.alert} />
                    </Container>
                ) : (
                    <Container containerClass={styles.container} contentClass={styles.content}>
                        <p>Authenticating...</p>
                    </Container>
                )}
            </Layout>
        );
    };
};