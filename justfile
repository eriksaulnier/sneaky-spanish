# Install dependencies and set up git hooks
setup:
    mise install
    pnpm install
    lefthook install --force

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
