import styles from './servers.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import { Component, useEffect } from 'react';
import axios from 'axios';
import Router from 'next/router';
import Links from '../../lib/links';
import Button from '../../components/button.mdx';
import Alert from '../../components/alert.mdx';
import Input from '../../components/input.mdx';
import Modal from '../../components/dashboard/modal.jsx';
import { faServer as Servers, faSatelliteDish as IpAddress, faQuestionCircle as NoImage, faCircleExclamation as Error, faCheckCircle as Check, faCheck as CheckAlt, faTrashAlt as Delete, faPencil as Edit } from '@fortawesome/free-solid-svg-icons';
import { faDiscord as Discord, faLinux as Linux } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

export default class extends Component {
    defaultCreateServerModal = {
        data: {
            nickname: '',
            server_type: '',
            ip_address: ''
        },
        visible: false,
        errors: [],
        created: false
    };

    defaultDeleteServerModal = {
        data: {
            id: '',
            nickname: '',
            ip_address: '',
            db_name: ''
        },
        visible: false,
        errors: [],
        deleted: false
    };

    defaultEditServerModal = {
        data: {
            id: '',
            nickname: '',
            ip_address: '',
            db_name: '',
            edit_function: null
        },
        visible: false,
        errors: [],
        edited: false
    };

    setUser = () =>  axios.post('/api/user')
        .then((r) => (r?.data?.validated && r?.data?.user)
            ? this.setState({ user: r?.data?.user })
            : Router.push(Links.login))
        .catch(() => Router.push(Links.login));

    setServers = () =>  axios.post('/api/user')
        .then((r) => (r?.data?.validated && r?.data?.user) && this.setState({ user: r?.data?.user }))
        .catch();

    showCreateServer = () => this.setState({ createServerModal: { ...this.defaultCreateServerModal, visible: true } });
    hideCreateServer = () => this.setState({ createServerModal: { ...this.defaultCreateServerModal, visible: false } });

    showDeleteServer = (data) => this.setState({ deleteServerModal: { ...this.defaultDeleteServerModal, data, visible: true } });
    hideDeleteServer = () => this.setState({ deleteServerModal: { ...this.defaultDeleteServerModal, visible: false } });

    showEditServer = (data) => this.setState({ editServerModal: { ...this.defaultEditServerModal, data, visible: true } });
    hideEditServer = () => this.setState({ editServerModal: { ...this.defaultEditServerModal, visible: false } });

    changeCreateServer = (e) => {
        const { name, value } = e.target;

        this.setState({ createServerModal: { ...this.state.createServerModal, data: { ...this.state.createServerModal?.data, [name]: value } } });
    };

    changeEditServer = (e) => {
        const { name, value } = e.target;

        this.setState({ editServerModal: { ...this.state.editServerModal, data: { ...this.state.editServerModal?.data, [name]: value } } });
    };

    submitCreateIPServer = (e) => {
        e.preventDefault();

        this.setState({ createServerModal: { ...this.state.createServerModal, created: false, errors: [] } });
        this.setState({ elementsDisabled: true });

        createIPServer({ variables: { ...this.state.createServerModal?.data, auth_token: this.state.user?.auth_token } })
            .then((res) => {
                if (!res.data.createIPServer?.created || res.data.createIPServer?.errors?.length > 0) this.setState({ createServerModal: { ...this.state.createServerModal, errors: res.data.createIPServer?.errors } });
                else {
                    this.setState({ createServerModal: { ...this.state.createServerModal, errors: [], created: true } });
                    this.setServers();
                    this.hideCreateServer();
                };

                this.setState({ elementsDisabled: false })
            })
            .catch(() => this.setState({ elementsDisabled: false }) && this.setState({ createServerModal: { ...this.state.createServerModal, errors: ['API error, try again.'] } }));
    };

    submitDeleteServer = (e) => {
        e.preventDefault();

        this.setState({ deleteServerModal: { ...this.state.deleteServerModal, deleted: false, errors: [] } });
        this.setState({ elementsDisabled: true });

        deleteServer({ variables: { ...this.state.deleteServerModal?.data, auth_token: this.state.user?.auth_token } })
            .then((res) => {
                if (!res.data.deleteServer?.deleted || res.data.deleteServer?.errors?.length > 0) this.setState({ deleteServerModal: { ...this.state.deleteServerModal, errors: res.data.deleteServer?.errors } });
                else {
                    this.setState({ deleteServerModal: { ...this.state.deleteServerModal, errors: [], deleted: true } });
                    this.setServers();
                    this.hideDeleteServer();
                };

                this.setState({ elementsDisabled: false })
            })
            .catch(() => this.setState({ elementsDisabled: false }) && this.setState({ deleteServerModal: { ...this.state.deleteServerModal, errors: ['API error, try again.'] } }));
    };

