# Override this location with env `NODES_DIR=../some/path`
NODES_DIR?=../nodes
NODES_ABS=$(realpath $(NODES_DIR))

.PHONY: build
build: .env install nodes

.PHONY: standalone
standalone: .env clean install
	# For clarity: depends on the "clean" target to wipe any local linking
	# Stub contracts to allow building without desci-contracts
	./stubContract.sh

.PHONY: nodes
nodes:
	$(MAKE) -C $(NODES_DIR) build
	yarn link @desci-labs/desci-models

	# Cleanup potential leftover actual directories from standalone build
	rm -rf src/desci-contracts-*

	# Link contract artifacts to this project.
	# -s symlink
	# -f overwrite (so we can re-build against a different contract repo version)
	# -T treat target as a file (otherwise it will nest in an existing dir link)
	ln -sT $(NODES_ABS)/desci-contracts/artifacts src/desci-contracts-artifacts
	ln -sT $(NODES_ABS)/desci-contracts/.openzeppelin src/desci-contracts-config


.PHONY: install
install:
	yarn

.PHONY: clean
clean:
	rm -rf node_modules
	rm -rf build

	# Unlinking desci-models (may fail if not present, that's okay)
	yarn unlink @desci-labs/desci-models || true

	# Clean up symlinks
	rm -rf src/desci-contracts-*

.PHONY: .env
.env:
	cp --no-clobber .env.example .env || true

