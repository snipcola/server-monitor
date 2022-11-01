import styles from './redeem.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import Input from '../../components/input.mdx';
import Button from '../../components/button.mdx';
import { Component, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Router from 'next/router';
import Links from '../../lib/links';
import Alert from '../../components/alert.mdx';
import { faCircleExclamation as Error, faCheckCircle as Check } from '@fortawesome/free-solid-svg-icons';

export default class extends Component {
    state = {
        loading: false,
        user: {},
        elementsDisabled: false,
        data: {
            key: ''
        },
        errors: [],
        redeemed: false
    };

    componentDidMount = () => axios.get('/api/user')
        .then((r) => r?.data?.data?.user
            ? this.setState({ user: r?.data?.data?.user })
            : Router.push(Links.login))
        .catch(() => Router.push(Links.login));


    render = () => {
        const router = useRouter();
        useEffect(() => router.isReady && this.setState({ data: { key: router.query.key ?? '' } }), [router]);

        const submit = (e) => {
            e.preventDefault();
    
            this.setState({ redeemed: false });
            this.setState({ elementsDisabled: true });
    
            axios.delete('/api/key', { data: { ...this.state.data } })
                .then((res) => {
                    if (!res.data?.data?.success || res.data?.errors?.length > 0) this.setState({ errors: res.data.errors });
                    else {
                        this.setState({ errors: [] });
                        this.setState({ redeemed: true });
                    };
    
                    this.setState({ elementsDisabled: false })
                })
                .catch(() => this.setState({ elementsDisabled: false }) && this.setState({ errors: ['API error, try again.'] }));
        };

        const change = (e) => {
            const { name, value } = e.target;
    
            this.setState({ data: { ...this.state.data, [name]: value } });
        };

        return (
            <Layout label='REDEEM KEY'>
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Key</label>
                    <div className={styles.flex}>
                        <Input className={styles.input} name='key' value={this.state.data?.key} onChange={change} disabled={this.state.elementsDisabled} />
                        <Button className={styles.button} onClick={submit} label='Redeem' disabled={this.state.elementsDisabled} />
                    </div>
                </div>
                <Alert style={{ display: this.state.errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                    <p>
                        The following errors occured:
                        {this.state.errors.map((e) => <li>{e}</li>)}
                    </p>
                )} className={styles.alert} />
                <Alert style={{ display: this.state.redeemed ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully redeemed this key.</p>)} className={styles.alert} />
            </Layout>
        );
    };
};