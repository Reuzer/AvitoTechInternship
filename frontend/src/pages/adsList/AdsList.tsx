import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAds } from "../../api/queries";
import type { adsResponse,  QueryParameters, Status } from "../../api/types";
import styles from './AdsList.module.css'
import clsx from "clsx";

const categories = [
    {
        category: 'Электроника',
        categoryId: 0
    }, 
    {
        category: 'Недвижимость',
        categoryId: 1,
    },
    {
        category: 'Транспорт',
        categoryId: 2,
    },
    {
        category: 'Работа', 
        categoryId: 3,
    },
    {
        category: 'Услуги',
        categoryId: 4,
    },
    {
        category: 'Животные',
        categoryId: 5,
    },
    {
        category: 'Мода',
        categoryId: 6,
    },
    {
        category: 'Детское',
        categoryId: 7,
    }
]

const UrgentCircle = () => {
    return (
        <div 
        style={{width: '15px', height: '15px', borderRadius: '50%', backgroundColor: 'red', marginTop: '15px'}}>
        </div>
    )
}

const AdsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const page = Number(searchParams.get('page')) || 1
    const urlSearchQuery = searchParams.get('search') || '';
    const selectedStatuses = searchParams.getAll('status') as Status[]
    const sortOrder: 'asc' | 'desc' = searchParams.get('sortOrder') as 'asc' | 'desc'  || ''
    const sortBy: 'createdAt' | 'price' | 'priority' = searchParams.get('sortBy') as 'createdAt' | 'price' | 'priority' || '';
    const minPrice: string | null = searchParams.get('minPrice') as string || ''
    const maxPrice: string | null = searchParams.get('maxPrice') as string || ''
    const categoryId: string = searchParams.get('categoryId') as string || ''

    const [localSearch, setLocalSearch] = useState(urlSearchQuery);

    useEffect(() => {
        setLocalSearch(urlSearchQuery)
    }, [urlSearchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== urlSearchQuery) {
                setSearchParams(prev => {
                    const newParams = new URLSearchParams(prev);
                    if(localSearch) {
                        newParams.set('search', localSearch)
                    } else {
                        newParams.delete('search');
                    }
                    newParams.set('page', '1');
                    return newParams;
                })
            }
        }, 500)

        return () => clearTimeout(timer);
    }, [localSearch, urlSearchQuery, setSearchParams])


    const queryParams: QueryParameters = useMemo(() => ({
        search: urlSearchQuery,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        categoryId: Number(categoryId) ? Number(categoryId) : null,
        minPrice: Number(minPrice) ? Number(minPrice) : null,
        maxPrice: Number(maxPrice) ? Number(maxPrice) : null,
        sortBy: sortBy,
        sortOrder: sortOrder
    }), [urlSearchQuery, selectedStatuses, sortOrder, sortBy, minPrice, maxPrice, categoryId]);

    const { data, isLoading, isError } = useAds(page, queryParams);

    console.log(data)

    const handleStatusToggle = (value: Status) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            const current = newParams.getAll('status') as Status[];

            newParams.delete('status')

            if (current.includes(value)) {
                current.filter(s => s !== value).forEach(s => newParams.append('status', s))
            } else {
                [...current, value].forEach(s => newParams.append('status', s))
            }

            newParams.set('page', '1');
            return newParams;
        })
    }

    const handleSortOrderSelect = (e : React.ChangeEvent<HTMLSelectElement>) => {
        setSearchParams(prev => {
            prev.set('sortOrder', e.target.value)
            return prev;
        })
    } 

    const handleSortBySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchParams(prev => {
            prev.set('sortBy', e.target.value);
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

    const currentIds = data?.ads.map(ad => ad.id) || [];

    if (isError) return <div className={styles.container}>Ошибка загрузки</div>
    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <input
                    className={styles.searchInput}
                    placeholder='Поиск'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    type="text"
                />
                <div className={styles.checkboxGroup}>
                    <p className={styles.checkboxLabel}>Статус:</p>
                    {['pending', 'approved', 'rejected'].map((statusValue) => (
                        <label key={statusValue} className={styles.checkboxItem}>
                            <input 
                            type="checkbox"
                            checked={selectedStatuses.includes(statusValue as Status)}
                            onChange={() => handleStatusToggle(statusValue as Status)}
                            />
                            <span>
                                {statusValue === 'pending' && 'Требует проверки'}
                                {statusValue === 'approved' && 'Одобрено'}
                                {statusValue === 'rejected' && 'Отклонено'}
                            </span>
                        </label>
                    ))}
                </div>
                <div className={styles.categoryGroup}>
                    <p>Категория</p>
                    <select 
                    className={styles.categorySelect}
                    value={categoryId ? categoryId : ''}
                    onChange={(e) => {
                        setSearchParams(prev => {
                            prev.set('categoryId', e.target.value)
                            prev.set('page', '1')
                            return prev;
                        })
                    }}
                    >
                        <option value="" disabled>--Категория--</option>
                        {categories.map(cat => (
                            <option value={cat.categoryId}>{cat.category}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.sortGroup}>
                    <p>Сортировка</p>
                    <select value={sortBy} onChange={(e) => handleSortBySelect(e)}>
                        <option value='createdAt'>По дате создания</option>
                        <option value="price">По цене</option>
                        <option value="priority">По приоритету</option>
                    </select>
                    <select 
                    value={sortOrder} 
                    onChange={(e) => handleSortOrderSelect(e)} 
                    className={styles.sortOrderSelect}
                    >
                        <option value="asc">По возрастанию</option>
                        <option value="desc">По убыванию</option>
                    </select>
                </div>
                <div className={styles.priceGroup}>
                    <p>Цена</p>
                    <label htmlFor="minPrice">От</label>
                    <input 
                    type="text"
                    name='minPrice' 
                    value={minPrice}
                    onChange={(e) => {
                        setSearchParams(prev=>{
                            prev.set('minPrice', e.target.value)
                            prev.set('page', '1')
                            return prev
                        })
                    }}
                    />
                    <label htmlFor="maxPrice">До</label>
                    <input 
                    type="text"
                    name='maxPrice'
                    value={maxPrice}
                    onChange={(e) => {
                        setSearchParams(prev=>{
                            prev.set('maxPrice', e.target.value)
                            prev.set('page', '1')
                            return prev
                        })
                    }}
                    />
                </div>

                <button
                onClick={() => {
                    setSearchParams({'page' : '1'});
                }}
                className={styles.cancelFiltersBtn}
                >Сбросить все фильтры</button>
            </div>



            {isLoading ? (
                <div>Загрузка...</div>
            ) : (
                <div className={styles.grid}>
                    {(data as adsResponse).ads.map((ad) => (
                        <div key={ad.id} className={styles.card} onClick={() => navigate(`/item/${ad.id}`, {
                            state: { allIds: currentIds } 
                        })} >
                            <img
                                src={ad.images[0]}
                                alt={ad.title}
                                className={styles.cardImage}
                            />
                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.title}>{ad.title}</p>
                                </div>
                                <p className={styles.price}>{ad.price}р</p>
                                <p className={styles.category}>{ad.category}</p>
                                <p className={clsx(styles.badge, styles[`badge_${ad.status}`])}>
                                    {ad.status === 'approved' && 'Одобрено'}
                                    {ad.status === 'rejected' && 'Отклонено'}
                                    {ad.status === 'pending' && 'Требует проверки'}
                                </p>
                                {ad.priority === 'urgent' && <UrgentCircle />}
                                <p className={styles.date}>{ad.createdAt.slice(0, 10)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className={styles.totalPages}>Всего объявлений: {(data as adsResponse)?.pagination.totalItems}</div>

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
                    >→</button>
                </div>
            )}
            
        </div>
    );
}

export default AdsList;