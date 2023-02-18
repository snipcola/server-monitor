import styles from './header.module.sass';
import Image from 'next/image';
import NextLink from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars as Bars } from '@fortawesome/free-solid-svg-icons';
import LoginButtons from './loginButtons.mdx';
import Button from './button.mdx';
import Container from './container.mdx';

export const Link = ({ label, link, icon }) => (
    <NextLink href={link ?? ''}>
        <button className={styles.link}>
            {label}
            {icon && <Icon className={styles.icon} icon={icon} />}
        </button>
    </NextLink>
);


export default (props) => {
    const [mobileHeaderActive, setMobileHeaderActive] = useState(false);

    const toggleMobileHeader = () => setMobileHeaderActive(!mobileHeaderActive);

    return (
        <div>
            {props.loading && <div className={styles.loading}><div className={styles.bar} /></div>}

            <Container containerClass={styles.header}>
                <NextLink href='/'>
                    <Image className={styles.brand} src='/icon_full.svg' width={244} height={35} priority  />
                </NextLink>

                <div className={styles.buttons}>
                    <LoginButtons />
                    <Button icon={Bars} variant='text' style={{ padding: '0.6rem 1rem' }} noMargin onClick={toggleMobileHeader} />
                </div>
            </Container>

            {mobileHeaderActive && <div className={styles.headerMobile}>
                <div className={styles.buttons}><LoginButtons /></div>
            </div>}
        </div>
    );
};