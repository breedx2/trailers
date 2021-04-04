#!/bin/bash

ffmpeg -i "$1" -filter:a volumedetect -f null /dev/null 2>&1 | \
  grep max_volume | sed -e "s/^.*max_volume/max_volume/"
