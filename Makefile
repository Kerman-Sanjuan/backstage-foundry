# The two commands you need on stage. Everything else is for the reader.

PY ?= python3
VENV := demo/ai-actas-bot/.venv
BIN := $(VENV)/bin
LIVE ?= 0

.PHONY: help setup demo record check clean

help:
	@echo "make setup    create the venv and install dependencies"
	@echo "make demo     run the evaluation gate (replay mode, offline, deterministic)"
	@echo "make demo LIVE=1   run it against a real Foundry deployment"
	@echo "make record   re-record the fixtures against a real deployment"
	@echo "make check    compile-only sanity check, no dependencies needed"

setup: $(VENV)/.installed

$(VENV)/.installed: demo/ai-actas-bot/requirements.txt
	$(PY) -m venv $(VENV)
	$(BIN)/pip install --quiet --upgrade pip
	$(BIN)/pip install --quiet -r demo/ai-actas-bot/requirements.txt
	@touch $@

demo: setup
	@cd demo/ai-actas-bot && LIVE=$(LIVE) ../../$(BIN)/python -m evals.run

record: setup
	@cd demo/ai-actas-bot && ../../$(BIN)/python -m evals.record

check:
	@$(PY) -m compileall -q demo/ai-actas-bot >/dev/null && echo "ok"

clean:
	rm -rf $(VENV) demo/ai-actas-bot/**/__pycache__
