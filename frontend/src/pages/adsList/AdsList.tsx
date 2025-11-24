import { debounce } from "lodash";
import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAds } from "../../api/queries";
import type { adsResponse, QueryParameters, Status } from "../../api/types";
import styles from './AdsList.module.css'
import clsx from "clsx";

const AdsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const page = Number(searchParams.get('page')) || 1
    const searchQuery = searchParams.get('search') || ''
    const status = searchParams.get('status') as Status || ''

    const queryParams: QueryParameters = useMemo(() => ({
        searchQuery,
        status: status ? [status] : undefined,
        id: null,
        minPrice: null,
        maxPrice: null,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }), [searchQuery, status]);

    const { data, isLoading, isError } = useAds(page, queryParams);

    const handleSearch = debounce((val: string) => {
        setSearchParams(prev => {
            prev.set('search', val);
            prev.set('page', '1');
            return prev
        })
    }, 500)

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchParams(prev => {
            if (e.target.value) {
                prev.set('status', e.target.value)
            } else {
                prev.delete('status')
            }
            prev.set('page', '1');
            return prev;
        })
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', String(newPage));
            return prev
        })
    }

    const getPageNumbers = (currentPage: number, totalPages: number) => {
        const maxVisiblePages = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1

        if (endPage > totalPages) {
            endPage = totalPages
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages
    }

    if (isError) return <div className={styles.container}>Ошибка загрузки</div>
    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <input
                    className={styles.searchInput}
                    placeholder='Поиск'
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    type="text"
                />
                <select
                    className={styles.selectInput}
                    value={status}
                    onChange={handleStatusChange}
                >
                    <option value="">Все статусы</option>
                    <option value="pending">Требует проверки</option>
                    <option value="approved">Одобрено</option>
                    <option value="rejected">Откланено</option>
                </select>
            </div>



            {isLoading ? (
                <div>Загрузка...</div>
            ) : (
                <div className={styles.grid}>
                    {(data as adsResponse).ads.map(ad => (
                        <div key={ad.id} className={styles.card} onClick={() => navigate(`item/${ad.id}`)}>
                            <img
                                src={ad.images[0]}
                                alt={ad.title}
                                className={styles.cardImage}
                            />
                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.title}>{ad.title}</p>
                                </div>
                                <p className={styles.price}>{ad.price}</p>
                                <p className={styles.category}>{ad.category}</p>
                                <p className={clsx(styles.badge, styles[`badge_${ad.status}`])}>
                                    {ad.status === 'approved' && 'Одобрено'}
                                    {ad.status === 'rejected' && 'Отклонено'}
                                    {ad.status === 'pending' && 'Требует проверки'}
                                </p>
                                <p className={styles.date}>{ad.createdAt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data && (data as adsResponse).pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                    >←</button>

                    {getPageNumbers(page, (data as adsResponse).pagination.totalPages).map(pageNum => (
                        <button
                            key={pageNum}
                            className={clsx(styles.pageBtn, {
                                [styles.pageBtnActive]: pageNum === page
                            })}
                            onClick={() => handlePageChange(pageNum)}
                        >{pageNum}</button>
                    ))}

                    <button
                        className={styles.pageBtn}
                        disabled={page >= (data as adsResponse).pagination.totalPages}
                        onClick={() => handlePageChange(page + 1)}
                    ></button>
                </div>
            )}
        </div>
    );
}

export default AdsList