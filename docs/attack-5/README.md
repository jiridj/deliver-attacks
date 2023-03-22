# Enumerate orders

## Attempt 1

Try different ways of calling the user endpoint with another user's email address. In real life a penetration tester (or attacker) would create multiple accounts for testing. Here you can use one of the pre-loaded users. Odille won't mind if you use their account: `overrillo0@redcross.org` and password `QkYvxNZUiP`.

- try `/user/overrillo0@redcross.org` -> fails
- try `/user?email=overrillo0@redcross.org` -> fails

## Attempt 2

- try `/order/1` -> success
- try `/order/2` -> success
- show that the user's email address is in the order info