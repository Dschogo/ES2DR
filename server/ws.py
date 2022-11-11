
import asyncio
import json
import websockets
import requests
from python_get_resolve import GetResolve
import json

audiopath = "M:\\Davinci\\AudioLibrary\\"

### taken from https://github.com/octimot/StoryToolkitAI/blob/main/mots_resolve.py#L17
### credits to octimot
def initialize_resolve(silent=False):
    """
    Returns most of the necessary Resolve API objects that are needed to do most operations,
    it's a good common ground for initializing and handling the operations
    :param:
        silent: bool When True, this will prevent the function from printing anything on the screen

    :return:
        [resolve, project, mediaPool, projectManager, currentBin, currentTimeline]: dict

    """

    # first initialize all the objects with None values
    # if any of the following get requests fails, these values will still be None
    resolve = project = mediaPool = projectManager = currentBin = currentTimeline = None

    # first get the resolve object
    resolve = GetResolve()

    # get the project manager if resolve is opened
    if resolve is not None and resolve:
        # get the project manager
        projectManager = resolve.GetProjectManager()
    else:
        if not silent:
            print("Resolve is not started.")

    # get the project if the project manager is opened
    if projectManager is not None and projectManager:
        # get the project
        project = projectManager.GetCurrentProject()

    # if a project is opened, get the media pool and the current timeline
    if project is not None and project:
        # get the media pool
        mediaPool = project.GetMediaPool()

        # get the timeline
        currentTimeline = project.GetCurrentTimeline()
    else:
        if not silent:
            print("No Resolve project is loaded.")

    # get the current bin, if the media pool is available
    if mediaPool is not None:
        currentBin = mediaPool.GetCurrentFolder()
    else:
        if not silent:
            print("Resolve Media Pool not available.")

    if currentTimeline is None or not currentTimeline:
        if not silent:
            print("Resolve Timeline not loaded or unavailable.")

    if currentBin is None or not currentBin:
        if not silent:
            print("Resolve Bins not loaded or unavailable.")

    return [resolve, project, mediaPool, projectManager, currentBin, currentTimeline]


invalid = '<>:"/\|?* '

[resolve, project, mediaPool, projectManager, currentBin, currentTimeline] = initialize_resolve()

async def handler(websocket):
    while True:
        message = json.loads(await websocket.recv())
        print(message)
        if message["action"] == 'connect':
            await websocket.send('{"action": "connected"}')
        
        if message["action"] == 'track-download':
            track = requests.get(message["url"].replace("/track", "/json/track")[:-1]).json()
            r = requests.get(track['stems']['full']['lqMp3Url'])
            for char in invalid:
                track["title"] = track["title"].replace(char, '')
            with open(f'{audiopath}{track["title"]}.mp3', 'wb') as fb:
                fb.write(r.content)
            print(f'Downloaded {track["title"]}')
            mediaPool.ImportMedia([f'''{audiopath}{track["title"]}.mp3'''])
        if message["action"] == 'playlist-download':
            for x in range(0, len(message["urls"])):
                track = requests.get(message["urls"][x].replace("/track", "/json/track")[:-1]).json()
                r = requests.get(track['stems']['full']['lqMp3Url'])
                for char in invalid:
                    track["title"] = track["title"].replace(char, '')
                with open(f'{audiopath}{track["title"]}.mp3', 'wb') as fb:
                    fb.write(r.content)
                print(f'{x+1} / {len(message["urls"])} Downloaded {track["title"]}')
                mediaPool.ImportMedia([f'''{audiopath}{track["title"]}.mp3'''])



async def main():
    async with websockets.serve(handler, "localhost", 6942):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())