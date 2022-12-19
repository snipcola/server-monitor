import styles from './header.module.sass';
import NextLink from 'next/link';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars as Bars } from '@fortawesome/free-solid-svg-icons';
import links from '../../lib/links.js'
import { Links as SidebarLinks } from './sidebar.mdx';
import { useState } from 'react';

export const Links = [
    {
        label: 'STATUS',
        link: links.status
    },
    {
        label: 'CONTACT US',
        link: links.discord
    },
    {
        label: 'TERMS OF SERVICE',
        link: links.termsOfService
    },
    {
        label: 'PRIVACY POLICY',
        link: links.privacyPolicy
    }
];

export const Link = ({ label, link }) => <NextLink href={link}><h1 className={styles.link}>{label}</h1></NextLink>;

export default (props) => {
    const [mobileHeaderActive, setMobileHeaderActive] = useState(false);

    const toggleMobileHeader = () => setMobileHeaderActive(!mobileHeaderActive);

    return (
        <div>
            <div className={styles.header}>
                <NextLink href='/'><h1 className={styles.title}>SERVER MONITOR</h1></NextLink>
                <div className={styles.links}>{Links.map(Link)}</div>
                <div className={styles.sidebarButton}><Icon className={styles.sidebarIcon} icon={Bars} onClick={toggleMobileHeader} /></div>
            </div>

            {mobileHeaderActive && <div className={styles.headerMobile}>
                <h1 className={styles.title}>LINKS</h1>
                <div className={styles.links}>{Links.map(Link)}</div>
                <h1 className={styles.title}>DASHBOARD</h1>
                <div className={styles.links}>{SidebarLinks.map(Link)}</div>
            </div>}
        </div>
    )
};