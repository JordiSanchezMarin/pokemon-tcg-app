import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCardPricing } from '../../hooks/usePrices';
import { useCardQuery } from '../../hooks/useTcgdexQueries';
import CardCollectionManager from './CardCollectionManager';
import CardOverview from './CardOverview';
import CardPrices from './CardPrices';
import '../../components/CardDetail.css';

export default function CardDetailPage({ collection }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const cardQuery = useCardQuery(id);
  const card = cardQuery.data || null;
  const { prices, cardMarketUrl } = useCardPricing(card);

  if (cardQuery.isPending) {
    return <div className="loading-detail">Cargando detalles de la carta...</div>;
  }

  if (cardQuery.isError || !card) {
    return (
      <div className="error-detail">
        {cardQuery.isError ? 'Error al obtener los detalles de la carta.' : 'Carta no encontrada.'}
      </div>
    );
  }

  return (
    <div className="card-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>&larr; Volver</button>

      <div className="card-detail-content">
        <div className="card-image-section">
          {card.image ? (
            <img src={`${card.image}/high.webp`} alt={card.name} className="card-detail-img" />
          ) : (
            <div className="card-detail-img-placeholder">Imagen no disponible</div>
          )}
        </div>

        <div className="card-info-section">
          <CardOverview card={card} cardMarketUrl={cardMarketUrl} />
          <CardCollectionManager card={card} collection={collection} />
        </div>

        <CardPrices prices={prices} />
      </div>
    </div>
  );
}