import os
import shutil
import re

dataset_dir = r"c:\Users\lenovo\Downloads\clinderma\Color-Palette-Manager\artifacts\clinderma\ml-training\dataset"

def organize_images():
    for root, dirs, files in os.walk(dataset_dir):
        if root == dataset_dir: continue # skip the top level since we are dealing with subfolders right now
        
        for file in files:
            if not file.lower().endswith(('.png', '.jpg', '.jpeg')): continue
            
            # Extract class name from something like "acne_vulgaris271.jpg"
            # We strip digits, underscores at the end, etc.
            # Example: "melanoma30_4.jpg" -> "melanoma"
            name_no_ext = os.path.splitext(file)[0]
            # remove trailing numbers and underscores
            class_name = re.sub(r'[\d_]+$', '', name_no_ext).strip('_').lower()
            
            # Fallback if class_name ends up empty
            if not class_name:
                class_name = "unknown"
                
            target_dir = os.path.join(dataset_dir, class_name)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
                
            src_path = os.path.join(root, file)
            dst_path = os.path.join(target_dir, file)
            
            print(f"Moving {file} -> {class_name}/")
            shutil.move(src_path, dst_path)

if __name__ == "__main__":
    organize_images()
    print("Done organizing.")
