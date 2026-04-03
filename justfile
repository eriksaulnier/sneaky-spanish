# Install dependencies and register git hooks
setup:
    mise install
    pnpm install
    git config --local core.hooksPath .beads/hooks

# Start dev mode (watch + rebuild)
dev:
    pnpm dev

# Build both targets
build: build-chrome build-firefox

# Build Chrome
build-chrome:
    pnpm build

# Build Firefox
build-firefox:
    pnpm build:firefox

# Package extension for distribution
package: build
    pnpm package
