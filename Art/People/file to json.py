import os
import json

def rename_files_in_subfolders(base_dir):
    folder_entries = []

    # List all items in base directory
    for entry in os.listdir(base_dir):
        full_path = os.path.join(base_dir, entry)

        # Process only directories (subfolders)
        if os.path.isdir(full_path):
            folder_name = entry
            folder_entries.append({"class": folder_name})

            files = [f for f in os.listdir(full_path) if os.path.isfile(os.path.join(full_path, f))]
            files.sort()  # Optional: sort alphabetically before renaming

            for index, filename in enumerate(files, start=1):
                old_file_path = os.path.join(full_path, filename)
                extension = os.path.splitext(filename)[1]  # Keep original file extension
                new_filename = f"{index}{extension}"
                new_file_path = os.path.join(full_path, new_filename)

                os.rename(old_file_path, new_file_path)
                print(f"Renamed {old_file_path} -> {new_file_path}")

    # Write JSON file
    json_path = os.path.join(base_dir, "folders.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(folder_entries, f, indent=2)
    print(f"\nGenerated JSON file at: {json_path}")

# Run the function
if __name__ == "__main__":
    base_directory = os.getcwd()
    rename_files_in_subfolders(base_directory)
