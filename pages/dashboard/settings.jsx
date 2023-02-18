import styles from './settings.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import Alert from '../../components/alert.mdx';
import Input from '../../components/input.mdx';
import Button from '../../components/button.mdx';
import { Component, createRef } from 'react';
import Router from 'next/router';
import { faCircleExclamation as Error, faCheckCircle as Check, faCheck as CheckAlt, faPencil as Edit, faTrashAlt as Delete, faBiohazard as Danger, faCopy as Copy } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/dashboard/modal.jsx';
import Captcha from 'react-google-recaptcha';
import Links from '../../lib/links';
import { apiRequest, setUser, logout } from '../../lib/functions';
import { captchaConfig } from '../../../config';

const { siteKey } = captchaConfig;

export default class extends Component {
    defaultChangePasswordModal = {
        data: {
            current_password: '',
            desired_password: ''
        },
        visible: false,
        errors: [],
        changed: false,
        elementsDisabled: false
    };

    defaultDeleteAccountModal = {
        visible: false,
        errors: [],
        deleted: false,
        deleteCounter: 3,
        elementsDisabled: false
    };

    state = {
        loading: undefined,
        user: {},
        userData: {
            username: '',
            discord_link_key: ''
        },
        errors: [],
        updated: false,
        elementsDisabled: false,
        changePasswordModal: this.defaultChangePasswordModal,
        deleteAccountModal: this.defaultDeleteAccountModal,
        copyLinkKeyIcon: Copy,
        copyLinkKeyDisabled: false
    };

    componentDidMount = () => setUser((a) => this.setState(a), Router, Links.login, ({ username, discord_link_key }) => this.setState({ userData: { username, discord_link_key } }));

