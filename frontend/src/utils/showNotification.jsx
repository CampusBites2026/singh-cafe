import { toast } from "react-toastify";

export const showNotification = (
  title,
  message,
  subtitle = ""
) => {
  toast(
    <div className="cb-toast">
      <div className="cb-toast-title">
        {title}
      </div>

      <div className="cb-toast-message">
        {message}
      </div>

      {subtitle && (
        <div className="cb-toast-subtitle">
          {subtitle}
        </div>
      )}
    </div>,
    {
      icon: false,
      className: "cb-toast-wrapper",
    }
  );
};