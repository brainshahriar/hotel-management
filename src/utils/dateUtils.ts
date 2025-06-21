import { format, addDays, eachDayOfInterval, parseISO } from 'date-fns';

/**
 * Formats a date string to a readable format
 * @param dateString ISO date string
 * @param formatStr date-fns format string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    return dateString;
  }
};

/**
 * Generates an array of dates between start and end dates
 * @param startDate Start date (ISO string)
 * @param endDate End date (ISO string)
 * @returns Array of date strings in ISO format
 */
export const getDateRange = (startDate: string, endDate: string): string[] => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return eachDayOfInterval({ start, end }).map(date => 
      format(date, 'yyyy-MM-dd')
    );
  } catch (error) {
    return [];
  }
};

/**
 * Formats a price value as currency
 * @param price Price value
 * @param currency Currency code
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Calculates the number of nights between check-in and check-out dates
 * @param checkInDate Check-in date (ISO string)
 * @param checkOutDate Check-out date (ISO string)
 * @returns Number of nights
 */
export const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  try {
    const start = parseISO(checkInDate);
    const end = parseISO(checkOutDate);
    
    // Calculate difference in milliseconds and convert to days
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

/**
 * Adds days to a date and returns ISO string
 * @param dateString ISO date string
 * @param days Number of days to add
 * @returns New date as ISO string
 */
export const addDaysToDate = (dateString: string, days: number): string => {
  try {
    const date = parseISO(dateString);
    const newDate = addDays(date, days);
    return format(newDate, 'yyyy-MM-dd');
  } catch (error) {
    return dateString;
  }
};
