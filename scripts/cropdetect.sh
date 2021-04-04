#!/bin/bash

echo "$1"
ffmpeg -i "$1" -vf cropdetect=24:16:0 -f null -max_muxing_queue_size 9999 /dev/null 2>&1 | \
  grep Parsed_cropdetect | \
  sed -e 's/.*crop=/crop=/' | \
  uniq -c
