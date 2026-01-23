"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../Components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DownloadButton() {
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloading(true);
    setTimeout(() => {
      router.push("/thankyou");
      setTimeout(() => {
        window.location.href =
          "https://wayfinder-api.charlseempire.tech/downloads/wayfinder.apk";
      }, 2000);
    }, 1200);
  };

  return (
    <Button
      size="lg"
      className="bg-gradient-to-r cursor-pointer from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 text-lg h-12 px-8 flex items-center justify-center"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          Preparing download...
        </>
      ) : (
        <>
          Download For Android
          <ArrowRight className="ml-2 w-5 h-5" />
        </>
      )}
    </Button>
  );
}
