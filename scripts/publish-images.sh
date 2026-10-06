#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
DOCKERHUB_NAMESPACE="${DOCKERHUB_NAMESPACE:-}"
VITE_API_URL="${VITE_API_URL:-/api}"

if [[ -z "$VERSION" || ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: DOCKERHUB_NAMESPACE=<username> $0 v1.0.0" >&2
  exit 1
fi

if [[ -z "$DOCKERHUB_NAMESPACE" ]]; then
  echo "DOCKERHUB_NAMESPACE is required." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit changes before publishing images." >&2
  exit 1
fi

COMMIT_SHA="$(git rev-parse HEAD)"
SHA_TAG="sha-${COMMIT_SHA}"
CLIENT_IMAGE="${DOCKERHUB_NAMESPACE}/spendnest-client"
SERVER_IMAGE="${DOCKERHUB_NAMESPACE}/spendnest-server"

printf 'Building client tags: %s:%s, %s:%s, %s:latest\n' "$CLIENT_IMAGE" "$VERSION" "$CLIENT_IMAGE" "$SHA_TAG" "$CLIENT_IMAGE"
docker build --pull \
  --build-arg "VITE_API_URL=${VITE_API_URL}" \
  -t "${CLIENT_IMAGE}:${VERSION}" \
  -t "${CLIENT_IMAGE}:${SHA_TAG}" \
  -t "${CLIENT_IMAGE}:latest" \
  ./client

echo "Building server tags: ${SERVER_IMAGE}:${VERSION}, ${SERVER_IMAGE}:${SHA_TAG}, ${SERVER_IMAGE}:latest"
docker build --pull \
  -t "${SERVER_IMAGE}:${VERSION}" \
  -t "${SERVER_IMAGE}:${SHA_TAG}" \
  -t "${SERVER_IMAGE}:latest" \
  ./server

for tag in "$VERSION" "$SHA_TAG" latest; do
  docker push "${CLIENT_IMAGE}:${tag}"
  docker push "${SERVER_IMAGE}:${tag}"
done

echo "Published ${VERSION} and ${SHA_TAG} for both images."
