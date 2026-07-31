import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import "./Toast.css";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className={`toast-notification ${toast.type || "info"}`}>
      <div className="toast-icon">
        {isSuccess && <CheckCircle className="w-5 h-5 text-[#166534]" />}
        {isError && <AlertTriangle className="w-5 h-5 text-[#dc2626]" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-[#1d4ed8]" />}
      </div>
      <div className="toast-content">
        <div className="toast-title">
          {isSuccess ? "Action Successful" : isError ? "Action Failed" : "Notice"}
        </div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button onClick={onClose} className="toast-close-btn" aria-label="Close notification">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
