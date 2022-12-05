import styles from './servers.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import { Component, useEffect } from 'react';
import Router from 'next/router';
import Links from '../../lib/links';
import Button from '../../components/button.mdx';
import Alert from '../../components/alert.mdx';
import Input from '../../components/input.mdx';
import Modal from '../../components/dashboard/modal.jsx';
import { faServer as Servers, faSatelliteDish as IpAddress, faQuestionCircle as NoImage, faCircleExclamation as Error, faCheckCircle as Check, faCheck as CheckAlt, faTrashAlt as Delete, faPencil as Edit } from '@fortawesome/free-solid-svg-icons';
import { faDiscord as Discord, faLinux as Linux } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { apiRequest, setUser } from '../../lib/functions';

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
            delete_function: null
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
            edit_function: null
        },
        visible: false,
        errors: [],
        edited: false
    };

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

    setServers = () => apiRequest(Links.api.servers.ip, 'GET', null, null, null, (data) => this.setState({ servers: data?.servers }));

    submitCreateIPServer = (e) => {
        e.preventDefault();

        apiRequest(Links.api.server.ip, 'POST', { ...this.state.createServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            createServerModal: {
                ...this.state.createServerModal,
                ...a
            } }), 'created', this.setServers);
    };

    submitDeleteIPServer = (e) => {
        e.preventDefault();
        
        apiRequest(Links.api.server.ip, 'DELETE', { ...this.state.deleteServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            deleteServerModal: {
                ...this.state.deleteServerModal,
                ...a
            } }), 'deleted', this.setServers);
    };

    submitEditIPServer = (e) => {
        e.preventDefault();
        
        apiRequest(Links.api.server.ip, 'PUT', { ...this.state.editServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            editServerModal: {
                ...this.state.editServerModal,
                ...a
            } }), 'edited', this.setServers);
    };

    ChangeServerType = (serverType) => this.setState({ createServerModal: { ...this.state.createServerModal, data: { ...this.state.createServerModal.data, server_type: serverType } } });

    ServerType = ({ label, icon, disabled }) => (
        <div className={`${styles.serverType} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.createServerModal?.data?.server_type === label ? styles.selected : ''}`} onClick={() => this.ChangeServerType(label)}>
            {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
            <div className={styles.title}>{label}</div>
        </div>
    );

    ToggleFilter = (label, icon, edit_function, delete_function) => this.state.selectedFilters?.find((f) => f?.label === label)
        ? this.setState({ selectedFilters: this.state.selectedFilters.filter((f) => f?.label !== label) })
        : this.setState({ selectedFilters: [...this.state.selectedFilters, { label, icon, edit_function, delete_function }] });

    Filter = ({ label, icon, disabled, edit_function, delete_function }) => (
        <div className={`${styles.filter} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.selectedFilters?.find((f) => f.label === label) ? styles.selected : ''}`} onClick={() => this.ToggleFilter(label, icon, edit_function, delete_function)}>
            {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
            <div className={styles.title}>{label}</div>
        </div>
    );

    Server = ({ id, nickname, status, ip_address, icon, edit_function, delete_function }) => (
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
                    <Button className={styles.button} icon={Edit} onClick={() => this.showEditServer({ id, nickname, ip_address, edit_function })} label='Edit' disabled={this.state.elementsDisabled} />
                    <Button className={styles.deleteButton} icon={Delete} onClick={() => this.showDeleteServer({ id, nickname, ip_address, delete_function })} label='Delete' disabled={this.state.elementsDisabled} />
                </div>
            </div>
        </div>
    );

    state = {
        loading: false,
        user: {},
        servers: [],
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
            type: 'ip',
            edit_function: this.submitEditIPServer,
            delete_function: this.submitDeleteIPServer
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
        this.setServers();
        setUser((a) => this.setState(a), Router, Links.login);
        this.SetFilters(['IP Address', 'Discord Bot', 'Roblox Game', 'Linux OS', 'FiveM']);
    };

    render = () => {
        const ServerTypes = this.ServerTypes;

        useEffect(() => {
            const _setServers = setInterval(this.setServers, 5000);
            return () => clearInterval(_setServers);
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
                        <Button className={styles.deleteButton} onClick={this.state?.deleteServerModal?.data?.delete_function} label='Delete' disabled={this.state.elementsDisabled} />
                        <Button className={styles.button} onClick={this.hideDeleteServer} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Nickname</label>
                        <Input className={styles.input} value={this.state.deleteServerModal?.data?.nickname} name='nickname' type='text' disabled={true} />
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
                <div className={styles.servers}>{this.state.selectedFilters?.map(({ icon, type, label, edit_function, delete_function }) => {
                    const servers = this.state.servers.filter((s) => s?.type === type);

                    if (servers) return (
                        <div className={styles.container}>
                            {servers?.length > 0 && (<div className={styles.title}>{label}</div>)}
                            <div className={styles.server_list}>{servers?.sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)?.sort((a) => a?.status ? ['OFFLINE', 'PENDING'].includes(a?.status) && -1 : 0)?.map((server) => this.Server({ ...server, icon, edit_function, delete_function }))}</div>
                        </div>
                    );
                })}</div>
            </Layout>
        );
    };
};