    submitEditIPServer = (e) => {
        e.preventDefault();
        
        this.setState({ editServerModal: { ...this.state.editServerModal, edited: false, errors: [] } });
        this.setState({ elementsDisabled: true });

        editIPServer({ variables: { ...this.state.editServerModal?.data, auth_token: this.state.user?.auth_token } })
            .then((res) => {
                if (!res.data.editIPServer?.edited || res.data.editIPServer?.errors?.length > 0) this.setState({ editServerModal: { ...this.state.editServerModal, errors: res.data.editIPServer?.errors } });
                else {
                    this.setState({ editServerModal: { ...this.state.editServerModal, errors: [], edited: true } });
                    this.setServers();
                };

                this.setState({ elementsDisabled: false })
            })
            .catch(() => this.setState({ elementsDisabled: false }) && this.setState({ editServerModal: { ...this.state.editServerModal, errors: ['API error, try again.'] } }));
    };

    ChangeServerType = (serverType) => this.setState({ createServerModal: { ...this.state.createServerModal, data: { ...this.state.createServerModal.data, server_type: serverType } } });

    ServerType = ({ label, icon, disabled }) => (
        <div className={`${styles.serverType} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.createServerModal?.data?.server_type === label ? styles.selected : ''}`} onClick={() => this.ChangeServerType(label)}>
            {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
            <div className={styles.title}>{label}</div>
        </div>
    );

    ToggleFilter = (label, db_label, icon, db_name, edit_function) => this.state.selectedFilters?.find((f) => f?.label === label)
        ? this.setState({ selectedFilters: this.state.selectedFilters.filter((f) => f?.label !== label) })
        : this.setState({ selectedFilters: [...this.state.selectedFilters, { label, db_label, icon, db_name, edit_function }] });

    Filter = ({ label, icon, disabled, db_label, db_name, edit_function }) => (
        <div className={`${styles.filter} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.selectedFilters?.find((f) => f.label === label) ? styles.selected : ''}`} onClick={() => this.ToggleFilter(label, db_label, icon, db_name, edit_function)}>
            {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
            <div className={styles.title}>{label}</div>
        </div>
    );

    Server = ({ id, nickname, status, ip_address, icon, db_name, edit_function }) => (
        <div className={styles.server}>
            <div className={styles.header}>
                <Icon className={styles.icon} icon={icon} />
                {nickname}
            </div>
            <div className={styles.seperator} />
            <div className={styles.content}>
                <div className={styles.list}>
                    <div className={styles.data}>
                        <p className={styles.label}>IP Address</p>
                        <p className={styles.value}>{ip_address}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Status</p>
                        <p className={`${styles.value} ${styles.status} ${styles[status?.toLowerCase()]}`}>{status?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                </div>
            </div>
            <div className={styles.seperator} />
            <div className={styles.footer}>
                <div className={styles.buttons}>
                    <Button className={styles.button} icon={Edit} onClick={() => this.showEditServer({ id, nickname, ip_address, db_name, edit_function })} label='Edit' disabled={this.state.elementsDisabled} />
                    <Button className={styles.deleteButton} icon={Delete} onClick={() => this.showDeleteServer({ id, nickname, ip_address, db_name })} label='Delete' disabled={this.state.elementsDisabled} />
                </div>
            </div>
        </div>
    );

    state = {
        loading: false,
        user: {},
        elementsDisabled: false,
        createServerModal: this.defaultCreateServerModal,
        deleteServerModal: this.defaultDeleteServerModal,
        editServerModal: this.defaultEditServerModal,
        selectedFilters: []
    };

    ServerTypes = [
        {
            label: 'IP Address',
            icon: IpAddress,
            disabled: false,
            content: (
                <div className={styles.inputContainer}>
                    <label className={styles.label}>IP Address</label>
                    <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.ip_address} placeholder='127.0.0.1' name='ip_address' type='text' disabled={this.state.elementsDisabled} />
                </div>
            ),
            createButton: <Button className={styles.createServerButton} icon={IpAddress} onClick={this.submitCreateIPServer} label='Monitor IP Address' disabled={this.state.elementsDisabled} />,
            db_label: 'ip_servers',
            db_name: 'IPServer',
            edit_function: this.submitEditIPServer
        },
        {
            label: 'Discord Bot',
            icon: Discord,
            disabled: false
        },
        {
            label: 'Roblox Game',
            icon: NoImage,
            disabled: false
        },
        {
            label: 'Linux OS',
            icon: Linux,
            disabled: false
        },
        {
            label: 'FiveM',
            icon: NoImage,
            disabled: false
        }
    ];

    SetFilters = (filterLabels) => this.setState({ selectedFilters: this.ServerTypes?.filter(({ label }) => filterLabels?.includes(label)) });

    componentDidMount = () => {
        alert('API under maintenance. All server related functions temporarily disabled.');
        Router.push(Links.dashboard.settings);
    };

    //componentDidMount = () => this.setUser() && this.SetFilters(['IP Address', 'Discord Bot', 'Roblox Game', 'Linux OS', 'FiveM']);

    render = () => {
        const ServerTypes = this.ServerTypes;

        useEffect(() => {
            const setServers = setInterval(this.setServers, 5000);
            return () => clearInterval(setServers);
        }, [this])

        return (
            <Layout label='SERVERS' rightContent={<Button onClick={this.showCreateServer} className={styles.button} iconRight={Servers} label='Monitor Server' variant='primary' />}>
                <Modal show={this.state.createServerModal.visible} title='MONITOR SERVER' footer={(
                    <div className={styles.buttons}>
                        {ServerTypes.find((st) => st?.label === this.state.createServerModal?.data?.server_type)?.createButton}
                        <Button className={styles.button} onClick={this.hideCreateServer} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                        <div className={styles.inputContainer}>
                        <label className={styles.label}>Nickname</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.nickname} placeholder='Give your server a name' name='nickname' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                    <div className={styles.selectContainer}>
                        <label className={styles.label}>Server Type</label>
                        <div className={styles.serverTypes}>{ServerTypes.map(this.ServerType)}</div>
                    </div>
                    <div className={styles.content}>
                        {ServerTypes.find((st) => st?.label === this.state.createServerModal?.data?.server_type)?.content}
                    </div>
                    <Alert style={{ display: this.state.createServerModal?.errors?.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.createServerModal?.errors?.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.createServerModal?.created ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully created a server.</p>)} className={styles.alert} />
                </Modal>
                <Modal show={this.state.deleteServerModal.visible} title='ARE YOU SURE?' footer={(
                    <div className={styles.buttons}>
                        <Button className={styles.deleteButton} onClick={this.submitDeleteServer} label='Delete' disabled={this.state.elementsDisabled} />
                        <Button className={styles.button} onClick={this.hideDeleteServer} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Nickname</label>
                        <Input className={styles.input} value={this.state.deleteServerModal?.data?.nickname} name='nickname' type='text' disabled={true} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>IP Address</label>
                        <Input className={styles.input} value={this.state.deleteServerModal?.data?.ip_address} name='ip_address' type='text' disabled={true} />
                    </div>
                    <Alert style={{ display: this.state.deleteServerModal?.errors?.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.deleteServerModal?.errors?.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.deleteServerModal?.deleted ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully deleted the server.</p>)} className={styles.alert} />
                </Modal>
                <Modal show={this.state.editServerModal.visible} title='EDIT SERVER' footer={(
                    <div className={styles.buttons}>
                        <Button className={styles.editButton} onClick={this.state?.editServerModal?.data?.edit_function} label='Edit' disabled={this.state.elementsDisabled} />
                        <Button className={styles.button} onClick={this.hideEditServer} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Nickname</label>
                        <Input className={styles.input} value={this.state.editServerModal?.data?.nickname} onChange={this.changeEditServer} name='nickname' type='text' />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>IP Address</label>
                        <Input className={styles.input} value={this.state.editServerModal?.data?.ip_address} onChange={this.changeEditServer} name='ip_address' type='text' />
                    </div>
                    <Alert style={{ display: this.state.editServerModal?.errors?.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.editServerModal?.errors?.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.editServerModal?.edited ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully edited the server.</p>)} className={styles.alert} />
                </Modal>
                <div className={styles.filters}>{ServerTypes.map(this.Filter)}</div>
                <div className={styles.servers}>{this.state.selectedFilters?.map(({ icon, db_label, db_name, label, edit_function }) => {
                    const servers = this.state.user[db_label];

                    if (servers) return (
                        <div className={styles.container}>
                            <div className={styles.title}>{label}</div>
                            <div className={styles.server_list}>{servers?.sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)?.sort((a) => a?.status ? ['OFFLINE', 'PENDING'].includes(a?.status) && -1 : 0)?.map((server) => this.Server({ ...server, icon, db_name, edit_function }))}</div>
                        </div>
                    );
                })}</div>
            </Layout>
        );
    };
};