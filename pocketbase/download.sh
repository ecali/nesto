#!/bin/bash
set -e

PB_VERSION="0.25.2"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  darwin) OS="darwin" ;;
  linux) OS="linux" ;;
  *) echo "OS non supportato: $OS"; exit 1 ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Architettura non supportata: $ARCH"; exit 1 ;;
esac

URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"

echo "Scaricamento PocketBase v${PB_VERSION} (${OS}_${ARCH})..."
curl -sL "$URL" -o /tmp/pb.zip
unzip -o /tmp/pb.zip -d .
rm /tmp/pb.zip
chmod +x pocketbase
echo "Fatto! ./pocketbase serve --http=0.0.0.0:8090"
