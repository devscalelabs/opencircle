#!/bin/bash

docker compose pull
docker compose down
docker compose up -d
