import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minta izin kamera + nyalain stream.
 * status: "loading" | "granted" | "denied" | "unsupported" | "error"
 */
export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(false);
  const [status, setStatus] = useState("loading");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    // getUserMedia cuma ada di HTTPS atau localhost
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, // kamera belakang
        audio: false,
      });

      // Kalau user keburu pindah halaman, langsung matiin
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      stop(); // jaga-jaga ada stream lama (React StrictMode)
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("granted");
    } catch (err) {
      if (!mountedRef.current) return;
      setStatus(err.name === "NotAllowedError" ? "denied" : "error");
    }
  }, [stop]);

  useEffect(() => {
    mountedRef.current = true;
    start(); 
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [start, stop]);

  return { videoRef, status, retry: start };
}