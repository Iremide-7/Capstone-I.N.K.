const rawData = `
[waf-detect:apachegeneric] [http] [info] https://vulnerableapp.com
[rdap-whois:status] [http] [info] https://rdap.verisign.com/com/v1/domain/vulnerableapp.com ["client transfer prohibited"]
[rdap-whois:registrationDate] [http] [info] https://rdap.verisign.com/com/v1/domain/vulnerableapp.com ["2006-12-29T07:02:27Z"]
[rdap-whois:lastChangeDate] [http] [info] https://rdap.verisign.com/com/v1/domain/vulnerableapp.com ["2024-10-30T07:34:41Z"]
[rdap-whois:expirationDate] [http] [info] https://rdap.verisign.com/com/v1/domain/vulnerableapp.com ["2027-12-29T07:02:27Z"]
[rdap-whois:nameServers] [http] [info] https://rdap.verisign.com/com/v1/domain/vulnerableapp.com ["DNS.HOSTSPLUS.COM","DNS2.HOSTSPLUS.COM"]
[rdap-whois:secureDNS] [http] [info] https://rdap.verisign.com/com/v1/domain/vulnerableapp.com ["false"]
[robots-txt-endpoint] [http] [info] https://vulnerableapp.com/robots.txt
[http-missing-security-headers:x-content-type-options] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:referrer-policy] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:clear-site-data] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:cross-origin-embedder-policy] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:cross-origin-opener-policy] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:content-security-policy] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:permissions-policy] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:x-frame-options] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:strict-transport-security] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:x-permitted-cross-domain-policies] [http] [info] https://vulnerableapp.com
[http-missing-security-headers:cross-origin-resource-policy] [http] [info] https://vulnerableapp.com
[openssh-detect] [tcp] [info] 172.28.7.80:22 ["SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.8"]


`;

const regex1 = /^\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] ([^\[]+)$/gm; // basic format
const regex2 = /^\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] ([^\[]+)\s+\["([^\]]+)"\]$/gm; // format with version or extra data

let match;
const results = [];

// Function to handle matches and add them to the results array
const handleMatch = (match, isWithVersion = false) => {
    const result = {
        name: match[1],           // Vulnerability name
        protocol: match[2],       // Protocol (http)
        target: match[4].trim(),  // Target URL/IP
    };
    if (isWithVersion) {
        result.version8 = match[5]; // Extra version or data
    }
    results.push(result);
};

// First regex: match vulnerabilities without version data
while ((match = regex1.exec(rawData)) !== null) {
    handleMatch(match);
}

// Second regex: match vulnerabilities with version data
while ((match = regex2.exec(rawData)) !== null) {
    handleMatch(match, true);
}

console.log(results);
