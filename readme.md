# Helium Decoders & Node-Red Integration

## Decoders

[Dragino LDDS75](ldds75.js)
[Dragino LHT65](lht65.js)
[Moko LW001](lw0001.js)
[Moko LW004 PB](lw004-pb.js)
[RAK 7200](rak7200.js)
[Oyster](oyster.js)

## Console - NodeRed - InfluxDB

### AWS

Using AWS EC2 to run Mosquitto & NodeRed

### Node-Red

```
sudo yum update -y
sudo yum install -y nodejs
sudo npm install -g --unsafe-perm node-red
node-red
```

```
sudo npm install -g pm2
pm2 start `which node-red` -- -v
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

```
pm2 list
```

### Mosquitto

```
sudo yum install -y yum-utils
sudo wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo rpm -ivh epel-release-latest-7.noarch.rpm
sudo yum -y install mosquitto
```

```
sudo systemctl start mosquitto
```

```
sudo systemctl enable mosquitto
```

```
sudo systemctl status mosquitto

```

```
sudo nano /etc/mosquitto/mosquitto.conf
sudo systemctl restart mosquitto

```

```
sudo mosquitto_passwd -c /etc/mosquitto/passwd your_username
sudo mosquitto_passwd /etc/mosquitto/passwd another_username
```

## Node-Red Flow

[node-red-contrib-influxdb](https://github.com/mblackstock/node-red-contrib-influxdb)
_Node-RED nodes to write and query data from an InfluxDB time series database._
