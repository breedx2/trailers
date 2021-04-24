#!/bin/bash

function usage(){
  echo
  echo "usage:"
  echo
  echo "$0 <moviefile>"
  echo
  exit 1
}

if [ "" == "$1" ] ; then
  usage
fi

FN=$(basename "$1")
OUTFILE="${FN}.flv"

ffmpeg -i "$1" \
  -c:v libx264 -vf scale=-1:720 \
  -crf 18 -c:a aac -ar 44100 -ac 2 \
  "${OUTFILE}"