    render = () => {
        const changePassCaptchaRef = createRef();

        const submit = (e) => {
            e.preventDefault();
    
            apiRequest(Links.api.user.default, 'PUT', { ...this.state.userData }, (a) => this.setState(a), 'updated');
        };

        const setDeleteCounter = (val) => this.setState({ deleteAccountModal: { ...this.state.deleteAccountModal, deleteCounter: val } });

        const submitDeleteAccount = (e) => {
            e.preventDefault();
    
            apiRequest(Links.api.user.default, 'DELETE', null, (a) => this.setState({ deleteAccountModal: {
                ...this.state.deleteAccountModal,
                ...a
            } }), 'deleted', () => Router.push(Links.login));
        };

        const handleDeleteAccount = (e) => {
            const counter = this.state.deleteAccountModal?.deleteCounter;

            if (counter > 0) setDeleteCounter(counter - 1);
            if ((counter - 1) <= 0) submitDeleteAccount(e);
            else e.preventDefault();
        };

        const submitChangePassword = (e) => {
            e.preventDefault();
    
            apiRequest(Links.api.user.default, 'PUT', {
                ...this.state.changePasswordModal?.data,
                captcha: changePassCaptchaRef.current?.getValue()
            }, (a) => this.setState({ changePasswordModal: {
                ...this.state.changePasswordModal,
                ...a
            } }), 'changed', () => logout(Router), true);

            changePassCaptchaRef.current?.reset();
        };
    
        const change = (e) => {
            const { name, value } = e.target;
    
            this.setState({ userData: { ...this.state.userData, [name]: value } });
        };

        const changeChangePassword = (e) => {
            const { name, value } = e.target;
    
            this.setState({ changePasswordModal: { ...this.state.changePasswordModal, data: { ...this.state.changePasswordModal?.data, [name]: value } } });
        };

        const showChangePassword = () => this.setState({ changePasswordModal: { ...this.defaultChangePasswordModal, visible: true } });
        const hideChangePassword = () => this.setState({ changePasswordModal: { ...this.defaultChangePasswordModal, visible: false } });

        const showDeleteAccount = () => this.setState({ deleteAccountModal: { ...this.defaultDeleteAccountModal, visible: true } });
        const hideDeleteAccount = () => this.setState({ deleteAccountModal: { ...this.defaultDeleteAccountModal, visible: false } });

        const setCopiedKey = () => this.setState({ copyLinkKeyIcon: CheckAlt, copyLinkKeyDisabled: true });
        const setCopyKey = () => this.setState({ copyLinkKeyIcon: Copy, copyLinkKeyDisabled: false });

        const copyLinkKey = () => {
            navigator.clipboard.writeText(this.state.userData?.discord_link_key);

            setCopiedKey();
            setTimeout(setCopyKey, 2500);
        };

        return (
            <Layout loading={this.state.loading} label='SETTINGS'>
                <Modal show={this.state.changePasswordModal.visible} title='CHANGE PASSWORD' footer={(
                    <div className={styles.buttons}>
                        <Button className={styles.changePasswordButton} onClick={submitChangePassword} label='Change Password' disabled={this.state.elementsDisabled} />
                        <Button className={styles.button} onClick={hideChangePassword} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Current Password</label>
                        <Input className={styles.input} onChange={changeChangePassword} value={this.state.changePasswordModal?.data?.current_password} name='current_password' type='password' disabled={this.state.changePasswordModal?.elementsDisabled} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Desired Password</label>
                        <Input className={styles.input} onChange={changeChangePassword} value={this.state.changePasswordModal?.data?.desired_password} name='desired_password' type='password' disabled={this.state.changePasswordModal?.elementsDisabled} />
                    </div>
                    <Captcha ref={changePassCaptchaRef} theme='dark' sitekey={siteKey} />
                    <Alert style={{ display: this.state.changePasswordModal.errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.changePasswordModal?.errors.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.changePasswordModal.changed ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully changed your password.</p>)} className={styles.alert} />
                </Modal>
                <Modal show={this.state.deleteAccountModal.visible} title='ARE YOU SURE?' footer={(
                    <div className={styles.buttons}>
                        <Button className={styles.deleteButton} onClick={handleDeleteAccount} label={`Delete${this.state.deleteAccountModal?.deleteCounter > 0 ? ` (${this.state.deleteAccountModal?.deleteCounter})` : ''}`} disabled={this.state.deleteAccountModal?.elementsDisabled} />
                        <Button className={styles.button} onClick={hideDeleteAccount} label='Close' disabled={this.state.deleteAccountModal?.elementsDisabled} />
                    </div>
                )}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Email</label>
                        <Input className={styles.input} value={this.state.user?.email} name='email' type='text' disabled={true} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Username</label>
                        <Input className={styles.input} value={this.state.user?.username} name='username' type='text' disabled={true} />
                    </div>
                    <Alert variant='danger' icon={Danger} label={(
                        <p>
                            <span style={{ fontWeight: '600', fontSize: '1.25rem' }}>This is a highly destructive action.</span>
                            <br/>
                            This is irreversible, your account and all associated data including servers will be destroyed.
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.deleteAccountModal?.errors?.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.deleteAccountModal?.errors?.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.deleteAccountModal?.deleted ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully deleted your account.</p>)} className={styles.alert} />
                </Modal>
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Email</label>
                    <Input className={styles.input} value={this.state?.user?.email} disabled />
                </div>
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Username</label>
                    <Input className={styles.input} name='username' value={this.state.userData?.username} onChange={change} type='text' disabled={this.state.elementsDisabled} />
                </div>
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.flex}>
                        <Input className={styles.input} value='*******************' type='password' disabled />
                        <Button className={styles.changePassButton} icon={Edit} onClick={showChangePassword} label='Change Password' disabled={this.state.elementsDisabled} />
                    </div>
                </div>
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Discord Link Key</label>
                    <div className={styles.flex}>
                        <Input className={styles.input} name='discord_link_key' value={this.state.userData?.discord_link_key} type='text' disabled />
                        <Button className={styles.changePassButton} icon={this.state.copyLinkKeyIcon} onClick={copyLinkKey} label='Copy Link Key' disabled={this.state.copyLinkKeyDisabled ?? this.state.elementsDisabled} />
                    </div>
                </div>
                <Alert style={{ display: this.state.errors.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                    <p>
                        The following errors occured:
                        {this.state.errors.map((e) => <li>{e}</li>)}
                    </p>
                )} className={styles.alert} />
                <Alert style={{ display: this.state.updated ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully updated your account.</p>)} className={styles.alert} />
                <div className={styles.buttons}>
                    <Button icon={CheckAlt} className={styles.button} onClick={submit} label='Save Changes' disabled={this.state.elementsDisabled} />
                    <Button icon={Delete} className={styles.deleteButton} onClick={showDeleteAccount} label='Delete Account' disabled={this.state.elementsDisabled} />
                </div>
            </Layout>
        );
    };
};