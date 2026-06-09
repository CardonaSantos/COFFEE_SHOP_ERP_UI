export async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar el logo: ${response.status}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("No se pudo convertir el logo a base64"));
    };

    reader.readAsDataURL(blob);
  });
}

export async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}
