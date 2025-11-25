import  { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAdDetails, useAdMutations } from '../../api/queries';
import type { RejectionReasons } from '../../api/types';
import clsx from 'clsx';
import styles from './AdDetail.module.css';

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: ad, isLoading } = useAdDetails(Number(id));
  const { approve, reject, change } = useAdMutations();

  const [modalType, setModalType] = useState<'reject' | 'change' | null>(null);
  const [reason, setReason] = useState<RejectionReasons | ''>('');
  const [comment, setComment] = useState('');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAction = async () => {
    if (!modalType || !id) return;
    const payload = { reason: reason as RejectionReasons, comment };
    
    try {
        if (modalType === 'reject') {
          await reject.mutateAsync({ id: Number(id), data: payload });
        } else {
          await change.mutateAsync({ id: Number(id), data: payload });
        }
        setModalType(null);
        navigate('/list');
    } catch (e) {
        console.error(e);
    }
  };

  const allIds = (location.state as { allIds?: number[] })?.allIds;
  const currentIndex = allIds ? allIds.indexOf(Number(id)) : -1;
  
  const prevId = allIds && currentIndex > 0 ? allIds[currentIndex - 1] : undefined;
  const nextId = allIds && currentIndex > -1 && currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : undefined;

  const goToAd = (targetId: number) => {
      navigate(`/item/${targetId}`, { 
          state: { allIds }
      });
  };

  
  const nextImage = () => {
    if(!(ad instanceof Error)){
        if (!ad?.images) return;
        setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    }
  };

  const prevImage = () => {
    if(!(ad instanceof Error)) {
        if (!ad?.images) return;
        setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    }
  };

  if (isLoading) return <div className={styles.container}>Загрузка...</div>;
  if (!ad) return <div className={styles.container}>Объявление не найдено</div>;

  const images = ad.images && ad.images.length > 0 
    ? ad.images 
    : ['https://via.placeholder.com/600x400?text=No+Image'];

  return (
    <div className={styles.container}>
      <div className={styles.topNav}>
          <button className={styles.backBtn} onClick={() => navigate('/list')}>
             ← Назад к списку
          </button>
          <div className={styles.navButtons}>
              <button 
                  className={styles.navBtnSmall} 
                  disabled={!prevId}
                  onClick={() => prevId && goToAd(prevId)}
                  title="Предыдущее объявление (Shift + ←)"
              >
                  ← Пред.
              </button>
              <button 
                  className={styles.navBtnSmall} 
                  disabled={!nextId}
                  onClick={() => nextId && goToAd(nextId)}
                  title="Следующее объявление (Shift + →)"
              >
                  След. →
              </button>
          </div>
      </div>
      
      <div className={styles.layout}>
        <div className={styles.columnLeft}>
             <div className={styles.galleryContainer}>
                <img 
                    src={images[currentImageIndex]} 
                    className={styles.mainImage}
                    alt={`${ad.title} - ${currentImageIndex + 1}`}
                />
                
                {images.length > 1 && (
                    <>
                        <button className={clsx(styles.navBtn, styles.navBtnPrev)} onClick={prevImage}>
                            ❮
                        </button>
                        <button className={clsx(styles.navBtn, styles.navBtnNext)} onClick={nextImage}>
                            ❯
                        </button>
                        <div className={styles.galleryCounter}>
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </>
                )}
             </div>
             
             {images.length > 1 && (
                 <div className={styles.thumbnails}>
                     {images.map((img, idx) => (
                         <img 
                            key={idx}
                            src={img}
                            className={clsx(styles.thumbnail, idx === currentImageIndex && styles.thumbnailActive)}
                            onClick={() => setCurrentImageIndex(idx)}
                            alt={`Thumbnail ${idx}`}
                         />
                     ))}
                 </div>
             )}
        </div>

        <div className={styles.columnRight}>
          <h1>{ad.title}</h1>
          <div className={styles.price}>{ad.price} ₽</div>
          
          <div className={styles.infoRow}>
            <span className={clsx(styles.badge, styles[`badge_${ad.status}`])}>
                {ad.status === 'pending' && 'На модерации'}
                {ad.status === 'approved' && 'Одобрено'}
                {ad.status === 'rejected' && 'Отклонено'}
            </span>
            <span className={styles.category}>{ad.category}</span>
          </div>
          
          <div className={styles.sellerBox}>
            <strong>Продавец:</strong> {ad.seller.name} <br/>
            <small>Рейтинг: {ad.seller.rating} • На сайте с {new Date(ad.seller.registeredAt).toLocaleDateString()}</small>
          </div>
          <div className={styles.moderationHistory}>
            <h3>История модерации: </h3>
            {ad.moderationHistory?.map(item => (
                <div className={styles.moderationHistoryContent}>
                    <p>{item.action}</p>
                    <p>{item.reason}</p>
                    <p>{item.comment}</p>
                    <p>{item.moderatorName}</p>
                </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button 
                className={clsx(styles.btn, styles.btnSuccess)}
                onClick={() => { approve.mutate(Number(id)); navigate('/list'); }}
            >
                Одобрить
            </button>
            <button 
                className={clsx(styles.btn, styles.btnWarning)}
                onClick={() => setModalType('change')}
            >
                Доработка
            </button>
            <button 
                className={clsx(styles.btn, styles.btnError)}
                onClick={() => setModalType('reject')}
            >
                Отклонить
            </button>
          </div>
        </div>
      </div>

      {modalType && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
                {modalType === 'reject' ? 'Отклонение объявления' : 'Вернуть на доработку'}
            </h3>
            
            <select 
                className={styles.textarea} 
                style={{ height: '40px', minHeight: 'auto' }}
                value={reason}
                onChange={(e) => setReason(e.target.value as RejectionReasons)}
            >
                <option value="" disabled>Выберите причину</option>
                {['Запрещенный товар', 'Неверная категория', 'Некорректное описание', 'Другое'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>

            <textarea
                className={styles.textarea}
                placeholder="Комментарий для продавца..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />

            <div className={styles.modalActions}>
                <button className={clsx(styles.btn, styles.btnCancel)} onClick={() => setModalType(null)}>Отмена</button>
                <button 
                    className={clsx(styles.btn, styles.btnSuccess)} 
                    onClick={handleAction}
                    disabled={!reason}
                >
                    Подтвердить
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetail;
