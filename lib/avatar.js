// lib/avatar.js
export function generateAvatar() {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const size = 128;

  canvas.width = size;
  canvas.height = size;

  function getRandomColor() {
    let color = Math.floor(Math.random() * 16777215).toString(16);
    while (color.length < 6) {
      color = "0" + color;
    }
    return "#" + color;
  }

  const color1 = getRandomColor();
  const color2 = getRandomColor();

  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}
