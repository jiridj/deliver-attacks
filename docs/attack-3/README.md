# Try to guess the password

Instead of trying to crack hashes and secrets (see [attack #1](../attack-1/README.md)) we can try to guess a user's password. We've identified six registered email addresses in [attack #2](../attack-2/README.md1) and we'll see if we can get in. 

As we know the password requirements, we could try to brute force the password. But this would be a very costly and time consuming operation because of the sheer amount of possible passwords. 

```math
lower case: 26
upper case: 26
minimum length: 6
maximum length: 12

max^(lower + upper) - min^(lower + upper) = number of combinations
12^52 - 6^52 = 390,877,006,466,479,583,232
```

Instead attackers often try dictionary attacks. [Rockyou.txt](https://www.kaggle.com/datasets/wjburns/common-password-list-rockyoutxt) is a well-known asset that contains commonly used passwords and passwords that were previously leaked in breaches. It received its name because its orgin lies in the infamous [RockYou data breach](https://techcrunch.com/2009/12/14/rockyou-hack-security-myspace-facebook-passwords) in 2009. The latest iteration contains over 8.4 billion unique credentials, but is massive size renders it less useful. The most commonly used version is the 2019 version which contains over 14 million unique credentials.

We could try all passwords in the dictionary one-by-one agains each of the discovered accounts. Another option is to do password spraying. This means that you try all the discovered accounts against each password. A side effect of this is that you may circumvent any rate limiting per username as you cycle through lots of usernames before trying the next password. Either way will work here as there is no rate limiting, but this script applies the spraying technique. For this demo we're working with a small extract here that contains 1000 passwords. Running the script with the full list would take too much time.

```bash
deliver rockyou ./found.txt
______ _____ _     _____ _   _ ___________
|  _  \  ___| |   |_   _| | | |  ___| ___ \
| | | | |__ | |     | | | | | | |__ | |_/ /
| | | |  __|| |     | | | | | |  __||    /
| |/ /| |___| |_____| |_\ \_/ / |___| |\ \
|___/ \____/\_____/\___/ \___/\____/\_| \_|


Attacking http://192.168.1.23:3333/auth/login
Spraying 1000 passwords across 6 email addresses


[==================================================] 100% 0.0s

Duration: 136.387 secs
Found 2 credentials

hhalward6@google.nl,qwerty1
odettmar4@salon.com,scoobydoo
```

In this example we've seen another occurrence of an [OWASP API top 10](https://owasp.org/www-project-api-security/) vulnerability:

- [API4-2019: Lack of Resources & Rate Limiting](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa4-lack-of-resources-and-rate-limiting.md) as there is no restriction on how many times you can try to log in.

We've been able to identify two accounts that use weak passwords that are listed in rockyou.txt. We now have full access to these two user accounts, including their PII and payment information.