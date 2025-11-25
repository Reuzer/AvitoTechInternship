import type { AxiosResponse } from "axios";
import { api } from "./client";
import type { adsResponse, Advertisement, ChartActivityStats, ChartCategoriesStats, ChartDecisionsStats, Moderator, QueryParameters, RejectOrChangeAd, Status, SummaryStats } from "./types";

export async function getAdvertisements (page: number, queryParameters: QueryParameters, status?: Status) {
    const advertisements: AxiosResponse<adsResponse> = await api.get('/ads', { params: { page, limit: 10, status, ...queryParameters } })
    if (advertisements.status === 200) {
        return advertisements.data
    } else {
        throw new Error('Ошибка при загрузке объявлений')
    }
}

export async function getAdvertisement (id: number) {
    const advertisement: AxiosResponse<Advertisement> = await api.get(`/ads/${id}`)

    if (advertisement.status === 200) {
        return advertisement.data
    } else {
        throw new Error('Ошибка при загрузке объявления');
    }
    
}

export async function approveAd (id: number) {
    const response = await api.post(`/ads/${id}/approve`);

    if(response.status === 200) {
        return 'Объявление успешно добавлено'
    }

    return new Error('Ошибка при подтверждении объявления')
}

export async function rejectAd (id: number, rejectData: RejectOrChangeAd) {
    const response = await api.post(`/ads/${id}/reject`, rejectData);

    if (response.status === 200) {
        return 'Объявление успешно откланено'
    }

    return new Error('Ошибка при отклонении объявления');
}

export async function changeAd(id: number, changeData: RejectOrChangeAd) {
    const response = await api.post(`/ads/${id}/request-changes`, changeData);

    if (response.status === 200) {
        return 'Объявление успешно изменено'
    }

    return new Error('Ошибка при изменении объявления');
}

export function getStats () {
    async function getSummaryStats() {
        const summaryStats: AxiosResponse<SummaryStats> = await api.get('/stats/summary');
        if(summaryStats.status === 200) {
            return summaryStats.data;
        } else {
            throw new Error('Ошибка при загрузке статистики')
        }
    }

    async function getChartActivityStats() {
        const activityStats: AxiosResponse<ChartActivityStats> = await api.get('/stats/chart/activity')
        if(activityStats.status === 200) {
            return activityStats.data;
        } else {
            throw new Error('Ошибка при загрузке статистики')
        }
    }

    async function getChartDecisionsStats() {
        const decisionsStats: AxiosResponse<ChartDecisionsStats> = await api.get('/stats/chart/decisions') 
        if(decisionsStats.status === 200) {
            return decisionsStats.data
        } 
         
    }

    async function getChartCategoriesStats() {
        const categoriesStats: AxiosResponse<ChartCategoriesStats> = await api.get('/stats/chart/categories')
        if(categoriesStats.status === 200){
            return categoriesStats.data
        } else {
            throw new Error('Ошибка при загрузке статистики')
        }
        
    }

    return {getSummaryStats, getChartActivityStats, getChartDecisionsStats, getChartCategoriesStats}
}

export async function getModerator() {
    const moderator: AxiosResponse<Moderator> = await api.get('/moderators/me');

    if (moderator.status === 200) {
        return moderator.data
    } else {
        throw new Error('Ошибка при загрузке данных о модераторе');
    }
}