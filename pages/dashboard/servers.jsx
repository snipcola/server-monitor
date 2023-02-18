import styles from './servers.module.sass';
import Layout from '../../components/dashboard/layout.jsx';
import { Component, useEffect } from 'react';
import Router from 'next/router';
import Links from '../../lib/links';
import Button from '../../components/button.mdx';
import Alert from '../../components/alert.mdx';
import Input from '../../components/input.mdx';
import Modal from '../../components/dashboard/modal.jsx';
import { faServer as Servers, faGamepad as Roblox, faSync as Refresh, faSatelliteDish as IpAddress, faQuestionCircle as NoImage, faCircleExclamation as Error, faCheckCircle as Check, faCheck as CheckAlt, faTrashAlt as Delete, faPencil as Edit, faPlusCircle, faPowerOff, faSync, faCogs as Execute } from '@fortawesome/free-solid-svg-icons';
import { faLinux as Linux } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { apiRequest, setUser } from '../../lib/functions';

import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

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
        robloxGameStats: [],
        linuxServerStats: [],
        elementsDisabled: false,
        createServerModal: this.defaultCreateServerModal,
        deleteServerModal: this.defaultDeleteServerModal,
        editServerModal: this.defaultEditServerModal,
        fivemExecute: ''
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

    changeFivemExecute = (e) => this.setState({ ...this.state, fivemExecute: e?.target?.value });

    changeEditServer = (e) => {
        const { name, value } = e.target;

        this.setState({ editServerModal: { ...this.state.editServerModal, data: { ...this.state.editServerModal?.data, [name]: value } } });
    };

    setServers = async () => {
        const [ipServers, robloxServers, linuxServers, fivemServers] = await Promise.all([
            new Promise((res) => apiRequest(Links.api.servers.ip, 'GET', null, null, null, (data) => res(data?.servers ?? []))),
            new Promise((res) => apiRequest(Links.api.servers.roblox, 'GET', null, null, null, (data) => res(data?.servers ?? []))),
            new Promise((res) => apiRequest(Links.api.servers.linux, 'GET', null, null, null, (data) => res(data?.servers ?? []))),
            new Promise((res) => apiRequest(Links.api.servers.fivem, 'GET', null, null, null, (data) => res(data?.servers ?? [])))
        ]);

        this.setState({
            ipServerResponseTimes: ipServers?.map(({ id, response_time }) => {
                const response_times = this?.state?.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times ?? [];

                return { id, response_times: [...(response_times?.length > 5 ? response_times?.splice(1, response_times?.length) : response_times), response_time] };
            }),
            robloxGameStats: robloxServers?.map(({ id, visits, playing, likes, dislikes }) => {
                const _visits = this?.state?.robloxGameStats?.find((v) => v?.id === id)?.visits ?? [];
                const _playing = this?.state?.robloxGameStats?.find((v) => v?.id === id)?.playing ?? [];
                const _likes = this?.state?.robloxGameStats?.find((v) => v?.id === id)?.likes ?? [];
                const _dislikes = this?.state?.robloxGameStats?.find((v) => v?.id === id)?.dislikes ?? [];

                return {
                    id,
                    visits: [...(_visits?.length > 5 ? _visits?.splice(1, _visits?.length) : _visits), visits],
                    playing: [...(_playing?.length > 5 ? _playing?.splice(1, _playing?.length) : _playing), playing],
                    likes: [...(_likes?.length > 5 ? _likes?.splice(1, _likes?.length) : _likes), likes],
                    dislikes: [...(_dislikes?.length > 5 ? _dislikes?.splice(1, _dislikes?.length) : _dislikes), dislikes]
                };
            }),
            linuxServerStats: linuxServers?.map(({ id, cpu_usage, cpu_temperature, ram_usage, disk_used }) => {
                const _cpu_usage = this?.state?.linuxServerStats?.find((v) => v?.id === id)?.cpu_usage ?? [];
                const _cpu_temperature = this?.state?.linuxServerStats?.find((v) => v?.id === id)?.cpu_temperature ?? [];
                const _ram_usage = this?.state?.linuxServerStats?.find((v) => v?.id === id)?.ram_usage ?? [];
                const _disk_used = this?.state?.linuxServerStats?.find((v) => v?.id === id)?.disk_used ?? [];

                return {
                    id,
                    cpu_usage: [...(_cpu_usage?.length > 5 ? _cpu_usage?.splice(1, _cpu_usage?.length) : _cpu_usage), cpu_usage],
                    cpu_temperature: [...(_cpu_temperature?.length > 5 ? _cpu_temperature?.splice(1, _cpu_temperature?.length) : _cpu_temperature), cpu_temperature],
                    ram_usage: [...(_ram_usage?.length > 5 ? _ram_usage?.splice(1, _ram_usage?.length) : _ram_usage), ram_usage],
                    disk_used: [...(_disk_used?.length > 5 ? _disk_used?.splice(1, _disk_used?.length) : _disk_used), disk_used]
                };
            }),
            fivemServerStats: fivemServers?.map(({ id, cpu_usage, cpu_temperature, ram_usage, disk_used }) => {
                const _cpu_usage = this?.state?.fivemServerStats?.find((v) => v?.id === id)?.cpu_usage ?? [];
                const _cpu_temperature = this?.state?.fivemServerStats?.find((v) => v?.id === id)?.cpu_temperature ?? [];
                const _ram_usage = this?.state?.fivemServerStats?.find((v) => v?.id === id)?.ram_usage ?? [];
                const _disk_used = this?.state?.fivemServerStats?.find((v) => v?.id === id)?.disk_used ?? [];

                return {
                    id,
                    cpu_usage: [...(_cpu_usage?.length > 5 ? _cpu_usage?.splice(1, _cpu_usage?.length) : _cpu_usage), cpu_usage],
                    cpu_temperature: [...(_cpu_temperature?.length > 5 ? _cpu_temperature?.splice(1, _cpu_temperature?.length) : _cpu_temperature), cpu_temperature],
                    ram_usage: [...(_ram_usage?.length > 5 ? _ram_usage?.splice(1, _ram_usage?.length) : _ram_usage), ram_usage],
                    disk_used: [...(_disk_used?.length > 5 ? _disk_used?.splice(1, _disk_used?.length) : _disk_used), disk_used]
                };
            }),
            servers: [...ipServers, ...robloxServers, ...linuxServers, ...fivemServers]
        });
    };

    submitCreateServer = (e, apiLink) => {
        e.preventDefault();

        apiRequest(apiLink, 'POST', { ...this.state.createServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            createServerModal: {
                ...this.state.createServerModal,
                ...a
            } }), 'created', this.setServers, this.hideCreateServer);
    };

    submitDeleteServer = (e) => {
        e.preventDefault();
        
        apiRequest(this.state.deleteServerModal?.data?.apiLink, 'DELETE', { ...this.state.deleteServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            deleteServerModal: {
                ...this.state.deleteServerModal,
                ...a
            } }), 'deleted', this.setServers, this.hideDeleteServer);
    };

    submitEditServer = (e) => {
        e.preventDefault();
        
        apiRequest(this.state.editServerModal?.data?.apiLink, 'PUT', { ...this.state.editServerModal?.data, auth_token: this.state.user?.auth_token }, (a) => this.setState({
            editServerModal: {
                ...this.state.editServerModal,
                ...a
            } }), 'edited', this.setServers, this.hideEditServer);
    };

    linuxServerShutdown = (e, id) => {
        e.preventDefault();
        
        apiRequest(Links.api.server.linuxShutdown, 'POST', { auth_token: this.state.user?.auth_token, id }, null, null, (data, errors) => {
            if (errors?.length > 0) errors?.forEach((e) => alert(e));
            else if (data?.success) alert('Powered off server.');
        });
    };

    linuxServerRestart = (e, id) => {
        e.preventDefault();
        
        apiRequest(Links.api.server.linuxRestart, 'POST', { auth_token: this.state.user?.auth_token, id }, null, null, (data, errors) => {
            if (errors?.length > 0) errors?.forEach((e) => alert(e));
            else if (data?.success) alert('Restarted server.');
        });
    };

    fivemServerExecute = (e, id) => {
        e.preventDefault();
        
        apiRequest(Links.api.server.fivemExecute, 'POST', { auth_token: this.state.user?.auth_token, id, command: this.state.fivemExecute ?? '' }, null, null, (data, errors) => {
            if (errors?.length > 0) errors?.forEach((e) => alert(e));
            else if (data?.success) alert('Executed command.');
        });
    };

    ChangeServerType = (serverType) => this.setState({ createServerModal: { ...this.state.createServerModal, data: { ...this.state.createServerModal.data, server_type: serverType } } });

    Servers = [
        {
            type: 'ip',
            title: 'IP Address',
            icon: IpAddress,
            sort: (servers) => servers
                .sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)
                .sort((a) => a?.status ? ['OFFLINE', 'PENDING'].includes(a?.status) && -1 : 0)
                .sort((a) => a?.monitoring ? ['TRUE'].includes(a?.monitoring) && -1 : 0),
            viewData: ({ id, monitoring, ip_address, status }) => (
                <div className={styles.list}>
                    <div className={styles.data}>
                        <p className={styles.label}>Id</p>
                        <p className={styles.value}>{id}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Monitoring</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[monitoring?.toLowerCase() === 'true' ? 'green' : monitoring?.toLowerCase() === 'false' ? 'red' : 'orange']}`}>{monitoring?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Status</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[status?.toLowerCase() === 'online' ? 'green' : status?.toLowerCase() === 'offline' ? 'red' : 'orange']}`}>{status?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>IP Address</p>
                        <p className={styles.value}>{ip_address}</p>
                    </div>
                    <div className={styles.data} style={{ flexDirection: 'column' }}>
                        <p className={styles.label}>Response Time (ms)</p>
                        <this.BarChart data={{
                            labels: this.state.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times?.map((r) => `${r}ms`),
                            datasets: [{
                                label: "Response Time",
                                fill: true,
                                data: this.state.ipServerResponseTimes?.find((srt) => srt?.id === id)?.response_times,
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
            type: 'roblox',
            title: 'Roblox Game',
            icon: Roblox,
            sort: (servers) => servers
                .sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)
                .sort((a) => a?.monitoring ? ['TRUE'].includes(a?.monitoring) && -1 : 0),
            viewData: ({ id, monitoring, place_id, universe_id, name, description, creator_name, creator_type, price, copying_allowed, max_players, game_created, game_updated, genre, favorites }) => (
                <div className={`${styles.list} ${styles.fill}`}>
                     <div className={styles.data}>
                        <p className={styles.label}>Id</p>
                        <p className={styles.value}>{id}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Monitoring</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[monitoring?.toLowerCase() === 'true' ? 'green' : monitoring?.toLowerCase() === 'false' ? 'red' : 'orange']}`}>{monitoring?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Place ID</p>
                        <p className={styles.value}>{place_id}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Universe ID</p>
                        <p className={styles.value}>{universe_id}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Name</p>
                        <p className={`${styles.value} ${name === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{name}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Description</p>
                        <p className={`${styles.value} ${description === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{description}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Creator Name</p>
                        <p className={`${styles.value} ${creator_name === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{creator_name}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Creator Type</p>
                        <p className={`${styles.value} ${creator_type === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{creator_type}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Price</p>
                        <p className={`${styles.value} ${price === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{price}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Copying Enabled</p>
                        <p className={`${styles.value} ${copying_allowed === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{copying_allowed}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Max Players</p>
                        <p className={`${styles.value} ${max_players === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{max_players}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Game Created</p>
                        <p className={`${styles.value} ${game_created === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{game_created}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Game Updated</p>
                        <p className={`${styles.value} ${game_updated === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{game_updated}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Genre</p>
                        <p className={`${styles.value} ${genre === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{genre}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Favorites</p>
                        <p className={styles.value}>{favorites}</p>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.barChart}>
                            <p className={styles.label}>Visits</p>
                            <this.BarChart data={{
                                labels: this.state.robloxGameStats?.find((s) => s?.id === id)?.visits?.map((r) => `${r.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} Visits`),
                                datasets: [{
                                    label: "Visits",
                                    fill: true,
                                    data: this.state.robloxGameStats?.find((s) => s?.id === id)?.visits,
                                }]
                            }} />
                        </div>
                        <div className={styles.barChart}>
                            <p className={styles.label}>Players</p>
                            <this.BarChart data={{
                                labels: this.state.robloxGameStats?.find((s) => s?.id === id)?.playing?.map((r) => `${r.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} Players`),
                                datasets: [{
                                    label: "Players",
                                    fill: true,
                                    data: this.state.robloxGameStats?.find((s) => s?.id === id)?.playing,
                                }]
                            }} />
                        </div>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.barChart}>
                        <p className={styles.label}>Likes</p>
                            <this.BarChart data={{
                                labels: this.state.robloxGameStats?.find((s) => s?.id === id)?.likes?.map((r) => `${r.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} Likes`),
                                datasets: [{
                                    label: "Likes",
                                    fill: true,
                                    data: this.state.robloxGameStats?.find((s) => s?.id === id)?.likes,
                                }]
                            }} />
                        </div>
                        <div className={styles.barChart}>
                            <p className={styles.label}>Dislikes</p>
                            <this.BarChart data={{
                                labels: this.state.robloxGameStats?.find((s) => s?.id === id)?.dislikes?.map((r) => `${r.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} Dislikes`),
                                datasets: [{
                                    label: "Dislikes",
                                    fill: true,
                                    data: this.state.robloxGameStats?.find((s) => s?.id === id)?.dislikes,
                                }]
                            }} />
                        </div>
                    </div>
                </div>
            ),
            createContent: (
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Place Id</label>
                    <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.place_id} placeholder='0123456789' name='place_id' type='text' disabled={this.state.elementsDisabled} />
                </div>
            ),
            apiLink: Links.api.server.roblox,
            editData: ({ place_id }) => ({
                elements: { place_id },
                html: (
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Place Id</label>
                        <Input className={styles.input} value={place_id} onChange={this.changeEditServer} name='place_id' type='text' />
                    </div>
                )
            })
        },
        {
            type: 'linux',
            title: 'Linux OS',
            icon: Linux,
            sort: (servers) => servers
                .sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)
                .sort((a) => a?.monitoring ? ['TRUE'].includes(a?.monitoring) && -1 : 0),
            viewData: ({ id, monitoring, status, host, port, api_key, manufacturer, model, serial, bios_vendor, bios_serial, os_kernel, os_build }) => (
                <div className={`${styles.list} ${styles.fill}`}>
                    <div className={styles.data}>
                        <p className={styles.label}>Id</p>
                        <p className={styles.value}>{id}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Monitoring</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[monitoring?.toLowerCase() === 'true' ? 'green' : monitoring?.toLowerCase() === 'false' ? 'red' : 'orange']}`}>{monitoring?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Status</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[status?.toLowerCase() === 'online' ? 'green' : status?.toLowerCase() === 'offline' ? 'red' : 'orange']}`}>{status?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Host</p>
                        <p className={styles.value}>{host}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Port</p>
                        <p className={styles.value}>{port}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>API Key</p>
                        <p className={styles.value}>{api_key}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Manufacturer</p>
                        <p className={`${styles.value} ${manufacturer === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{manufacturer}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Model</p>
                        <p className={`${styles.value} ${model === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{model}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Serial</p>
                        <p className={`${styles.value} ${serial === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{serial}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>BIOS Vendor</p>
                        <p className={`${styles.value} ${bios_vendor === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{bios_vendor}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>BIOS Serial</p>
                        <p className={`${styles.value} ${bios_serial === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{bios_serial}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>OS Kernel</p>
                        <p className={`${styles.value} ${os_kernel === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{os_kernel}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>OS Build</p>
                        <p className={`${styles.value} ${os_build === 'PENDING' && `${styles.highlighted} ${styles.orange}`}`}>{os_build}</p>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.barChart}>
                            <p className={styles.label}>CPU Usage (%)</p>
                            <this.BarChart data={{
                                labels: this.state.linuxServerStats?.find((s) => s?.id === id)?.cpu_usage?.map((r) => `${r}% Usage`),
                                datasets: [{
                                    label: "CPU",
                                    fill: true,
                                    data: this.state.linuxServerStats?.find((s) => s?.id === id)?.cpu_usage,
                                }]
                            }} />
                        </div>
                        <div className={styles.barChart}>
                            <p className={styles.label}>CPU Temperature (°C)</p>
                            <this.BarChart data={{
                                labels: this.state.linuxServerStats?.find((s) => s?.id === id)?.cpu_temperature?.map((r) => `${r}°C Temp`),
                                datasets: [{
                                    label: "Temperature",
                                    fill: true,
                                    data: this.state.linuxServerStats?.find((s) => s?.id === id)?.cpu_temperature,
                                }]
                            }} />
                        </div>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.barChart}>
                            <p className={styles.label}>RAM Usage (%)</p>
                            <this.BarChart data={{
                                labels: this.state.linuxServerStats?.find((s) => s?.id === id)?.ram_usage?.map((r) => `${r}% Usage`),
                                datasets: [{
                                    label: "RAM",
                                    fill: true,
                                    data: this.state.linuxServerStats?.find((s) => s?.id === id)?.ram_usage,
                                }]
                            }} />
                        </div>
                        <div className={styles.barChart}>
                            <p className={styles.label}>Disk Used (MB)</p>
                            <this.BarChart data={{
                                labels: this.state.linuxServerStats?.find((s) => s?.id === id)?.disk_used?.map((r) => `${r}MB Used`),
                                datasets: [{
                                    label: "Disk Used",
                                    fill: true,
                                    data: this.state.linuxServerStats?.find((s) => s?.id === id)?.disk_used,
                                }]
                            }} />
                        </div>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Options</p>
                        <div className={styles.buttons}>
                            <Button className={styles.button} icon={faPowerOff} onClick={(e) => this.linuxServerShutdown(e, id)} label='Shutdown' disabled={this.state.elementsDisabled} />
                            <Button className={styles.button} icon={faSync} onClick={(e) => this.linuxServerRestart(e, id)} label='Restart' disabled={this.state.elementsDisabled} />
                        </div>
                    </div>
                </div>
            ),
            createContent: (
                <div>
                    <h5 className={styles.label}>Install the connector on your server using <a className={styles.link} href={Links.guides.linuxConnector} target='_blank'>📝 our guide.</a></h5>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Host</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.host} placeholder='127.0.0.1' name='host' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Port</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.port} placeholder='8080' name='port' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>API Key</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.api_key} placeholder='e2428073-b72d-433f-b53d-f985a670f85e' name='api_key' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                </div>
            ),
            apiLink: Links.api.server.linux,
            editData: ({ host, port, api_key }) => ({
                elements: { host, port, api_key },
                html: (
                    <div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>Host</label>
                            <Input className={styles.input} value={host} onChange={this.changeEditServer} name='host' type='text' />
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>Port</label>
                            <Input className={styles.input} value={port} onChange={this.changeEditServer} name='port' type='text' />
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>API Key</label>
                            <Input className={styles.input} value={api_key} onChange={this.changeEditServer} name='api_key' type='text' />
                        </div>
                    </div>
                )
            })
        },
        {
            type: 'fivem',
            title: 'FiveM',
            icon: NoImage,
            sort: (servers) => servers
                .sort((a, b) => a?.nickname ? a?.nickname?.localeCompare(b?.nickname) : 0)
                .sort((a) => a?.monitoring ? ['TRUE'].includes(a?.monitoring) && -1 : 0),
            viewData: ({ id, monitoring, status, host, port, api_key, players }) => (
                <div className={`${styles.list} ${styles.fill}`}>
                    <div className={styles.data}>
                        <p className={styles.label}>Id</p>
                        <p className={styles.value}>{id}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Monitoring</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[monitoring?.toLowerCase() === 'true' ? 'green' : monitoring?.toLowerCase() === 'false' ? 'red' : 'orange']}`}>{monitoring?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Status</p>
                        <p className={`${styles.value} ${styles.highlighted} ${styles[status?.toLowerCase() === 'online' ? 'green' : status?.toLowerCase() === 'offline' ? 'red' : 'orange']}`}>{status?.toUpperCase() ?? 'UNFETCHABLE'}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Host</p>
                        <p className={styles.value}>{host}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Port</p>
                        <p className={styles.value}>{port}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>API Key</p>
                        <p className={styles.value}>{api_key}</p>
                    </div>
                    <div className={styles.data}>
                        <p className={styles.label}>Players</p>
                        <p className={styles.value}>{players}</p>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.barChart}>
                            <p className={styles.label}>CPU Usage (%)</p>
                            <this.BarChart data={{
                                labels: this.state.fivemServerStats?.find((s) => s?.id === id)?.cpu_usage?.map((r) => `${r}% Usage`),
                                datasets: [{
                                    label: "CPU",
                                    fill: true,
                                    data: this.state.fivemServerStats?.find((s) => s?.id === id)?.cpu_usage,
                                }]
                            }} />
                        </div>
                        <div className={styles.barChart}>
                            <p className={styles.label}>CPU Temperature (°C)</p>
                            <this.BarChart data={{
                                labels: this.state.fivemServerStats?.find((s) => s?.id === id)?.cpu_temperature?.map((r) => `${r}°C Temp`),
                                datasets: [{
                                    label: "Temperature",
                                    fill: true,
                                    data: this.state.fivemServerStats?.find((s) => s?.id === id)?.cpu_temperature,
                                }]
                            }} />
                        </div>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.barChart}>
                            <p className={styles.label}>RAM Usage (%)</p>
                            <this.BarChart data={{
                                labels: this.state.fivemServerStats?.find((s) => s?.id === id)?.ram_usage?.map((r) => `${r}% Usage`),
                                datasets: [{
                                    label: "RAM",
                                    fill: true,
                                    data: this.state.fivemServerStats?.find((s) => s?.id === id)?.ram_usage,
                                }]
                            }} />
                        </div>
                        <div className={styles.barChart}>
                            <p className={styles.label}>Disk Used (MB)</p>
                            <this.BarChart data={{
                                labels: this.state.fivemServerStats?.find((s) => s?.id === id)?.disk_used?.map((r) => `${r}MB Used`),
                                datasets: [{
                                    label: "Disk Used",
                                    fill: true,
                                    data: this.state.fivemServerStats?.find((s) => s?.id === id)?.disk_used,
                                }]
                            }} />
                        </div>
                    </div>
                    <div className={styles.data}>
                        <Input className={`${styles.terminal} ${styles.input}`} onChange={this.changeFivemExecute} name='terminal' type='text' placeholder='Command' disabled={this.state.elementsDisabled} />
                        <Button className={styles.greenButton} icon={Execute} onClick={(e) => this.fivemServerExecute(e, id)} label='Execute' disabled={this.state.elementsDisabled} />
                    </div>
                </div>
            ),
            createContent: (
                <div>
                    <h5 className={styles.label}>Install the connector on your server using <a className={styles.link} href={Links.guides.fivemConnector} target='_blank'>📝 our guide.</a></h5>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Host</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.host} placeholder='127.0.0.1' name='host' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>Port</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.port} placeholder='8080' name='port' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>API Key</label>
                        <Input className={styles.input} onChange={this.changeCreateServer} value={this.state.createServerModal?.data?.api_key} placeholder='7540f3ef-6c30-4813-9bfe-4e39f2b69679' name='api_key' type='text' disabled={this.state.elementsDisabled} />
                    </div>
                </div>
            ),
            apiLink: Links.api.server.fivem,
            editData: ({ host, port, api_key }) => ({
                elements: { host, port, api_key },
                html: (
                    <div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>Host</label>
                            <Input className={styles.input} value={host} onChange={this.changeEditServer} name='host' type='text' />
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>Port</label>
                            <Input className={styles.input} value={port} onChange={this.changeEditServer} name='port' type='text' />
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>API Key</label>
                            <Input className={styles.input} value={api_key} onChange={this.changeEditServer} name='api_key' type='text' />
                        </div>
                    </div>
                )
            })
        }
    ];

    Filters = this.Servers?.map(({ title, icon, disabled }) => ({ title, icon, disabled }));

    ToggleFilter = (title) => this.setState({ filters: [this.Filters?.find((f) => f?.title === title)] });

    Filter = ({ title, icon, disabled }) => (
        <div className={`${styles.filter} ${(disabled || this.state.elementsDisabled) ? styles.disabled : ''} ${this.state.filters?.find((f) => f.title === title) ? styles.selected : ''}`} onClick={() => this.ToggleFilter(title)}>
            {icon && <div className={styles.iconContainer}><Icon className={styles.icon} icon={icon} /></div>}
            <div className={styles.title}>{title}</div>
        </div>
    );

    Server = ({ type, icon, id, nickname, viewData, apiLink, editData }) => (
        <div className={`${styles.server} ${styles[type]}`}>
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

    BarChart = ({ data }) => <Line data={data} options={{
        plugins: {
            legend: {
                display: false
            }
        }
    }} />;

    componentDidMount = () => {
        this.setServers();
        setUser((a) => this.setState(a), Router, Links.login);
        this.setState({ filters: [this.Filters.find((f) => f.title === 'IP Address')] })
    };

    render = () => {
        useEffect(() => {
            const _setServers = setInterval(this.setServers, 15000);
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
                            <Button className={styles.greenButton} icon={faPlusCircle} onClick={(e) => this.submitCreateServer(e, this.Servers.find((st) => st?.title === this.state.createServerModal?.data?.server_type)?.apiLink)} label='Monitor Server' disabled={this.state.elementsDisabled} />
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
                            {<div className={styles.server_list}>
                                {
                                    (type && sort && viewData && apiLink && editData)
                                        && sort(servers).map((server) => this.Server({ type, icon, id: server?.id, nickname: server?.nickname, viewData: viewData(server), apiLink, editData: editData(server) }))
                                }
                            </div>}
                        </div>
                    );
                })}</div>
            </Layout>
        );
    };
};