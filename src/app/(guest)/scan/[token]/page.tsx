import { Suspense } from "react";
import { ScanScreen } from "@/components/guest/ScanScreen";
import { ScanSplash } from "@/components/guest/ScanSplash";

// G1: what the QR code opens.
// Next 16 (Cache Components): the URL param is runtime data, so it is read inside <Suspense>.
// The fallback is the same splash, so the guest never sees a blank screen.
export default function ScanPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<ScanSplash />}>
      <ResolveToken params={params} />
    </Suspense>
  );
}

async function ResolveToken({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ScanScreen token={token} />;
}
