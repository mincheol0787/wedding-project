"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao?: {
      maps: {
        load(callback: () => void): void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: Record<string, unknown>) => {
          setCenter(position: unknown): void;
        };
        Marker: new (options: Record<string, unknown>) => {
          setMap(map: unknown): void;
        };
      };
    };
  }
}

type KakaoMapEmbedProps = {
  lat: number;
  lng: number;
  title: string;
};

export function KakaoMapEmbed({ lat, lng, title }: KakaoMapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptError, setScriptError] = useState(false);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  useEffect(() => {
    if (!appKey || !containerRef.current) {
      return;
    }

    const initializeMap = () => {
      if (!window.kakao?.maps || !containerRef.current) {
        return;
      }

      window.kakao.maps.load(() => {
        if (!containerRef.current || !window.kakao?.maps) {
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
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-map="true"]');

    if (existing) {
      if (window.kakao?.maps) {
        initializeMap();
      } else {
        existing.addEventListener("load", initializeMap, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.dataset.kakaoMap = "true";
    script.onload = initializeMap;
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [appKey, lat, lng]);

  if (!appKey || scriptError) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-ink/10 bg-porcelain text-sm text-ink/55">
        지도를 불러올 수 없어 좌표만 표시합니다.
      </div>
    );
  }

  return (
    <div
      aria-label={`${title} 지도`}
      className="aspect-[4/3] overflow-hidden rounded-md border border-ink/10"
      ref={containerRef}
    />
  );
}
