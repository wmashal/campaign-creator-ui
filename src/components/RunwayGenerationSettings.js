import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Grid,  // Changed from Grid2 to Grid
  Divider,
  Box
} from '@mui/material';
import ImageAssetSelector from './ImageAssetSelector';

const RunwayGenerationSettings = ({ options, setOptions }) => {
  const handleOptionChange = (field, value) => {
    setOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Runway Video Settings
        </Typography>
        <Grid item xs={12} md={6}>
        <Box>
            <Typography variant="subtitle2" gutterBottom>
            First Frame Image
            </Typography>
            <ImageAssetSelector
            onSelect={(assetId) => handleOptionChange('firstImage_assetId', assetId)}
            selectedAssetId={options.firstImage_assetId}
            label="First Frame"
            />
        </Box>
        </Grid>

        <Grid item xs={12} md={6}>
        <Box>
            <Typography variant="subtitle2" gutterBottom>
            Last Frame Image
            </Typography>
            <ImageAssetSelector
            onSelect={(assetId) => handleOptionChange('lastImage_assetId', assetId)}
            selectedAssetId={options.lastImage_assetId}
            label="Last Frame"
            />
        </Box>
        <Divider sx={{ my: 2 }} />
        </Grid>
        <Grid container spacing={3}>  {/* Changed from Grid2 to Grid container */}
          {/* Aspect Ratio */}
          <Grid item xs={12} md={6}>  {/* Added item prop */}
            <FormControl fullWidth>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value={options.aspect_ratio}
                onChange={(e) => handleOptionChange('aspect_ratio', e.target.value)}
                label="Aspect Ratio"
              >
                <MenuItem value="landscape">Landscape</MenuItem>
                <MenuItem value="portrait">Portrait</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Video Duration */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Duration (seconds)</InputLabel>
              <Select
                value={options.seconds}
                onChange={(e) => handleOptionChange('seconds', e.target.value)}
                label="Duration (seconds)"
              >
                <MenuItem value={5}>5 seconds</MenuItem>
                <MenuItem value={10}>10 seconds</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Camera Motion Controls */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Camera Motion
            </Typography>
          </Grid>

          {/* Motion Controls */}
          {['horizontal', 'vertical', 'roll', 'zoom', 'pan', 'tilt'].map(motion => (
            <Grid item xs={12} md={6} key={motion}>
              <Typography variant="subtitle2" gutterBottom>
                {motion.charAt(0).toUpperCase() + motion.slice(1)} Motion (-10 to 10)
              </Typography>
              <Slider
                value={options[motion] || 0}
                onChange={(_, value) => handleOptionChange(motion, value)}
                min={-10}
                max={10}
                marks={[
                  { value: -10, label: '-10' },
                  { value: 0, label: '0' },
                  { value: 10, label: '10' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          ))}

          {/* Text Prompt */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Text Prompt"
              value={options.text_prompt || ''}
              onChange={(e) => handleOptionChange('text_prompt', e.target.value)}
              placeholder="Describe your video..."
            />
          </Grid>

          {/* Seed */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Seed"
              value={options.seed || ''}
              onChange={(e) => handleOptionChange('seed', parseInt(e.target.value))}
              helperText="Optional: Enter a seed number (1-4294967294)"
              InputProps={{
                inputProps: { min: 1, max: 4294967294 }
              }}
            />
          </Grid>

          {/* Max Jobs */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Jobs"
              value={options.maxJobs || '1'}
              onChange={(e) => handleOptionChange('maxJobs', parseInt(e.target.value))}
              helperText="Number of jobs to run (1-10)"
              InputProps={{
                inputProps: { min: 1, max: 10 }
              }}
            />
          </Grid>

          {/* Explore Mode */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.exploreMode || false}
                  onChange={(e) => handleOptionChange('exploreMode', e.target.checked)}
                />
              }
              label="Explore Mode (Runway Unlimited plan only)"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RunwayGenerationSettings;