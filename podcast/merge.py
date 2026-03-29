import os
import subprocess


def merge_mp3_files(output_folder="output/audios", merged_filename="merged_output.mp3"):
    # List all mp3 files in the output folder and sort them
    # from 1_0 to 1_27
    mp3_files = [f for f in os.listdir(output_folder) if f.endswith(".mp3")]
    mp3_files.sort(key=lambda x: int(x.split(".")[0]))

    if not mp3_files:
        print("No mp3 files found in the specified folder.")
        return

    # Prepare the list file for ffmpeg (full paths, properly escaped)
    list_file_path = os.path.join(output_folder, "mp3_files.txt")
    with open(list_file_path, "w", encoding="utf-8") as list_file:
        for filename in mp3_files:
            # Use only the file's basename for the concat list. FFmpeg runs with cwd set.
            list_file.write(f"file '{filename}'\n")

    merged_export_path = os.path.join(output_folder, merged_filename)

    # Call ffmpeg to concatenate files
    cmd = [
        # "ffmpeg",
        r"C:\ffmpeg\ffmpeg-8.1-essentials_build\bin\ffmpeg.exe",
        "-y",  # overwrite output file without asking
        "-hide_banner",  # suppress extraneous info
        "-loglevel",
        "error",  # show only errors
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "mp3_files.txt",
        "-c",
        "copy",
        merged_filename,
    ]
    # Run the command in the output folder so relative paths work and mp3_files.txt is visible
    try:
        proc = subprocess.run(
            cmd,
            check=True,
            cwd=output_folder,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        print(f"Merged {len(mp3_files)} files into {merged_export_path}")
    except subprocess.CalledProcessError as e:
        print("FFmpeg failed to merge files.")
        print("STDOUT:", e.stdout.decode(errors="replace"))
        print("STDERR:", e.stderr.decode(errors="replace"))
    finally:
        # Cleanup the list file
        list_file_path = os.path.join(output_folder, "mp3_files.txt")
        if os.path.exists(list_file_path):
            os.remove(list_file_path)


if __name__ == "__main__":
    merge_mp3_files()
