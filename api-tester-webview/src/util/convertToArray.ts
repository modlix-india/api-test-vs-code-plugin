import { UUID } from "./uuid";

export function convertToArray(params) {
  return Object.entries(params ?? {}).map(([k, v]) => [UUID(), k, v, true]);
}
