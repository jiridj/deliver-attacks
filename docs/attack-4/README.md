# Brute force password reset

Instead of trying to crack a user's password, attackers can try to reset their password and gain access that way. Most password reset flows generate a link that is emailed to the user's email address and that can be used only once and for a limited amount of time. The link is actually a combination of user identification information - ususally the email address for the account - and a secret or one-time password. The secret is often a unique token. 

In the DELIVER application, the reset password flow generates a four digit pin code, which forms a unique combination with the email address. I've deliberatly kept the mechanism simple, for demo purposes. Real-life applications typically use secrets that are harder to crack. 

As there is no rate limiting on the API endpoint, we can brute force the password reset by cycling through all possible pin code combinations. With four digits there are only 10k possibilities. The deliver script has a function to attack the `PUT /auth/reset` API endpoint and try all options until successful.

```bash
deliver resetpwd cdonnell5@desdev.cn
______ _____ _     _____ _   _ ___________
|  _  \  ___| |   |_   _| | | |  ___| ___ \
| | | | |__ | |     | | | | | | |__ | |_/ /
| | | |  __|| |     | | | | | |  __||    /
| |/ /| |___| |_____| |_\ \_/ / |___| |\ \
|___/ \____/\_____/\___/ \___/\____/\_| \_|


Attacking http://192.168.1.23:3333/auth/reset

[==================================================] 100% 0.0s

Duration: 36.2 secs
Password for cdonnell5@desdev.cn is now youhavebeenpwned
```

We can now reset the password for any account that we have been able to identify earlier. We have full access to these accounts, including their PII and payment information. 

In this example we've seen another occurrence of [OWASP API top 10](https://owasp.org/www-project-api-security/) vulnerabilities:

- [API2-2019: Broken User Authentication](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa2-broken-user-authentication.md) when an attacker succeed in cracking the pin code and resetting the password.
- [API4-2019: Lack of Resources & Rate Limiting](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa4-lack-of-resources-and-rate-limiting.md) as there is no restriction on how many times you can try to reset the password.