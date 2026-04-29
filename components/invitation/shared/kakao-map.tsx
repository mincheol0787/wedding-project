"use client";

import { useEffect, useRef, useState } from "react";

type KakaoMapStatus = "loading" | "ready" | "error";

type KakaoMapInstance = {
  setCenter(position: unknown): void;
  relayout?: () => void;
};

type KakaoMarkerInstance = {
  setMap(map: unknown): void;
};

declare global {
  interface Window {
    kakao?: {
      maps: {
        load(callback: () => void): void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: Record<string, unknown>) => KakaoMapInstance;
        Marker: new (options: Record<string, unknown>) => KakaoMarkerInstance;
      };
    };
  }
}

type KakaoMapEmbedProps = {
  lat: number;
  lng: number;
  title: string;
  address?: string | null;
};

export function KakaoMapEmbed({ lat, lng, title, address }: KakaoMapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<KakaoMapStatus>("loading");
  const appKey =
    process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ||
    "";

  useEffect(() => {
    if (!containerRef.current || !appKey) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    let cleanupResize: (() => void) | undefined;
    let cleanupScriptListeners: (() => void) | undefined;

    const markAsError = () => {
      if (!cancelled) {
        setStatus("error");
      }
    };

    const initializeMap = () => {
      if (!window.kakao?.maps || !containerRef.current || cancelled) {
        return;
      }

      window.kakao.maps.load(() => {
        if (!window.kakao?.maps || !containerRef.current || cancelled) {
          return;
        }

        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: position,
          level: 4
        });
        const marker = new window.kakao.maps.Marker({ position });

        marker.setMap(map);
        map.setCenter(position);

        const relayout = () => {
          map.relayout?.();
          map.setCenter(position);
        };

        window.setTimeout(relayout, 80);
        window.addEventListener("resize", relayout);
        cleanupResize = () => window.removeEventListener("resize", relayout);
        setStatus("ready");
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-map="true"]');

    if (existing) {
      if (window.kakao?.maps) {
        initializeMap();
      } else {
        existing.addEventListener("load", initializeMap, { once: true });
        existing.addEventListener("error", markAsError, { once: true });
        cleanupScriptListeners = () => {
          existing.removeEventListener("load", initializeMap);
          existing.removeEventListener("error", markAsError);
        };
      }
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
        appKey
      )}&autoload=false&libraries=services`;
      script.async = true;
      script.dataset.kakaoMap = "true";
      script.addEventListener("load", initializeMap, { once: true });
      script.addEventListener("error", markAsError, { once: true });
      document.head.appendChild(script);
      cleanupScriptListeners = () => {
        script.removeEventListener("load", initializeMap);
        script.removeEventListener("error", markAsError);
      };
    }

    return () => {
      cancelled = true;
      cleanupResize?.();
      cleanupScriptListeners?.();
    };
  }, [appKey, lat, lng]);

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-md border border-ink/10 bg-[#eef1ed]">
      <div
        aria-label={`${title} 지도`}
        className={`absolute inset-0 transition-opacity duration-300 ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
        ref={containerRef}
      />

      {status !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center px-5 text-center">
          <div className="max-w-xs rounded-md bg-white/86 px-5 py-4 shadow-[0_14px_40px_rgba(36,36,36,0.08)] backdrop-blur">
            <p className="text-base font-semibold text-ink">{title}</p>
            {address ? <p className="mt-2 text-sm leading-6 text-ink/60">{address}</p> : null}
            <p className="mt-3 text-xs leading-5 text-ink/45">
              {status === "error"
                ? "지도를 불러오지 못했습니다. 카카오 개발자 콘솔의 Web 플랫폼 도메인을 확인해 주세요."
                : "지도를 준비하고 있어요."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
