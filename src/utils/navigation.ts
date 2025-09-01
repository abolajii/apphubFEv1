export const delayedNavigate = (
  navigateFunction: (path: string) => void,
  path: string,
  delay: number = 3000
) => {
  setTimeout(() => {
    navigateFunction(path);
  }, delay);
};

export const showAlertAndNavigate = (
  showAlertFunction: (message: string, title?: string) => void,
  navigateFunction: (path: string) => void,
  message: string,
  path: string,
  title?: string,
  delay: number = 3000
) => {
  showAlertFunction(message, title);
  delayedNavigate(navigateFunction, path, delay);
};
