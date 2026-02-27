const isPathActive = (currentPath, targetPath) =>
  currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

export default isPathActive;
