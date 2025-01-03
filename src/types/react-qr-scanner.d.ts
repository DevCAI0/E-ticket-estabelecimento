declare module "react-qr-scanner" {
  import { ComponentType } from "react";

  interface QrReaderProps {
    delay?: number;
    onError: (error: { message: string }) => void;
    onScan: (result: { text: string } | null) => void;
    style?: React.CSSProperties;
    constraints?: {
      video: {
        facingMode: {
          exact: string;
        };
      };
    };
  }

  const QrReader: ComponentType<QrReaderProps>;
  export default QrReader;
}
