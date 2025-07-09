from PIL import Image
import os

def replace_color_and_convert():
    folder = os.path.dirname(os.path.abspath(__file__))
    target_color = (0, 252, 252)  # Color to make transparent (R, G, B)

    for filename in os.listdir(folder):
        if filename.lower().endswith('.bmp'):
            bmp_path = os.path.join(folder, filename)
            img = Image.open(bmp_path)

            # Ensure we work in RGBA
            img = img.convert("RGBA")

            pixels = img.load()
            width, height = img.size

            for y in range(height):
                for x in range(width):
                    r, g, b, a = pixels[x, y]
                    if (r, g, b) == target_color:
                        pixels[x, y] = (0, 0, 0, 0)  # Make it transparent

            # Save as PNG
            png_path = os.path.splitext(bmp_path)[0] + ".png"
            img.save(png_path, 'PNG')
            print(f"Processed {filename} -> {os.path.basename(png_path)}")

if __name__ == "__main__":
    replace_color_and_convert()
