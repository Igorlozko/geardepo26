import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { useValue } from '../../../context/ContextProvider';
import { Stack } from '@mui/material';

const AddDate = ({gearId}) => {
  const { state: { dateRange, selectedGearId },gear, updateDateRange, dispatch } = useValue();
  const [picking, setPicking] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: dateRange[0],
    endDate: dateRange[1],
    key: 'selection',
  });
  const [reservedDates, setReservedDates] = useState({});
  
  useEffect(() => {
    fetchReservedDates(gearId);
  }, [gearId]);

  const fetchReservedDates = async (gearId) => {
    try {
      console.log('id gear:', gearId);
      const response = await fetch(`http://localhost:5000/reservation/reserved-dates?gearId=${gearId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reserved dates');
      }
      const data = await response.json();
      console.log('Fetched reserved dates for gear:', gearId, data); // Log the fetched data
      setReservedDates({ ...reservedDates, [gearId]: data }); // Update reserved dates for the specific gear
    } catch (error) {
      console.error('Error fetching reserved dates:', error);
    }
  };

  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    const isDateReserved = Array.isArray(reservedDates[selectedGearId]) && reservedDates[selectedGearId].some(reservation => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);
      const selectedStart = new Date(startDate);
      const selectedEnd = new Date(endDate);
      return (
        (selectedStart >= start && selectedStart <= end) ||
        (selectedEnd >= start && selectedEnd <= end)
      );
    });
  
    if (!isDateReserved) {
      setSelectionRange(ranges.selection);
      updateDateRange([startDate, endDate]);
      dispatch({
        type: 'UPDATE_DATE_RANGE',
        payload: [startDate, endDate],
      });
      if (!picking) setPicking(true);
    }
  };
  
  const renderDay = (dateItem) => {
    // Check if reservedDates[selectedGearId] is an array and contains reserved dates
    const isReserved = Array.isArray(reservedDates[selectedGearId]) && reservedDates[selectedGearId].some(reservation => {
      // Convert reservation start and end dates to Date objects
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      // Check if the current date is within the range of this reservation
      return dateItem >= startDate && dateItem <= endDate;
    });
    
    // Define the style object for the day container
    const dayContainerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 30,
      height: 30,
      borderRadius: '50%',
      backgroundColor: isReserved ? '#f0f0f0' : 'transparent',
      cursor: isReserved ? 'not-allowed' : 'pointer',
    };
    
    // Define the style object for the number part of the date
    const dayNumberStyle = {
      color: isReserved ? '#888' : '#333',
    };
    
    // Return the JSX for the day container
    return (
      <div style={dayContainerStyle}>
        <span style={dayNumberStyle}>{dateItem.getDate()}</span>
      </div>
    );
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',
        '& .MuiTextField-root': { width: '100%', maxWidth: 500, m: 1 },
      }}
    >
      <DateRangePicker
        ranges={[selectionRange]}
        onChange={handleSelect}
        className="custom-date-range-picker"
        dayContentRenderer={(dateItem) => renderDay(dateItem)}
      />
    </Stack>
  );
};

export default AddDate;
