import { Suspense } from "react";
import { WritePageClient } from "@/components/write/write-page-client";

export default function WritePage() {
  return (
    <Suspense fallback={null}>
      <WritePageClient />
    </Suspense>
  );
}
