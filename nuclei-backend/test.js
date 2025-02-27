const rawData = `
[waf-detect:apachegeneric] [http] [info] http://172.28.7.80/DVWA
[ssh-auth-methods] [javascript] [info] 172.28.7.80:22 ["["publickey","password"]"]
[ssh-password-auth] [javascript] [info] 172.28.7.80:22
[ssh-server-enumeration] [javascript] [info] 172.28.7.80:22 ["SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.8"]
[ssh-sha1-hmac-algo] [javascript] [info] 172.28.7.80:22
[openssh-detect] [tcp] [info] 172.28.7.80:22 ["SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.8"]
[git-config] [http] [medium] http://172.28.7.80/DVWA/.git/config

`;

const regex = /\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*?) (\[.*\])?/;
let match;
const results = [];

while ((match = regex.exec(rawData)) !== null) {
    results.push({
        name: match[1],           // Vulnerability name
        protocol: match[2],       // Protocol (http)
        severity: match[3],       // Severity (info)
        target: match[4].trim()   // Target URL/IP
    });
}

console.log(results);
