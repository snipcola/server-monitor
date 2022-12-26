import styles from './servers.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import { Component, useEffect } from 'react';
import Router from 'next/router';
import Links from '../../lib/links';
import Button from '../../components/button.mdx';
import Alert from '../../components/alert.mdx';
import Input from '../../components/input.mdx';
import Modal from '../../components/dashboard/modal.jsx';
import { faServer as Servers, faSync as Refresh, faSatelliteDish as IpAddress, faQuestionCircle as NoImage, faCircleExclamation as Error, faCheckCircle as Check, faCheck as CheckAlt, faTrashAlt as Delete, faPencil as Edit } from '@fortawesome/free-solid-svg-icons';
import { faLinux as Linux } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { apiRequest, setUser } from '../../lib/functions';

import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

export default class extends Component {
    defaultCreateServerModal = {
        data: {},
        visible: false,
        errors: [],
        created: false
    };

    defaultDeleteServerModal = {
        data: {},
        visible: false,
        errors: [],
        deleted: false
    };

    defaultEditServerModal = {
        data: {},
        visible: false,
        errors: [],
        edited: false
    };

    state = {
        loading: false,
        filters: [],
        user: {},
        servers: [],
        ipServerResponseTimes: [],
        elementsDisabled: false,
        createServerModal: this.defaultCreateServerModal,
        deleteServerModal: this.defaultDeleteServerModal,
        editServerModal: this.defaultEditServerModal
    };

    showCreateServer = () => this.setState({ createServerModal: { ...this.defaultCreateServerModal, visible: true } });
    hideCreateServer = () => this.setState({ createServerModal: { ...this.defaultCreateServerModal, visible: false } });

    showDeleteServer = (data) => this.setState({ deleteServerModal: { ...this.defaultDeleteServerModal, data, visible: true } });
    hideDeleteServer = () => this.setState({ deleteServerModal: { ...this.defaultDeleteServerModal, visible: false } });

    showEditServer = (data, editData) => this.setState({ editServerModal: { ...this.defaultEditServerModal, editData: editData?.html, data: { ...data, ...editData?.elements }, visible: true } });
    hideEditServer = () => this.setState({ editServerModal: { ...this.defaultEditServerModal, visible: false } });

    changeCreateServer = (e) => {
        const { name, value } = e.target;

        this.setState({ createServerModal: { ...this.state.createServerModal, data: { ...this.state.createServerModal?.data, [name]: value } } });
    };

    changeEditServer = (e) => {
        const { name, value } = e.target;

        this.setState({ editServerModal: { ...this.state.editServerModal, data: { ...this.state.editServerModal?.data, [name]: value } } });
    };

    setServers = async () => {
        const ipServers = await new Promise((res) => apiRequest(Links.api.servers.ip, 'GET', null, null, null, (data) => res(data?.servers ?? [])));
        const servers = [...ipServers];

        this.setState({
            ipServerResponseTimes: ipServers?.map(({ id, response_time }) => {
                const response_times = this?.state?.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times ?? [];

                return { id, response_times: [...(response_times?.length > 15 ? response_times?.splice(1, response_times?.length) : response_times), response_time] };
            }),
            servers
        });
    };

