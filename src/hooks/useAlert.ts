import { useState, useCallback } from "react";

export interface AlertState {
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback(
    (type: AlertState["type"], message: string, title?: string) => {
      setAlert({ type, message, title });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showAlert("success", message, title);
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showAlert("error", message, title);
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showAlert("warning", message, title);
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showAlert("info", message, title);
    },
    [showAlert]
  );

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const clearAlert = hideAlert;

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    clearAlert,
  };
};
