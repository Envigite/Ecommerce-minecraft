export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.PAID]: 'Pagado',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'bg-orange-900/30 text-orange-300 border-orange-800',
  [ORDER_STATUS.PAID]: 'bg-green-900/30 text-green-300 border-green-800',
  [ORDER_STATUS.SHIPPED]: 'bg-blue-900/30 text-blue-300 border-blue-800',
  [ORDER_STATUS.DELIVERED]: 'bg-purple-900/30 text-purple-300 border-purple-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-900/30 text-red-300 border-red-800',
};