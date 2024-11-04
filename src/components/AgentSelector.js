import React from 'react';
import { 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Paper,
  Typography 
} from '@mui/material';

const AgentSelector = ({ selectedAgent, onAgentChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Select Video Generation Agent
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={selectedAgent}
          onChange={(e) => onAgentChange(e.target.value)}
        >
          <FormControlLabel 
            value="pika" 
            control={<Radio />} 
            label="Pika Art Agent" 
          />
          <FormControlLabel 
            value="runway" 
            control={<Radio />} 
            label="Runway Agent" 
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default AgentSelector;