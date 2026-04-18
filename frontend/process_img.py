from PIL import Image

def remove_checkerboard(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        if abs(r - g) < 20 and abs(g - b) < 20 and r > 170 and g > 170 and b > 170:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_checkerboard('/Users/rajdeepshaw/.gemini/antigravity/brain/e7be75d7-b25b-47cc-b71c-d77a7ee77415/media__1776201507763.png', '/Users/rajdeepshaw/1NE-A/frontend/src/assets/ecoscan_title.png')
