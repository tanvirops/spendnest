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
DOCKERHUB_CLIENT_REPOSITORY=spendnest-client
DOCKERHUB_SERVER_REPOSITORY=spendnest-server
EXPENSE_TRACKER_API_URL=/api
```

The repository-name variables are optional; the workflow defaults to `spendnest-client` and `spendnest-server`. If you use different names, create those repositories in the same Docker Hub namespace and ensure the deployment Compose configuration uses the same names.

The workflow publishes these tags:

- `sha-<full-git-sha>`: immutable deployment tag used by the server
- `latest`: updated on pushes to `main` and version-tag pushes
- `1.2.3`: created when a Git tag such as `v1.2.3` is pushed

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
MONGODB_IMAGE=mongo:8.0
MONGO_URI_DOCKER=mongodb://mongodb:27017/expense_tracker
PORT=5000
```

For a managed MongoDB service, set `MONGO_URI_DOCKER` to its connection string. Keep this file private and never commit it. Keep the MongoDB image on the same major version as the data volume; MongoDB does not support downgrading existing database files.

For local development without Docker Hub images, run `docker compose up --build -d` from the repository root. The local default is MongoDB 7.0 because MongoDB 8.0+ currently crashes on Linux kernel 6.19 and newer. The Compose file builds the client and server images locally.

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

After tests passed, GitHub Actions logs in to Docker Hub, builds both images, and pushes the tags. The self-hosted deployment job then fetches the repository's deployment files, sets `IMAGE_TAG` to the current commit SHA, pulls the published images, and starts them without building locally.

After adding the required secrets and variables, push a three-part `v`-prefixed Git tag to start the release workflow. It waits for both test jobs to pass, then builds and publishes both images with the version number (without the `v` prefix), `latest`, and the immutable commit SHA. A tag push does not deploy to the server; pushes to `main` also publish `latest` and run the deployment job.

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow accepts tags matching `v*.*.*` (for example, `v1.0.0`). Check the **Actions** tab for the `Publish Docker Images` job, then confirm `DOCKERHUB_NAMESPACE/spendnest-client:1.0.0` and `DOCKERHUB_NAMESPACE/spendnest-server:1.0.0` in Docker Hub.

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

## 7. Docker Hub repository metadata

Use the following text when creating or editing the Docker Hub repositories.

### `spendnest-client`

**Category:** Web

**Short description:**

```text
SpendNest personal expense tracker frontend built with React and Vite.
```

**Full description:**

````markdown
# SpendNest Client

The SpendNest Client is the React frontend for a personal expense tracking application.
It provides a responsive interface for managing expenses, budgets, savings, profiles, and
authentication.

## Included

- React and Vite production build
- Nginx static file server
- SPA route fallback
- Reverse proxy for `/api` requests
- Immutable release and Git SHA image tags

## Run

```bash
docker run --rm -p 3041:80 tanviralamdevops/spendnest-client:latest
```
````

````

### `spendnest-server`

**Category:** Web

**Short description:**

```text
SpendNest REST API for expenses, budgets, savings, profiles, and authentication.
````

**Full description:**

````markdown
# SpendNest Server

The SpendNest Server is the Node.js and Express REST API for a personal expense tracking
application. It provides authenticated endpoints for expenses, budgets, savings, profiles,
and Google OAuth integration.

## Included

- Node.js 20 production runtime
- Express REST API
- MongoDB and Mongoose integration
- JWT authentication and Google OAuth
- Health endpoint at `/api/health`
- Immutable release and Git SHA image tags

## Run

```bash
docker run --rm --env-file .env -p 3042:5000 tanviralamdevops/spendnest-server:latest
```
````

```

```
