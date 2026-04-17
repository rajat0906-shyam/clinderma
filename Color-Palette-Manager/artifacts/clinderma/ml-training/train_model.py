import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import subprocess
import os

# ==========================================
# 1. Configuration & Paths
# ==========================================
# IMPORTANT: Place your dataset in the following folder structure relative to this script:
# dataset/
# │
# ├── redness/          <-- Put all redness images here
# │   ├── img1.jpg
# │   └── img2.jpg
# │
# ├── wrinkles/         <-- Put all wrinkles images here
# │   ├── img1.jpg
# │
# └── pores/            <-- Put all pores images here
#     ├── img1.jpg
# 
DATASET_DIR = "dataset"
MODEL_SAVE_NAME = "skin_mobilenet_v2.h5"
TFJS_EXPORT_DIR = "../public/models/skin_cnn"

BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 15

print("Loading and preparing dataset...")

# ==========================================
# 2. Data Augmentation & Loading
# ==========================================
# Uses standard computer vision augmentation to prevent overfitting
datagen = ImageDataGenerator(
    rescale=1./255,          
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2     
)

if not os.path.exists(DATASET_DIR):
    print(f"Error: {DATASET_DIR} directory not found.")
    print("Please create the 'dataset' folder, add subfolders for each metric (redness, wrinkles, etc.), and drop your images in them.")
    exit(1)

train_generator = datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

val_generator = datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

NUM_CLASSES = train_generator.num_classes
if NUM_CLASSES == 0:
    print("No images found! Make sure you put images inside the subfolders (e.g., dataset/redness/image.jpg)")
    exit(1)

print(f"Detected {NUM_CLASSES} classes: {list(train_generator.class_indices.keys())}")

# ==========================================
# 3. Model Architecture (Transfer Learning)
# ==========================================
print("Building MobileNetV2 model...")
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(NUM_CLASSES, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

model.compile(
    optimizer=Adam(learning_rate=0.0001), 
    loss='categorical_crossentropy', 
    metrics=['accuracy']
)

# ==========================================
# 4. Training the Model
# ==========================================
print("Starting training...")
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator
)

print(f"Training complete. Saving Keras model as {MODEL_SAVE_NAME}...")
model.save(MODEL_SAVE_NAME)

# ==========================================
# 5. Export for TensorFlow.js
# ==========================================
print(f"Converting model to TensorFlow.js format into {TFJS_EXPORT_DIR}...")
if not os.path.exists(TFJS_EXPORT_DIR):
    os.makedirs(TFJS_EXPORT_DIR)

try:
    subprocess.run([
        "tensorflowjs_converter", 
        "--input_format=keras", 
        MODEL_SAVE_NAME, 
        TFJS_EXPORT_DIR
    ], check=True)
    print("✅ Conversion Successful!")
    print(f"Your Web-ready model is available in: {TFJS_EXPORT_DIR}")
    print("In your React app, update CNN_MODEL_URL inside faceAnalysis.ts to point to '/models/skin_cnn/model.json'")
except Exception as e:
    print("⚠️ Conversion failed. Make sure you installed tensorflowjs: pip install tensorflowjs")
    print("Error:", e)
