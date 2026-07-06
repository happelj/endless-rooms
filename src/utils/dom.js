export function getRequiredElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Required element with id "${id}" was not found.`);
  }

  return element;
}

