interface LoadingProps {
  variant?: "spinner" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
  text?: string;
  color?: "primary" | "secondary" | "white";
  fullScreen?: boolean;
  hasBackdrop?: boolean;
}

const Loading = ({
  variant = "spinner",
  size = "md",
  text,
  color = "primary",
  fullScreen = false,
  hasBackdrop = false,
}: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-primary border-primary",
    secondary: "text-gray-600 border-gray-600",
    white: "text-white border-white",
  };

  const renderSpinner = () => (
    <div
      className={` ${sizeClasses[size]} animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]} `}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={`rounded-full ${color === "white" ? "bg-white" : "bg-primary"} animate-bounce ${size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3"} `}
          style={{
            animationDelay: `${dot * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={` ${sizeClasses[size]} rounded-full ${color === "white" ? "bg-white" : "bg-primary"} animate-pulse`}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  const containerClasses = `
      flex flex-col items-center justify-center
      ${fullScreen ? "fixed inset-0" : "w-full h-full"}
      ${hasBackdrop ? "bg-black/50" : ""}
      ${text ? "gap-3" : "gap-0"}
    `;

  return (
    <div className={containerClasses}>
      {renderLoader()}
      {text && (
        <span
          className={`text-sm font-medium ${color === "white" ? "text-white" : "text-gray-600"}`}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default Loading;
