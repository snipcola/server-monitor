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
import Router from 'next/router';
import { apiRequest, setUser } from '../lib/functions';
import { captchaConfig } from '../../config';

const { siteKey } = captchaConfig;

export default class extends Component {
    state = {
        visible: false,
        elementsDisabled: false,
        userData: {
            login: '',
            password: ''
        },
        errors: []
    };

    componentDidMount = () => setUser((a) => this.setState(a), null, null, (u) => {
        if (u) Router.push(Links.dashboard.settings);
        else this.setState({ visible: true });
    });

    render = () => {
        const captchaRef = createRef();

        const submit = (e) => {
            e.preventDefault();
    
            apiRequest(Links.api.user.validate, 'POST', {
                ...this.state.userData,
                captcha: captchaRef.current?.getValue()
            }, (a) => this.setState(a), null, ({ auth_token }) => {
                if (auth_token) apiRequest(Links.api.user.login, 'POST', {
                    auth_token
                }, (a) => this.setState(a), null, () => Router.push(Links.dashboard.settings));
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
                    <Container containerClass={styles.container} contentClass={styles.content}>
                        <div className={styles.title}>
                            <h1 className={styles.text}>Log in</h1>
                            <p className={styles.description}>Log into your Server Monitor account.</p>
                        </div>
                        <Input className={styles.input} name='login' onChange={change} placeholder='Email/Username' type='email' disabled={this.state.elementsDisabled} />
                        <Input className={styles.input} name='password' onChange={change} placeholder='Password' type='password' disabled={this.state.elementsDisabled} />
                        <Captcha className={styles.captcha} ref={captchaRef} sitekey={siteKey} />
                        <div className={styles.buttons}>
                            <Button onClick={submit} label='Login' variant='primary' disabled={this.state.elementsDisabled} />
                            <Button label='Register' variant='outline' link={Links.register} disabled={this.state.elementsDisabled} />
                        </div>
                        <Button className={styles.forgotPasswordButton} label='Forgotten your password?' variant='text' link={Links.submitForgotPassword} disabled={this.state.elementsDisabled} />
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