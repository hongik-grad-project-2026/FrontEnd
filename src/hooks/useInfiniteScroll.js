import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 무한 스크롤 및 비동기 데이터 로딩을 처리하는 커스텀 훅
 *
 * @param {Array} queryKey - TanStack Query에서 사용하는 키
 * @param {Function} queryFn - 데이터를 불러오는 비동기 API 함수
 * @param {Function} getNextPageParam - 다음 페이지 번호/커서를 반환하는 함수
 * @param {Function} selectItems - 각 페이지 응답 구조에서 실제 아이템 배열만 추출하는 가공 함수
 * @param {number|string} initialPageParam - 첫 페이지 요청 시 사용할 파라미터 기본값
 * @param {string} rootMargin - IntersectionObserver의 관찰 감지 여백 범위
 */

export function useInfiniteScroll({
    queryKey,
    queryFn,
    getNextPageParam,
    selectItems = (page) => page.items ?? page.content ?? [], // 백엔드 응답 구조(items 또는 content) 대응
    initialPageParam = 0,
    rootMargin = "50px",
}) {

    const rootRef = useRef(null);      // 스크롤이 발생하는 컨테이너(부모) 요소
    const loadMoreRef = useRef(null);  // 화면 하단에서 스크롤을 감지할 타겟(자식) 요소

    // TanStack Query의 useInfiniteQuery 훅 실행
    const {
        data,                // 전체 페이지 데이터 객체 { pages: [...] 각 페이지의 데이터 응답 객체들 , pageParams: [...] 페이지 파라미터 목록 }
        fetchNextPage,       // 다음 페이지 데이터를 요청하는 함수
        hasNextPage,         // 다음 페이지가 존재하는지 여부 (boolean)
        isFetchingNextPage,  // 다음 페이지를 로딩 중인지 여부 (boolean)
        ...queryState        // isLoading, isError 등 기타 쿼리 상태값들을 하나로 묶음
    } = useInfiniteQuery({
        queryKey,
        queryFn,
        initialPageParam,
        getNextPageParam,
    });

    // Intersection Observer를 이용한 스크롤 하단 감지 로직
    useEffect(() => {
        const loadMoreTarget = loadMoreRef.current;

        // 예외 처리: Ref 요소가 없거나, 다음 페이지가 없거나, 이미 로딩 중이면 중단
        if (
            !loadMoreTarget ||
            !hasNextPage ||
            isFetchingNextPage
        ) {
            return undefined;
        }

        // IntersectionObserver 인스턴스 생성 (화면 교차 감지기) / 주요 오소 - Root (감지 기준 영역), Target (관찰 대상), Intersection (교차:Target이 Root의 영역 안에 얼마나 들어왔는지 판단)
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 감지 요소가 영역 안에 들어왔고(isIntersecting), 다음 페이지가 있으며(hasNextPage), 현재 로딩 중이 아닐 때(isFetchingNextPage) => 실행
                if (
                    entry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage(); // 다음 페이지 데이터 요청
                }
            },
            {
                root: null,              // 브라우저 viewport를 감지 기준으로 사용
                rootMargin,           // 지정한 마진만큼 타겟 요소가 다가오면 미리 감지 시작
            },
        );

        // 타겟 요소 감지 시작
        observer.observe(loadMoreTarget);

        // 클린업 함수: 컴포넌트가 언마운트되거나 조건 변경 시 기존 감지 해제
        return () => {
            observer.disconnect();
        };
    }, [
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        rootMargin,
    ]);

    // 페이지별 배열 데이터(data.pages)를 단일 평탄화 배열로 변환
    const items = data?.pages.flatMap(selectItems) ?? [];

    // 사용할 컴포넌트에서 필요한 상태 및 Ref 반환
    return {
        ...queryState,        // isLoading, isError 등 TanStack Query 기본 상태 전달
        data,                 // 원본 쿼리 데이터 객체
        items,                // 화면에 렌더링하기 편하도록 하나로 합쳐진 아이템 리스트
        hasNextPage,          // 다음 페이지 존재 여부
        isFetchingNextPage,   // 다음 페이지 로딩 상태
        rootRef,              // 스크롤 컨테이너 바인딩용 Ref
        loadMoreRef,          // 스크롤 감지용 타겟 요소를 위한 Ref
    };
}