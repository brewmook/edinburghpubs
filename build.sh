#!/bin/bash

node_modules/requirejs/bin/r.js -o build.js
tar cj build > build.tbz2
