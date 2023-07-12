# Override this location with env `NODES_DIR=../some/path`
NODES_DIR?=../nodes
NODES_ABS=$(realpath $(NODES_DIR))

.PHONY: build
build: .env install nodes

.PHONY: nodes
nodes:
	$(MAKE) -C $(NODES_DIR) build
	yarn link @desci-labs/desci-models

	# Link contract artifacts to this project.
	# -s symlink
	# -f overwrite (so we can re-build against a different contract repo version)
	# -T treat target as a file (otherwise it will nest in an existing dir link)
	ln -sfT $(NODES_ABS)/desci-contracts/artifacts src/desci-contracts-artifacts
	ln -sfT $(NODES_ABS)/desci-contracts/.openzeppelin src/desci-contracts-config


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
	rm -f src/desci-contracts-*

.PHONY: .env
.env:
	cp --no-clobber .env.example .env || true

