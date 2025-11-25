export type Category = 'Электроника' | 'Недвижимость' | 'Транспорт' | 'Работа' | 'Услуги' | 'Животные' | 'Мода' | 'Детское'
export type Status = 'pending' | 'approved' | 'rejected'
export type Priority = 'normal' | 'urgent'
export type RejectionReasons = 'Запрещенный товар' | 'Неверная категория' | 'Некорректное описание' | 'Проблемы с фото' | 'Подозрение на мошенничество' | 'Другое'

export interface RejectOrChangeAd {
    reason: RejectionReasons | '',
    comment: string,
}

export interface ModerationHistory {
    id: number,
    moderatorId: number,
    moderatorName: string,
    action: Status,
    reason: RejectionReasons | null,
    comment: string,
    timestamp: string,
}

export interface Advertisement {
    id: number,
    title: string,
    description: string,
    price: number,
    category: Category,
    categoryId: number,
    status: Status,
    priority: Priority,
    createdAt: string,
    updatedAt: string,
    images: string[]
    seller: {
        id: number,
        name: string,
        rating: number,
        totalAds: number,
        registeredAt: string,
    },
    characteristics: string[]
    moderationHistory?: ModerationHistory[]
}

export interface adsResponse {
    ads: Advertisement[],
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }
}

export interface QueryParameters {
    status?: Status[],
    categoryId: number | null,
    minPrice: number | null,
    maxPrice: number | null,
    search: string;
    sortBy: 'createdAt' | 'price' | 'priority'
    sortOrder: 'asc' | 'desc'
}

export interface SummaryStats {
    totalReviewed: number;
    totalReviewedToday: number;
    totalReviewedThisWeek: number;
    totalReviewedThisMonth: number;
    approvedPercentage: number;
    rejectedPercentage: number;
    requestChangesPercentage: number;
    averageReviewTime: number;
}

export interface ChartActivityStats {
    date: string,
    approved: number,
    rejected: number,
    requestChanges: number,
}[]

export interface ChartDecisionsStats {
    approved: number,
    rejected: number,
    requestChanges: number,
}

export interface ChartCategoriesStats {
    'Электроника': number,
    'Недвижимость': number,
    'Транспорт': number,
    'Работа': number,
    'Услуги': number,
    'Животные': number,
    'Мода': number,
    'Детское': number,
}

export interface Moderator {
    id: Number,
    name: string,
    email: string,
    role: string,
    statistics: {
        totalReviewed: number,
        todayReviewed: number,
        thisWeekReviewed: number,
        thisMonthReviewed: number,
        averageReviewTime: number,
        approvalRate: number
    },
    permissions: ['approve_ads' | 'reject_ads' | 'request_changes' | 'view_stats']
};