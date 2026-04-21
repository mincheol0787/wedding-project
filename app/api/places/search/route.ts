import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

type KakaoKeywordSearchResponse = {
  documents?: Array<{
    id: string;
    place_name: string;
    address_name: string;
    road_address_name: string;
    x: string;
    y: string;
    phone?: string;
    place_url?: string;
  }>;
};

const fallbackPlaces = [
  {
    id: "fallback-coex-convention",
    name: "COEX 컨벤션센터",
    address: "서울 강남구 영동대로 513",
    roadAddress: "서울 강남구 영동대로 513",
    lat: "37.511821",
    lng: "127.059151",
    phone: "02-6000-0114",
    placeUrl: "https://place.map.kakao.com/17955431"
  },
  {
    id: "fallback-a-wedding",
    name: "아펠가모 선릉",
    address: "서울 강남구 테헤란로 322",
    roadAddress: "서울 강남구 테헤란로 322",
    lat: "37.503075",
    lng: "127.048369",
    phone: "02-2183-0230",
    placeUrl: "https://place.map.kakao.com/24983066"
  },
  {
    id: "fallback-grand-hill",
    name: "그랜드힐컨벤션",
    address: "서울 강남구 역삼로 607",
    roadAddress: "서울 강남구 역삼로 607",
    lat: "37.499761",
    lng: "127.067307",
    phone: "02-6964-7889",
    placeUrl: "https://place.map.kakao.com/10374315"
  }
];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      {
        error: "검색어를 입력해주세요.",
        results: []
      },
      { status: 400 }
    );
  }

  if (!env.KAKAO_REST_API_KEY) {
    return NextResponse.json({
      warning: "카카오 REST API 키가 없어 기본 장소 목록에서 검색했습니다.",
      results: filterFallbackPlaces(query)
    });
  }

  try {
    const kakaoUrl = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
    kakaoUrl.searchParams.set("query", query);
    kakaoUrl.searchParams.set("size", "10");

    const response = await fetch(kakaoUrl, {
      headers: {
        Authorization: `KakaoAK ${env.KAKAO_REST_API_KEY}`
      },
      next: {
        revalidate: 60 * 60
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        warning: "카카오 장소 검색 응답이 원활하지 않아 기본 장소 목록에서 검색했습니다.",
        results: filterFallbackPlaces(query)
      });
    }

    const data = (await response.json()) as KakaoKeywordSearchResponse;

    return NextResponse.json({
      results: (data.documents ?? []).map((item) => ({
        id: item.id,
        name: item.place_name,
        address: item.address_name,
        roadAddress: item.road_address_name,
        lat: item.y,
        lng: item.x,
        phone: item.phone,
        placeUrl: item.place_url
      }))
    });
  } catch {
    return NextResponse.json({
      warning: "장소 검색 중 문제가 발생해 기본 장소 목록에서 검색했습니다.",
      results: filterFallbackPlaces(query)
    });
  }
}

function filterFallbackPlaces(query: string) {
  const normalized = query.toLowerCase();

  const results = fallbackPlaces.filter((place) =>
    [place.name, place.address, place.roadAddress].some((value) =>
      value.toLowerCase().includes(normalized)
    )
  );

  return results.length ? results : fallbackPlaces;
}
