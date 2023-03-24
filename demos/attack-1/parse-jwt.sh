#!/bin/sh
token=$(cat stolen-jwt.txt)
python3 jwt_tool.py $token