import { QrCode } from "lucide-react";

/** Shown when someone opens /menu without scanning, or after the session ended. */
export function NoSession({ message }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary-soft">
        <QrCode className="size-9 text-primary" />
      </div>
      <h1 className="text-xl font-bold">Scan your table’s QR code</h1>
      <p className="text-muted">{message ?? "Point your camera at the code on your table to see the menu and order."}</p>
    </div>
  );
}
