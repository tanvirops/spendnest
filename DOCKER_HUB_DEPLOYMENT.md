# Docker Hub Deployment

This project publishes two public images:

- `DOCKERHUB_NAMESPACE/spendnest-client`
- `DOCKERHUB_NAMESPACE/spendnest-server`

The deployment machine only pulls images. It does not need the repository source code, Node.js, or a Docker build toolchain.

## 1. Create Docker Hub repositories

Create these public repositories in Docker Hub:

```text
spendnest-client
spendnest-server
```

The namespace is your Docker Hub username, for example `tanviralamdevops`.

## 2. Add GitHub configuration

Add these repository secrets:

```text
DOCKERHUB_USERNAME=<your Docker Hub username>
DOCKERHUB_TOKEN=<Docker Hub access token>
```

Create a Docker Hub access token with Read & Write permission. Store the token only as a GitHub secret.

Add this repository variable:

```text
DOCKERHUB_NAMESPACE=<your Docker Hub username>
EXPENSE_TRACKER_API_URL=/api
```

The workflow publishes these tags:

- `sha-<full-git-sha>`: immutable deployment tag used by the server
- `latest`: updated on pushes to `main`
- `v1.2.3`: created when a Git tag such as `v1.2.3` is pushed

## 3. Prepare the deployment machine

Install Docker Engine and Docker Compose v2. Create a deployment directory and copy only these files into it:

```text
docker-compose.yml
.env
```

Use this `.env` pattern:

```dotenv
DOCKERHUB_NAMESPACE=your-dockerhub-username
IMAGE_TAG=sha-full-git-sha
MONGO_URI=mongodb://mongodb:27017/expense_tracker
PORT=5000
```

For a managed MongoDB service, replace `MONGO_URI` with its connection string. Keep this file private and never commit it.

## 4. Pull and start a release

From the deployment directory:

```bash
docker compose pull
docker compose up -d --remove-orphans
docker compose ps
```

To deploy another release, change only `IMAGE_TAG` to the new `sha-<full-git-sha>` value and run the same commands. To remove unused old images:

```bash
docker image prune -f
```

## 5. GitHub Actions flow

After tests pass, GitHub Actions logs in to Docker Hub, builds both images, and pushes the tags. The self-hosted deployment job then fetches the repository's deployment files, sets `IMAGE_TAG` to the current commit SHA, pulls the published images, and starts them without building locally.

For a release version:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 6. Publish manually from a terminal

After committing the release, log in to Docker Hub and run the publisher from the repository root:

```bash
docker login
DOCKERHUB_NAMESPACE=tanviralamdevops ./scripts/publish-images.sh v1.0.0
```

The script pushes these tags for both images:

```text
v1.0.0
sha-<full-commit-sha>
latest
```

It refuses to publish when the Git working tree is dirty, which prevents an image tag from pointing to source code that was not committed.
