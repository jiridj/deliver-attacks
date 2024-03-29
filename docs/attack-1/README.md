# Try to crack secrets

A common approach used by attackers is to try and compromise an invididual user's account through cross-site scripting or phishing attempts. These are elaborate attacks that require a lot of preparation with only a limited chance of success. Attackers typically only use this type of attack if they know there is money to be made from compromising the account (ransom, transfers, charges).

Imagine that we've succeeded in having a user log in via our phishing website. The DELIVER application uses JWT tokens for authentication. JWT tokens are commonly used and generally considered to be a good practice. But it is important to understand the weaknesses in JTW tokens.

## JWT tokens are encoded, not encrypted

One of the benefits of using JWT tokens is that the tokens can carry information. This simplifies application development and reduces the number of API calls that need to be made for retrieving information about the user. 

When you look at a JWT token you'll notice that the token is not human readable. It is encoded. But this does not mean it is encrypted! There is a difference. Encryption can be reversed - decrypted - only when you have the appropriate keys. Encoding can be reversed. 

[This](demos/attack-1/stolen-jwt.txt) is an example of a JWT token. You'll notice the token has three encoded parts, each separated by a `.`. This divides the token into a header, a payload and a signature. 

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2VlNzVkMzRkNWQ4YmI0MTAwNDNkN2IiLCJlbWFpbCI6Im92ZXJyaWxsbzBAcmVkY3Jvc3Mub3JnIiwicGFzc3dvcmQiOiIkMmIkMTAkSkR3dnhpVFFPVllKaGpCUXJ2QXJwLlM4VTg1RW1WaTE1VThocmM3NXYvQ0lpRmFvSzV0UzYiLCJmaXJzdF9uYW1lIjoiT2RpbGxlIiwibGFzdF9uYW1lIjoiVmVycmlsbG8iLCJhZGRyZXNzIjoiOSBEcmV3cnkgQ3Jvc3NpbmciLCJjaXR5IjoiRG9uZ2R1IiwiY291bnRyeSI6IkNoaW5hIiwicGhvbmUiOiIrODYgKDcwOSkgNzEzLTA2MzAiLCJjcmVkaXRfY2FyZCI6IjQwNDEzNzg3NTUzNzc0NzMiLCJpYXQiOjE2NzkzMjU2MzV9.MniicPtbmYAGgyxnlsw5mS7S4d1r6vxbaQLEPYBkDLY
```

You can use [jwt_tool](https://github.com/ticarpi/jwt_tool) for a lot of things, including listing token content. Alternatively you can visit [jwt.io](https://jwt.io) and paste the token there. You will see the same information. 

![jwt_tool](jwt_tool.png)

So if a JWT token can be decoded, how is it secure? When the user logs in, the token is generated and signed using a certificate or a secret key. Here we see that the algorithm used was `HS256` which means the token payload was hashed with a secret key. If you know the secret, you can verify the signature. If anyone changed the payload of the token, the signature will no longer be valid. This way JWT tokens give the server side a means to send the consumer meaningful information, but it can also ensure that no one has altered the token content.

## Too much information 

Modern development frameworks are designed to make it easier and faster for developers to build applications. Data is transmitted as JSON, encapsulated in objects for manipulation, objects are mapped to database tables and queries, etc. The speed and ease of use is great, but sometime the standard behavior is not what you want! 

```json
{
  "_id": "63ee75d34d5d8bb410043d7b",
  ...
  "password": "$2b$10$JDwvxiTQOVYJhjBQrvArp.S8U85EmVi15U8hrc75v/CIiFaoK5tS6",
  ...
  "credit_card": "4041378755377473",
  "iat": 1679325635
}
```

When you look at the parsed token, you'll notice that the payload contains too much information: 

- The `_id` is an internal identifier of the user record. It in itself isn't meaningful, but it does tell an attacker that the database is MongoDB. Knowing the type of database is useful, and will make an attacker try to attack the API by injecting code specific to MongoDB into requests. 
- The `password` is transmitted to the client! Ok, it is hashed but an attacker can now try to crack your password with [brute-force](https://en.wikipedia.org/wiki/Brute-force_attack) or [dictionary](https://en.wikipedia.org/wiki/Dictionary_attack) attacks. They may get lucky!
- The `credit_card` information should never be in the token. Sure, it makes it easy to pre-fill checkout forms etc, but it should never be sent to the consumer in clear text. 
- The token never expires. The `iat` field indicates when the token was generated by the server. An `exp` field would indicate how long the token is valid for. If there is no `exp` field, the token never expires and the attacker has all the time in the world to abuse it. 

So much information out there for the grabs. And all of that because of **a very simple mistake the developer made**. The [DELIVER API](https://github.com/jiridj/deliver-api) uses [passport.js](https://passportjs.org) to verify the user credentials against the database and then generate the token.  

```javascript
this.router.post(
  '/login',
  passport.authenticate('login', { session: false }),
  // If the login succeeds generate a JWT token and
  // send it to the client.
  (req, res) => {
    const token = jwt.sign(req.user, secret, {});
    return res.status(200).json({ token });
  },
);
``` 

You'll notice that when the token is generated, the developer passes the user object (which was fetched and attached during login) in as payload. This is what any passport.js example you have Googled will show you to do. But in a real life application you need to implement sanitization for the user object or all information ends up in the token payload. 

In this example we've seen three of the [OWASP API top 10](https://owasp.org/www-project-api-security/) vulnerabilities:

- [API2-2019: Broken User Authentication](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa2-broken-user-authentication.md) when an attacker succeed in cracking the user password or token secret.
- [API3-2019: Excessive Data Exposure](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa3-excessive-data-exposure.md) as there is too much information in the JWT token payload.
- [API7-2019: Security Misconfiguration](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa7-security-misconfiguration.md) as there is no token expiration. 

## Note: Cracking passwords 

A hashed password should never leave the server. Once an attacker has the hash, they can run algorithms offline to try and crack the hash. Luckily cracking passwords is really expensive so attackers wouldn't do this for just any reason. It needs to be economically viable. I'll illustrate how expensive it is with this example. 

An attacker can find out what the password requirements are from the signup form. The form will force you to choose a password with a certain complexity. In the DELIVER application, all users have a randomized password that is between 6 and 12 characters in length and uses lower and upper case letters only. The passwords are hashed using `bcrypt`, which can be derived from the `$2b` prefix. 

`$2b$10$JDwvxiTQOVYJhjBQrvArp.S8U85EmVi15U8hrc75v/CIiFaoK5tS6`

The `bcrypt` algorithm is expensive to compute, which is intentional. A user only logs in once in a session, so it does not really matter if it takes hundreds of milliseconds to hash. That 'cost' makes the password harder to crack.

There are open source tools - like [hashcat](https://hashcat.net/) - that will help an attacker to crack the hash. Again, they will use brute force or dictionary attacks and cycle through every possibility one by one until the hash matches. I tried cracking the password on my computer, but it isn't powerful enough to crack `bcrypt` hashes in any reasonable amount of time. Even when I cheat and restrict the options as I know that all passwords only have lower and upper case letters and are at least 6 characters long.  

```bash
hashcat -m 3200 stolen-hash.txt -w3 -a3 -1?l?u ?1?1?1?1?1?1?1?1?1?1?1?1 --increment --increment-min 6
```

You see in the output below that it performs only 110 hashes per second. With a total of (26 + 26)^12 possibilities it would take my computer 5 years and 257 days to churn through all possibilities. And that is only because the password complexity does not include digits and symbols. 

![hashcat output](./hashcat-bcrypt.png)

Obviously with specialized hardware - GPUs - you can perform a lot more hashes per second. Modern NVIDIA graphics cards can perform more that 100 million hashes a second reducing the time needed to crack this password to weeks. That hardware does cost money, consumes electricity, and the attacker needs to be sure there is a reward in the end. 

## Note: Cracking JWT tokens

Cracking the JWT tokens is a similar process as described above for cracking hashed passwords. Attackers will try to crack JWT tokens as it enables them to generate their own tokens which would be incorrectly validated by the server as authenticated requests. 

Obviously a lot depends upon the complexity of the algorithm and secret key (or certificate). The DELIVER application uses JWT tokens with the `HS256` algorithm, which is another hashing function. This algorithm is a lot less expensive because tokens get validated much more often (ideally with every API call).

Again, we can use hashcat to crack the token secret. I'm cheating a little again, because I know the secret key only has lower case characters and digits and is only six characters long. 

```bash
hashcat -m 16500 stolen-jwt.txt -w3 -a3 -1?l?d ?1?1?1?1?1?1
```

You'll notice in the output that hashcat estimates it needs only a minute to crack the token. In reality it took less time to crack the token `s3cr3t`. Hashcat performed almost 22600 kH/s for HS256, which is much faster than with bcrypt. 

![hashcat output](./hashcat-jwt.png)

With HS256 long randomized secret keys are important. The longer the key, the harder it becomes to crack. The current recommendation is to have keys that are at least 256 bits (or 32 characters) long. It is also common practice to cycle the secret key every now and then. This invalidates any previously generated tokens and renders the old secret useless. 

## Bonus: JWT_TOOL is awesome!

You can do a lot more with jwt_tool. You can use it to tamper with tokens, crack secrets, and execute different types of token attacks (none, key confusion, etc). The folks from [bug bounty platform Intigrity](https://intigrity.com) have an [excellent blog post](https://blog.intigriti.com/2021/07/27/hacker-tools-jwt_tool) on it.  