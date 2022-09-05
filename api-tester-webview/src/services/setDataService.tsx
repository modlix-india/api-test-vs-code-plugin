export function splitPath(srcPath: string) {
  let path = srcPath.split(".");
  let finalPath: string[] = [];
  for (let i = 0; i < path.length; i++) {
    if (path[i].indexOf("[") === -1) {
      finalPath.push(path[i]);
      continue;
    }

    const parts = path[i].split("[");

    for (let j = 0; j < parts.length; j++) {
      if (parts[j].trim() === "") continue;

      let tp = parts[j];
      if (tp.indexOf("]") !== -1) {
        finalPath.push("[" + tp);
      } else finalPath.push(tp);
    }
  }

  return finalPath;
}

export default function makeDataObject(
  src: any,
  originalPath: string,
  value: any | undefined
) {
  if (!originalPath || originalPath.trim() === "") return value;

  let data: any;
  let dataObject: any;
  dataObject = data = src;

  let path = splitPath(originalPath);

  let parent = data;
  for (let i = 0; i < path.length; i++) {
    if (!data) {
      if (path[i].startsWith("[")) dataObject = data = [];
      else dataObject = data = {};
    }

    let tp = path[i];
    if (tp.indexOf("[") !== -1) tp = tp.substring(1, tp.length - 1);
    parent = data;

    data = parent[tp];

    if (!data && i + 1 !== path.length) {
      if (path[i + 1].startsWith("[")) parent[tp] = data = [];
      else parent[tp] = data = {};
    }

    if (i + 1 !== path.length) {
      if (path[i + 1].startsWith("[")) {
        if (!Array.isArray(data))
          throw new Error(
            "Expected an array, but found " + JSON.stringify(data)
          );
      }
    }
  }

  let tp = path[path.length - 1];
  if (tp.indexOf("[") !== -1) tp = tp.substring(1, tp.length - 1);

  if (!value && typeof value === "undefined") delete parent[tp];
  else parent[tp] = value;

  return dataObject;
}
