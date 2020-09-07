import path from "path";

export default function getAppRootDir() {
  const serverRoot = String(require.main?.filename);
  return path.dirname(serverRoot);
}
