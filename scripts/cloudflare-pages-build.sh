#!/usr/bin/env bash
set -euo pipefail

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LC_CTYPE=en_US.UTF-8
export RUBYOPT="${RUBYOPT:+$RUBYOPT }-EUTF-8"

bundle exec jekyll clean
bundle exec jekyll build --baseurl "${JEKYLL_BASEURL:-}"
