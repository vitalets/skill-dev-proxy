#!/bin/sh

# Exit on any error
set -euo pipefail

IMAGE=cr.yandex/crp1c0nf1r638orpn1a6/skill-dev-proxy:latest
SA=ajeqgai6bbrmtbluccs4

# npm run lint
# npm t
npm run build

docker build . \
  --platform linux/amd64 \
  --target production \
  -t $IMAGE

docker push $IMAGE

yc serverless container revision deploy \
  --container-name skill-dev-proxy \
  --image $IMAGE \
  --cores 1 \
  --memory 128M \
  --concurrency 16 \
  --execution-timeout 5s \
  --service-account-id $SA \
  --environment AWS_LAMBDA_RUNTIME_API=1
