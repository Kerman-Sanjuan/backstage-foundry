# The two commands you need. Everything else is optional.
PY ?= python3
BIN := .venv/bin
LIVE ?= 0

.PHONY: help setup demo record

help:
	@echo "make setup    create the venv and install dependencies"
	@echo "make demo     run the evaluation gate (replay, offline, deterministic)"
	@echo "make record   re-record fixtures from the real deployment"
	@echo "make demo LIVE=1   run the gate against the real deployment"

setup: .venv/.installed

.venv/.installed: evals/requirements.txt
	$(PY) -m venv .venv
	$(BIN)/pip install --quiet --upgrade pip
	$(BIN)/pip install --quiet -r evals/requirements.txt
	@touch $@

demo: setup
	@LIVE=$(LIVE) $(BIN)/python -m evals.run

record: setup
	@$(BIN)/python -m evals.record
