import replicate
import json
import os

from mutagen.mp3 import MP3

from dotenv import load_dotenv
load_dotenv()
os.getenv("REPLICATE_API_TOKEN")





def get_audio_duration(audio_path):

    audio = MP3(audio_path)
    return audio.info.length

def synthesize_speech(
    text,
    emotion="happy",
    voice_id="Friendly_Person",
    language_boost="English",
    english_normalization=True,
    output_filename=None,
):
    input_data = {
        "text": text,
        "emotion": emotion,
        "voice_id": voice_id,
        "language_boost": language_boost,
        "english_normalization": english_normalization,
    }

    output = replicate.run("minimax/speech-02-turbo", input=input_data)

    # To access the file URL:
    print(output.url)
    # => "https://replicate.delivery/.../output.mp3"

    # To write the file to disk:
    with open(output_filename, "wb") as file:
        file.write(output.read())
    # => output.mp3 written to disk


speed_id = "R8_GKYQ3UBG"
elon_id = "R8_71RSEH2W"
abdul_id = "R8_X6V884WQ"


with open("script.json", "r") as f:
    script = json.load(f)


output_directory = "output/audios"
os.makedirs(output_directory, exist_ok=True)

duration_map = []

count = 0
total_dur = 0

for s in script:

    s["line"] = s["line"].replace("*", "").replace("$", "").replace("\\", "")

    if s["speaker"].lower().strip() == "narrator":
        continue

    if s["speaker"].lower().strip() in ["speed", "ishowspeed"]:
        voice_id = speed_id
    elif s["speaker"].lower().strip() in ["elon musk", "elonmusk"]:
        voice_id = elon_id
    elif s["speaker"].lower().replace(".", "").strip() in ["dr kalam", "apj abdul kalam"]:
        voice_id = abdul_id
    else:
        voice_id = "Friendly_Person"

    print(voice_id, file=open("output/voice_id.txt", "w"))

    output_filename = f"{output_directory}/{count}.mp3"
    synthesize_speech(s["line"], "happy", voice_id, output_filename=output_filename)
    count += 1

    # get the output file duration
    duration = get_audio_duration(output_filename)
    context = {
        "speaker": s["speaker"],
        "from_duration": total_dur,
        "to_duration": total_dur + duration,
    }
    duration_map.append(context)
    total_dur += duration
    break

with open("output/duration_map.json", "w") as f:
    json.dump(duration_map, f)


from merge import merge_mp3_files

merge_mp3_files()