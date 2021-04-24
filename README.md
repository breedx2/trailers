# trailers
Tools for maintaining a digital trailers reel

Mostly around standardizing/normalizing widely different types of video files.

# requirements

* ffmpeg
* node
* some standard linux tools

# setup

Create this file `env.json` and put your paths into it:
```
{
  "original": "/path/to/trailers/original",
  "out": "/path/to/trailers/out",
  "info": "/path/to/trailers/meta"
}
```

# recipes


## update all metadata
This will create metadata where missing and recompute
the metadata if the checksum is different or the video
file is newer than the existing metadata file.

```
node src/updatemeta.js
```

## make missing trailers
This will encode all missing trailers into the output dir.

```
node src/makemissing.js
```

# considerations

* normalize audio
* time-cropping to remove 3rd party vanity cards
* removing of black bars
* standardizing frame rate
* standardizing dimensions
* padding/letterboxing
