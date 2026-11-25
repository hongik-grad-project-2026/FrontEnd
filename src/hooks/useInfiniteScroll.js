import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 무한 스크롤과 비동기 데이터 로딩을 처리하는 커스텀 훅임.
 *
 * @param {Array} queryKey - TanStack Query에서 사용하는 키임.
 * @param {Function} queryFn - 데이터를 불러오는 비동기 API 함수임.
 * @param {Function} getNextPageParam - 다음 페이지 번호나 커서를 반환하는 함수임.
 * @param {Function} selectItems - 각 페이지 응답에서 실제 아이템 배열만 추출하는 함수임.
 * @param {number|string} initialPageParam - 첫 페이지 요청에 사용할 기본 파라미터임.
 * @param {string} rootMargin - IntersectionObserver의 관찰 감지 여백임.
 */

export function useInfiniteScroll({
    enabled = true,
    queryKey,
    queryFn,
    getNextPageParam,
    selectItems = (page) => page.items ?? page.content ?? [], // 백엔드의 items 또는 content 응답 구조에 대응함.
    initialPageParam = 0,
    rootMargin = "50px",
}) {

    const rootRef = useRef(null);      // 스크롤이 발생하는 부모 컨테이너 요소임.
    const loadMoreRef = useRef(null);  // 화면 하단의 스크롤 감지 대상 요소임.

    // TanStack Query의 useInfiniteQuery 훅을 실행함.
    const {
        data,                // pages와 pageParams를 포함한 전체 페이지 데이터 객체임.
        fetchNextPage,       // 다음 페이지 데이터를 요청하는 함수임.
        hasNextPage,         // 다음 페이지 존재 여부임.
        isFetchingNextPage,  // 다음 페이지 로딩 여부임.
        ...queryState        // isLoading과 isError 등의 기타 쿼리 상태값을 묶음.
    } = useInfiniteQuery({
        enabled,
        queryKey,
        queryFn,
        initialPageParam,
        getNextPageParam,
    });

    // IntersectionObserver로 스크롤 하단을 감지함.
    useEffect(() => {
        const loadMoreTarget = loadMoreRef.current;

        // 비활성 상태이거나 감지 요소·다음 페이지가 없거나 로딩 중이면 observer를 생성하지 않음.
        if (
            !enabled ||
            !loadMoreTarget ||
            !hasNextPage ||
            isFetchingNextPage
        ) {
            return undefined;
        }

        // Root와 Target의 교차 상태를 감지하는 IntersectionObserver 인스턴스를 생성함.
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 활성 상태에서 감지 요소가 보일 때만 다음 페이지를 요청함.
                if (
                    enabled &&
                    entry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage(); // 다음 페이지 데이터를 요청함.
                }
            },
            {
                root: null,           // 브라우저 viewport를 감지 기준으로 사용함.
                rootMargin,           // 대상 요소가 지정한 여백에 진입하면 감지를 시작함.
            },
        );

        // 대상 요소 감지를 시작함.
        observer.observe(loadMoreTarget);

        // 컴포넌트 언마운트나 조건 변경 시 기존 감지를 해제함.
        return () => {
            observer.disconnect();
        };
    }, [
        enabled,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        rootMargin,
    ]);

    // 페이지별 배열 데이터인 data.pages를 단일 배열로 변환함.
    const items = data?.pages.flatMap(selectItems) ?? [];

    // 사용 컴포넌트에 필요한 상태와 Ref를 반환함.
    return {
        ...queryState,        // TanStack Query의 기본 상태를 전달함.
        data,                 // 원본 쿼리 데이터 객체임.
        items,                // 화면 렌더링을 위해 하나로 합친 아이템 목록임.
        hasNextPage,          // 다음 페이지 존재 여부임.
        isFetchingNextPage,   // 다음 페이지 로딩 상태임.
        rootRef,              // 스크롤 컨테이너 바인딩용 Ref임.
        loadMoreRef,          // 스크롤 감지 대상 요소용 Ref임.
    };
}
