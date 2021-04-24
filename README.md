# trailers
Tools for maintaining a digital trailers reel

Mostly around standardizing/normalizing widely different types of video files.

# requirements

* ffmpeg
* bunch of standard linux tools
* node

# setup

Create this file `src/env.json` and put your paths into it:
```
{
  "original": "/path/to/trailers/original",
  "out": "/path/to/trailers/out",
  "info": "/path/to/trailers/meta"
}
```

# considerations

* normalize audio
* time-cropping to remove 3rd party vanity cards
* removing of black bars
* standardizing frame rate
* standardizing dimensions
* padding/letterboxing