    submitCreateServer = (e, apiLink) => {
        e.preventDefault();

        apiRequest(apiLink, 'POST', { ...this.state.createServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            createServerModal: {
                ...this.state.createServerModal,
                ...a
            } }), 'created', this.setServers);
    };

    submitDeleteServer = (e) => {
        e.preventDefault();
        
        apiRequest(this.state.deleteServerModal?.data?.apiLink, 'DELETE', { ...this.state.deleteServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            deleteServerModal: {
                ...this.state.deleteServerModal,
                ...a
            } }), 'deleted', this.setServers);
    };

    submitEditServer = (e) => {
        e.preventDefault();
        
        apiRequest(this.state.editServerModal?.data?.apiLink, 'PUT', { ...this.state.editServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            editServerModal: {
                ...this.state.editServerModal,
                ...a
            } }), 'edited', this.setServers);
    };

    ChangeServerType = (serverType) => this.setState({ createServerModal: { ...this.state.createServerModal, data: { ...this.state.createServerModal.data, server_type: serverType } } });

    Servers = [
        {
            type: 'ip',
            title: 'IP Address',
            icon: IpAddress,
            sort: (servers) => servers
                .sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)
                .sort((a) => a?.status ? ['OFFLINE', 'PENDING'].includes(a?.status) && -1 : 0),
            viewData: ({ id, ip_address, status }) => (
                <div className={styles.list}>
                    <div className={styles.data}>
                        <p className={styles.label}>IP Address</p>
                        <p className={styles.value}>{ip_address}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Status</p>
                        <p className={`${styles.value} ${styles.status} ${styles[status?.toLowerCase()]}`}>{status?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data} style={{ flexDirection: 'column' }}>
                        <p className={styles.label}>Response Time (ms)</p>
                        <this.BarChart data={{
                            labels: this.state.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times?.map((r) => `${r}ms`),
                            datasets: [{
                                label: "Response Time",
                                innerWidth: .1,
                                outerWidth: .1,
                                backgroundColor: this.state.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times?.map((r) => r < 1000 ? '#6DFA94' : r < 5000 ? '#e67e22' : '#fa6d6d'),
                                data: this.state.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times
                            }]
                        }} />
                    </div>
                </div>
            ),
            createContent: (
                <div className={styles.inputContainer}>
                    <label className={styles.label}>IP Address</label>
                    <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.ip_address} placeholder='127.0.0.1 / 127.0.0.1:8080' name='ip_address' type='text' disabled={this.state.elementsDisabled} />
                </div>
            ),
            apiLink: Links.api.server.ip,
            editData: ({ ip_address }) => ({
                elements: { ip_address },
                html: (
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>IP Address</label>
                        <Input className={styles.input} value={ip_address} onChange={this.changeEditServer} name='ip_address' type='text' />
                    </div>
                )
            })
        },
        {
            title: 'Roblox Game',
            icon: NoImage,
            disabled: true
        },
        {
            title: 'Linux OS',
            icon: Linux,
            disabled: true
        },
        {
            title: 'FiveM',
            icon: NoImage,
            disabled: true
        }
    ];

    Filters = this.Servers?.map(({ title, icon, disabled }) => ({ title, icon, disabled }));

    ToggleFilter = (title) => this.state.filters?.find((f) => f?.title === title)
        ? this.setState({ filters: this.state.filters.filter((f) => f?.title !== title) })
        : this.setState({ filters: [...this.state.filters, this.Filters?.find((f) => f?.title === title)] });

    Filter = ({ title, icon, disabled }) => (
        <div className={`${styles.filter} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.filters?.find((f) => f.title === title) ? styles.selected : ''}`} onClick={() => this.ToggleFilter(title)}>
            {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
            <div className={styles.title}>{title}</div>
        </div>
    );

    Server = ({ icon, id, nickname, viewData, apiLink, editData }) => (
        <div className={styles.server}>
            <div className={styles.header}>
                <Icon className={styles.icon} icon={icon} />
                {nickname}
            </div>
            <div className={styles.seperator} />
            <div className={styles.content}>{viewData}</div>
            <div className={styles.seperator} />
            <div className={styles.footer}>
                <div className={styles.buttons}>
                    <Button className={styles.button} icon={Edit} label='Edit' onClick={() => this.showEditServer({ id, nickname, apiLink }, editData)} disabled={this.state.elementsDisabled} />
                    <Button className={styles.deleteButton} icon={Delete} label='Delete' onClick={() => this.showDeleteServer({ id, nickname, apiLink })} disabled={this.state.elementsDisabled} />
                </div>
            </div>
        </div>
    );

    BarChart = ({ data }) => <Bar data={data} options={{
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    display: false
                }
            }
        }
    }} />;

    componentDidMount = () => {
        this.setServers();
        setUser((a) => this.setState(a), Router, Links.login);
        this.setState({ filters: this.Filters })
    };

    render = () => {
        useEffect(() => {
            const _setServers = setInterval(this.setServers, 2500);
            return () => clearInterval(_setServers);
        }, [this])

        return (
            <Layout label='SERVERS' rightContent={
                <div className={styles.buttons}>
                    <Button onClick={this.setServers} className={styles.button} iconRight={Refresh} label='Refresh' variant='primary' />
                    <Button onClick={this.showCreateServer} className={styles.button} iconRight={Servers} label='Monitor Server' variant='primary' />
                </div>
            }>
                <Modal show={this.state.createServerModal.visible} title='MONITOR SERVER' footer={(
                    <div className={styles.buttons}>
                        {this.Servers.find((st) => st?.title === this.state.createServerModal?.data?.server_type) && (
                            <Button className={styles.createServerButton} icon={IpAddress} onClick={(e) => this.submitCreateServer(e, this.Servers.find((st) => st?.title === this.state.createServerModal?.data?.server_type)?.apiLink)} label='Monitor IP Address' disabled={this.state.elementsDisabled} />
                        )}
                        <Button className={styles.button} onClick={this.hideCreateServer} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                        <div className={styles.inputContainer}>
                        <label className={styles.label}>Nickname</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.nickname} placeholder='Give your server a name' name='nickname' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                    <div className={styles.selectContainer}>
                        <label className={styles.label}>Server Type</label>
                        <div className={styles.serverTypes}>{this.Filters.map(({ title, icon, disabled }) => (
                            <div className={`${styles.serverType} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.createServerModal?.data?.server_type === title ? styles.selected : ''}`} onClick={() => this.ChangeServerType(title)}>
                                {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
                                <div className={styles.title}>{title}</div>
                            </div>
                        ))}</div>
                    </div>
                    <div className={styles.content}>{this.Servers.find(({ title }) => title === this.state.createServerModal?.data?.server_type)?.createContent}</div>
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
                        <Button className={styles.editButton} onClick={this.submitEditServer} label='Edit' disabled={this.state.elementsDisabled} />
                        <Button className={styles.button} onClick={this.hideEditServer} label='Close' disabled={this.state.elementsDisabled} />
                    </div>
                )}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Nickname</label>
                        <Input className={styles.input} value={this.state.editServerModal?.data?.nickname} onChange={this.changeEditServer} name='nickname' type='text' />
                    </div>
                    {this.state.editServerModal?.editData}
                    <Alert style={{ display: this.state.editServerModal?.errors?.length == 0 ? 'none' : 'flex' }} variant='danger' icon={Error} label={(
                        <p>
                            The following errors occured:
                            {this.state.editServerModal?.errors?.map((e) => <li>{e}</li>)}
                        </p>
                    )} className={styles.alert} />
                    <Alert style={{ display: this.state.editServerModal?.edited ? 'flex' : 'none' }} variant='success' icon={Check} label={(<p>You've successfully edited the server.</p>)} className={styles.alert} />
                </Modal>
                <div className={styles.filters}>{this.Filters.map(this.Filter)}</div>
                <div className={styles.servers}>{this.Servers?.map(({ title, icon, type, sort, viewData, disabled, apiLink, editData }) => {
                    const servers = this.state.servers.filter((s) => s?.type === type);

                    if (servers && !disabled && this.state.filters?.find((f) => f?.title === title)) return (
                        <div className={styles.container}>
                            {servers?.length > 0 && (<div className={styles.title}>{title}</div>)}
                            {<div className={styles.server_list}>
                                {
                                    (type && sort && viewData && apiLink && editData)
                                        && sort(servers).map((server) => this.Server({ icon, id: server?.id, nickname: server?.nickname, viewData: viewData(server), apiLink, editData: editData(server) }))
                                }
                            </div>}
                        </div>
                    );
                })}</div>
            </Layout>
        );
    };
};