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
  address?: string | null;
};

export function KakaoMapEmbed({ lat, lng, title, address }: KakaoMapEmbedProps) {
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
      <div className="grid aspect-[4/3] place-items-center rounded-md border border-ink/10 bg-porcelain px-5 text-center">
        <div>
          <p className="text-base font-semibold text-ink">{title}</p>
          {address ? <p className="mt-2 text-sm leading-6 text-ink/60">{address}</p> : null}
          <p className="mt-3 text-xs text-ink/45">
            지도 키 설정 후 이 영역에 카카오 지도가 표시됩니다.
          </p>
        </div>
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
