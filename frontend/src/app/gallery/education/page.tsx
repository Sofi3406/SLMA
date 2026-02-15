"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EducationGalleryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/gallery');
  }, [router]);

  return <div className="p-6">Redirecting to gallery…</div>;
}
