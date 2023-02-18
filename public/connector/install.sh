declare -A osInfo;
osInfo[/etc/redhat-release]=yum
osInfo[/etc/arch-release]=pacman
osInfo[/etc/gentoo-release]=emerge
osInfo[/etc/SuSE-release]=zypp
osInfo[/etc/debian_version]=apt-get
osInfo[/etc/alpine-release]=apk

for f in ${!osInfo[@]}
do
    if [[ -f $f ]];then
        clear
        echo Installing NodeJS.

        sudo ${osInfo[$f]} remove -y nodejs
        sudo ${osInfo[$f]} remove -y npm
        sudo ${osInfo[$f]} autoremove -y
        sudo ${osInfo[$f]} install -y curl
        curl -sL https://deb.nodesource.com/setup_19.x | sudo -E bash -
        sudo ${osInfo[$f]} install -y nodejs
        sudo ${osInfo[$f]} install -y npm

        clear
        echo Installing PM2.

        sudo npm install -g pm2
        sudo pm2 startup

        clear
        echo Installing connector.

        sudo ${osInfo[$f]} install -y git
        sudo rm -rf /opt/connector
        sudo git clone https://github.com/snipcola/sm-connector.git /opt/connector

        cd /opt/connector
        sudo npm install
        sudo pm2 start --name "sm-connector" index.js
        sudo pm2 save

        clear
        echo Installed connector.

        clear
        sudo pm2 logs
    fi
done