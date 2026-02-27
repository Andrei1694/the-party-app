#!/bin/bash
set -e

# =============================================================================
# Configuration - Update these values for your environment
# =============================================================================
DOCKER_USERNAME="andrei1694"
IMAGE_PREFIX="party-app"
VM_HOST="34.132.160.228"  # VM IP address or hostname (e.g., "34.123.45.67")
VM_USER="andrei4_stanciu"  # SSH username on the VM

# Full image names
BACKEND_IMAGE="$DOCKER_USERNAME/$IMAGE_PREFIX-backend:latest"
NGINX_IMAGE="$DOCKER_USERNAME/$IMAGE_PREFIX-nginx:latest"

# =============================================================================
# Script
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[BUILD]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Parse arguments
ACTION="${1:-all}"

show_help() {
    echo "Usage: ./build.sh [command]"
    echo ""
    echo "Commands:"
    echo "  all       Build, push, and deploy (default)"
    echo "  build     Build Docker images locally"
    echo "  push      Push images to Docker Hub"
    echo "  deploy    Deploy on VM (pull and restart)"
    echo "  help      Show this help message"
    echo ""
    echo "Configuration (edit variables at top of script):"
    echo "  DOCKER_USERNAME  Current: $DOCKER_USERNAME"
    echo "  VM_HOST          Current: $VM_HOST"
    echo "  VM_USER          Current: $VM_USER"
}

build_images() {
    log "Building Docker images..."
    cd "$PROJECT_DIR"

    log "Building backend image: $BACKEND_IMAGE"
    docker build --platform linux/amd64 -t "$BACKEND_IMAGE" -f Dockerfile .

    log "Building nginx/frontend image: $NGINX_IMAGE"
    docker build --platform linux/amd64 -t "$NGINX_IMAGE" -f nginx/Dockerfile --build-arg VITE_API_URL=/api .

    log "Build complete."
}

push_images() {
    log "Pushing images to Docker Hub..."

    # Check if logged in
    if ! docker info 2>/dev/null | grep -q "Username"; then
        log "Please log in to Docker Hub:"
        docker login
    fi

    log "Pushing $BACKEND_IMAGE..."
    docker push "$BACKEND_IMAGE"

    log "Pushing $NGINX_IMAGE..."
    docker push "$NGINX_IMAGE"

    log "Push complete."
}

deploy_on_vm() {
    log "Deploying on VM..."

    if [ -z "$VM_HOST" ]; then
        error "VM_HOST is not set. Edit build.sh and set your VM's IP address."
    fi

    SSH_TARGET="$VM_USER@$VM_HOST"

    # Copy docker-compose.prod.yml
    if [ -f "$SCRIPT_DIR/docker-compose.prod.yml" ]; then
        log "Copying docker-compose.prod.yml to VM..."
        scp "$SCRIPT_DIR/docker-compose.prod.yml" "$SSH_TARGET":~/docker-compose.yml
    else
        error "docker-compose.prod.yml not found in build folder."
    fi

    log "Pulling images and starting services..."
    ssh "$SSH_TARGET" "
        echo 'Pulling latest images...'
        docker pull $BACKEND_IMAGE
        docker pull $NGINX_IMAGE

        echo 'Restarting services...'
        docker-compose down || true
        docker-compose up -d

        echo 'Done! Running containers:'
        docker ps
    "

    log "Deployment complete!"
}

# Main
case "$ACTION" in
    build)
        build_images
        ;;
    push)
        push_images
        ;;
    deploy)
        deploy_on_vm
        ;;
    all)
        build_images
        push_images
        deploy_on_vm
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Unknown command: $ACTION. Use './build.sh help' for usage."
        ;;
esac
