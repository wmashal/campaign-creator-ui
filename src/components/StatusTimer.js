import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const StatusTimer = ({ nextCheck }) => {
  const [secondsLeft, setSecondsLeft] = useState(nextCheck);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return nextCheck;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextCheck]);

  return (
    <Typography variant="caption" color="text.secondary">
      Next status check in: {secondsLeft} seconds
    </Typography>
  );
};

export default StatusTimer;