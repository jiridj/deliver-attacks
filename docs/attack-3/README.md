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

Instead attackers often try dictionary attacks. [Rockyou.txt](https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt) is a well-known asset that contains commonly used passwords and passwords that were previously leaked in breaches. It received its name because its orgin lies in the infamous [RockYou data breach](https://techcrunch.com/2009/12/14/rockyou-hack-security-myspace-facebook-passwords) in 2009. The latest iteration contains over 8.4 billion unique credentials. We're working with an older version here that has roughly 14 million passwords. 

We could try all passwords in the dictionary one-by-one agains each of the discovered accounts. Another option is to do password spraying. This means that you try all the discovered accounts against each password. A side effect of this is that you may circumvent any rate limiting per username as you cycle through lots of usernames before trying the next password. Either way will work here as there is no rate limiting. 

```bash
deliver rockyou ./found.txt
```
![deliver rockyou](deliver_rockyou.gif)

