import styles from './billing.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation as Error, faCheck as Check, faXmark as Cross } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/button.mdx';
import Alert from '../../components/alert.mdx';
import Router from 'next/router';
import Links from '../../lib/links';
import Head from 'next/head';
import moment from 'moment/moment';
import { apiRequest, setUser } from '../../lib/functions';

export default class extends Component {
    state = {
        loading: undefined,
        user: {},
        errors: [],
        switched: false,
        elementsDisabled: false,
    };

    componentDidMount = () => setUser((a) => this.setState(a), Router, Links.login);

    render = () => {
        const GetPlanTime = (expiry) => moment(expiry).diff(moment(), 'days') ?? 0;

        const Plans = [
            {
                label: 'FREE',
                features: [
                    { label: '2 servers.', included: true },
                    { label: 'Dashboard status.', included: true },
                    { label: 'IP Address monitoring.', included: true },
                    { label: 'Email notifications.', included: false },
                    { label: 'Discord channel notifications.', included: false },
                    { label: 'Roblox Game monitoring.', included: false },
                    { label: 'Linux OS monitoring.', included: false },
                    { label: 'FiveM monitoring.', included: false }
                ],
                price: 0.00
            },
            {
                label: 'PREMIUM',
                features: [
                    { label: '15 servers.', included: true },
                    { label: 'Dashboard status.', included: true },
                    { label: 'IP Address monitoring.', included: true },
                    { label: 'Email notifications.', included: true },
                    { label: 'Discord channel notifications.', included: true },
                    { label: 'Roblox Game monitoring.', included: true },
                    { label: 'Linux OS monitoring.', included: true },
                    { label: 'FiveM monitoring.', included: true }
                ],
                price: 5.99,
                featured: true,
                sellixConfig: {
                    id: '6348762b1954c'
                },
                expiry: this.state.user?.premium_expiry
            },
            {
                label: 'PLUS',
                features: [
                    { label: '7 servers.', included: true },
                    { label: 'Dashboard status.', included: true },
                    { label: 'IP Address monitoring.', included: true },
                    { label: 'Email notifications.', included: true },
                    { label: 'Discord channel notifications.', included: true },
                    { label: 'Roblox Game monitoring.', included: false },
                    { label: 'Linux OS monitoring.', included: false },
                    { label: 'FiveM monitoring.', included: false }
                ],
                price: 3.99,
                sellixConfig: {
                    id: '634861e6a4ac2'
                },
                expiry: this.state.user?.plus_expiry
            }
        ];

        const Feature = ({ label, included }) => (
            <tr className={styles.feature}>
                <Icon className={`${styles.icon} ${included ? styles.included : ''}`} icon={included ? Check : Cross} />
                <p className={styles.label}>{label}</p>
            </tr>
        );

        const Subscription = this.state.user?.subscription?.toUpperCase();

        const submit = (plan) => apiRequest(Links.api.user.default, 'PUT', { plan }, (a) => this.setState(a), 'switched', Router.reload);

        const Plan = ({ label, features, price, featured, sellixConfig, expiry }) => (
            <div className={`${styles.plan} ${featured ? styles.featured : ''}`}>
                <h1 className={styles.title}>
                    {label?.toUpperCase()}
                    {featured && (<span className={styles.featured}>FEATURED</span>)}
                </h1>
                <div className={styles.seperator} />
                <div className={styles.content}>
                    <table className={styles.features}>{features.map(Feature)}</table>
                    <div className={styles.bottom}>
                        <h2 className={styles.price}>£{price}<span className={styles.perMonth}>/mo</span></h2>
                        {(sellixConfig?.id && (GetPlanTime(expiry) <= 0 || expiry === null)) ? (
                            <Button data-sellix-product={sellixConfig?.id} className={styles.button} label={
                                Subscription === label?.toUpperCase()
                                    ? 'CURRENT'
                                    : 'PURCHASE'
                            } disabled={this.state.elementsDisabled ?? Subscription === label?.toUpperCase()} />
                        ) : (
                            <Button className={styles.button} label={
                                Subscription === label?.toUpperCase()
                                    ? 'CURRENT'
                                    : 'SWITCH'
                            } onClick={() => Subscription !== label?.toUpperCase() && submit(label)} disabled={this.state.elementsDisabled ?? Subscription === label?.toUpperCase()} />
                        )}
                    </div>
                </div>
            </div>
        );

        const Time = ({ subscription, expiry }) => (
            <tr className={styles.key}>
                <p className={styles.plan}>{subscription}</p>
                <p className={styles.label}>{(GetPlanTime(expiry) < 0) ? 0 : GetPlanTime(expiry)} day(s)</p>
            </tr>
        );

        return (
            <div>
                <Head>
                    <link href="https://cdn.sellix.io/static/css/embed.css" rel="stylesheet"/>
                    <script src="https://cdn.sellix.io/static/js/embed.js" />
                </Head>
                <Layout label='BILLING'>
                    <div className={styles.keys}>
                        <h1 className={styles.title}>Time Remaining</h1>
                        <div className={styles.seperator} />
                        <table className={styles.list}>{Plans.map(({ label, expiry }) => expiry && Time({ subscription: label, expiry }))}</table>
                    </div>
                    <div className={styles.plansContainer}>
                        <h2 className={styles.header}>Our Plans</h2>
                        <div className={styles.plans}>{Plans.map(Plan)}</div>
                    </div>
                    <Alert style={{ display: this.state.errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.errors.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.switched ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully changed your plan.</p>)} className={styles.alert} />
                </Layout>
            </div>
        );
    };
};