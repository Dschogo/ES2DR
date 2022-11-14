# Epidemic Sound to Davinci Resolve Firefox Extension

This is a Firefox extension that allows you to download/import music from Epidemic Sound directly into Davinci Resolve.

## Installation

Docs over here: [CLICK ME](https://dschogo.github.io/HowToStuff/Other/EStDR/)

## How does it work internally?

The extension reads the current showing page / url and sends it over a local websocket to the python script. The script donwloads the lq mp3 file (full music - not the indivitual stems). Lq = 128kbps - its the preview quallity and probably enough for most cases - like general yt videos. There will be maybe better download options in the future, but for that the script would have to use your browser token - or a direct api call.
Anyway, the script downlaods the mp3 file and imports it directly to the mediapoll.
