export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
};

export const getStatusBadgeColor = (status) => {
  if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
  const s = status.toLowerCase();
  if (s === 'active' || s === 'completed' || s === 'paid' || s === 'available' || s === 'confirmed' || s === 'approved') {
    return 'bg-hospital-50 text-hospital-700 border-hospital-200 dark:bg-hospital-950/60 dark:text-hospital-300 dark:border-hospital-800';
  }
  if (s === 'pending' || s === 'scheduled' || s === 'in progress') {
    return 'bg-soft-sage/35 text-deep-forest border-soft-sage dark:bg-slate-800 dark:text-soft-sage dark:border-soft-sage/40';
  }
  if (s === 'low stock' || s === 'unpaid' || s === 'warning') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  }
  if (s === 'cancelled' || s === 'inactive' || s === 'out of stock' || s === 'rejected' || s === 'overdue' || s === 'urgent') {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  }
  return 'bg-muted-teal/15 text-muted-teal border-muted-teal/30 dark:bg-muted-teal/20 dark:text-soft-sage dark:border-muted-teal/40';
};
