function readFile(file, method) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader[method](file);
  });
}

export function readFileAsDataUrl(file) {
  return readFile(file, "readAsDataURL");
}

export function readFileAsText(file) {
  return readFile(file, "readAsText");
}
