import dayjs from 'dayjs';

export const formatDate = (value: string | Date) => dayjs(value).format('MMM D, YYYY');
