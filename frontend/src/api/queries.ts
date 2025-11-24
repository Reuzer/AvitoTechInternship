import { approveAd, changeAd, getAdvertisement, getAdvertisements, getStats, rejectAd } from './httpRequests';
import type { QueryParameters, RejectOrChangeAd } from './types';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'

export const adKeys = {
    all: ['ads'] as const,
    lists: () => [...adKeys.all, 'list'] as const,
    list: (page: number, params: QueryParameters) => [adKeys.lists(), { page, ...params }] as const,
    details: () => [...adKeys.all, 'detail'] as const,
    detail: (id: number) => [...adKeys.details(), id] as const,
    stats: ['stats'] as const,
}

export function useAds(page: number, params: QueryParameters) {
    return useQuery({
        queryKey: adKeys.list(page, params),
        queryFn: () => getAdvertisements(page, params, params.status?.[0]),
        placeholderData: keepPreviousData,
    })
}

export function useAdDetails (id: number) {
    return useQuery({
        queryKey: adKeys.detail(id),
        queryFn: () => getAdvertisement(id),
        enabled: !!id,
    })
}

export function useAdMutations()  {
    const queryClient = useQueryClient();

    const approve = useMutation({
        mutationFn: (id: number) => approveAd(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: adKeys.all})
    })

    const reject = useMutation({
        mutationFn: ({id, data} : {id: number, data: RejectOrChangeAd}) => rejectAd(id, data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: adKeys.all}) 
    })

    const change = useMutation({
        mutationFn: ({id, data}: {id: number, data: RejectOrChangeAd}) => changeAd(id, data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: adKeys.all})
    })

    return {approve, reject, change}
}

export function useModerationStats() {
    const statsApi = getStats()

    return useQuery({
        queryKey: adKeys.stats,
        queryFn: async () => {
            const [summary, activity, decisions, categories] = await Promise.all([
                statsApi.getSummaryStats(),
                statsApi.getChartActivityStats(),
                statsApi.getChartDecisionsStats(),
                statsApi.getChartCategoriesStats(),
            ]);

            return {summary, activity, decisions, categories}
        } 
    })
}