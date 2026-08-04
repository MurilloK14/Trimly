import sys
from PIL import Image

def remove_black_background(input_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # item is (R, G, B, A)
            # Threshold for "black" or very dark pixels
            if item[0] < 20 and item[1] < 20 and item[2] < 20:
                new_data.append((0, 0, 0, 0)) # Fully transparent
            else:
                # To prevent a hard edge, we could do soft blending, but hard threshold is a start
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(input_path, "PNG")
        print("Successfully removed background!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

remove_black_background("public/logo.png")
