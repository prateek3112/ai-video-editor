import asyncio
import json
import sys
import os
import edge_tts

async def generate_speech_with_words(text: str, output_mp3: str, voice: str = "en-US-ChristopherNeural", rate: str = "+6%"):
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    submaker = edge_tts.SubMaker()
    words_data = []

    with open(output_mp3, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                w = chunk["text"]
                start_sec = chunk["offset"] / 10000000.0
                dur_sec = chunk["duration"] / 10000000.0
                words_data.append({
                    "word": w,
                    "start": round(start_sec, 3),
                    "end": round(start_sec + dur_sec, 3),
                    "duration": round(dur_sec, 3)
                })

    return words_data

if __name__ == "__main__":
    text = sys.argv[1]
    out_mp3 = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "en-US-ChristopherNeural"
    rate = sys.argv[4] if len(sys.argv) > 4 else "+6%"

    words = asyncio.run(generate_speech_with_words(text, out_mp3, voice, rate))
    print(json.dumps(words))
