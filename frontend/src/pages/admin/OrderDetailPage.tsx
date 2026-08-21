import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { useTracking } from '../../hooks/useTracking';
import { CustomerOrderTrackingPage } from '../customer/OrderTrackingPage';

export const AdminOrderDetailPage: React.FC = () => {
  return <CustomerOrderTrackingPage />;
};
