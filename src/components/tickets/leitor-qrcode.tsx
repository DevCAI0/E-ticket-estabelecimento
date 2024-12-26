import { useState } from "react";
import QrReader from "react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRResult {
  text: string;
}

interface QRError {
  message: string;
}

const LeitorQRCode = () => {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: QRResult | null) => {
    if (data) {
      setResult(data.text);
    }
  };

  const handleError = (err: QRError) => {
    setError(err.message);
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Leitor QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-black">
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%", height: "100%" }}
              facingMode="rear"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>Resultado: {result}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeitorQRCode;
