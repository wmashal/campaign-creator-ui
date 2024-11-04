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
  Grid,
  Divider,
} from '@mui/material';

const VideoGenerationSettings = ({ options, setOptions }) => {
  const handleOptionChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested options (e.g., 'options.camera.pan')
      const [category, subcategory, property] = field.split('.');
      setOptions(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [subcategory]: {
            ...prev[category]?.[subcategory],
            [property]: value
          }
        }
      }));
    } else {
      // Handle top-level options
      setOptions(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Video Generation Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Model Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Model Version</InputLabel>
              <Select
                value={options.model}
                onChange={(e) => handleOptionChange('model', e.target.value)}
                label="Model Version"
              >
                <MenuItem value="1.0">Model 1.0</MenuItem>
                <MenuItem value="1.5">Model 1.5</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Pika Effect (Only for Model 1.5) */}
          {options.model === '1.5' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Pika Effect</InputLabel>
                <Select
                  value={options.pikaffect || 'Inflate'}
                  onChange={(e) => handleOptionChange('pikaffect', e.target.value)}
                  label="Pika Effect"
                >
                  {['Levitate', 'Decapitate', 'Eye-pop', 'Inflate', 'Melt',
                    'Explode', 'Squish', 'Crush', 'Cake-ify', 'Ta-da',
                    'Deflate', 'Crumble', 'Dissolve'].map(effect => (
                    <MenuItem key={effect} value={effect}>{effect}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Aspect Ratio */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value={options.options.aspectRatio}
                onChange={(e) => handleOptionChange('options.aspectRatio', e.target.value)}
                label="Aspect Ratio"
              >
                <MenuItem value="16:9">16:9</MenuItem>
                <MenuItem value="4:3">4:3</MenuItem>
                <MenuItem value="1:1">1:1</MenuItem>
                <MenuItem value="9:16">9:16</MenuItem>
                <MenuItem value="5:2">5:2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Frame Rate */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Frame Rate"
              value={options.options.frameRate}
              onChange={(e) => handleOptionChange('options.frameRate', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 60 } }}
            />
          </Grid>

          {/* Camera Controls */}
          <Grid item xs={12}>
            <Divider />
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Camera Settings
            </Typography>
          </Grid>

          {Object.entries({
            pan: ['none', 'left', 'right'],
            tilt: ['none', 'up', 'down'],
            rotate: ['none', 'cw', 'ccw'],
            zoom: ['none', 'in', 'out']
          }).map(([movement, movementOptions]) => (
            <Grid item xs={12} md={6} key={movement}>
              <FormControl fullWidth>
                <InputLabel>Camera {movement.charAt(0).toUpperCase() + movement.slice(1)}</InputLabel>
                <Select
                  value={options.options.camera[movement]}
                  onChange={(e) => handleOptionChange(`options.camera.${movement}`, e.target.value)}
                  label={`Camera ${movement.charAt(0).toUpperCase() + movement.slice(1)}`}
                >
                  {movementOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}

          {/* Guidance Scale */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Guidance Scale
            </Typography>
            <Slider
              value={options.options.parameters.guidanceScale}
              onChange={(_, value) => handleOptionChange('options.parameters.guidanceScale', value)}
              min={1}
              max={20}
              step={0.1}
              marks={[
                { value: 1, label: '1' },
                { value: 12, label: '12' },
                { value: 20, label: '20' }
              ]}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* Motion Scale */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Motion Scale
            </Typography>
            <Slider
              value={options.options.parameters.motion}
              onChange={(_, value) => handleOptionChange('options.parameters.motion', value)}
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' }
              ]}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* Negative Prompt */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Negative Prompt"
              value={options.options.parameters.negativePrompt}
              onChange={(e) => handleOptionChange('options.parameters.negativePrompt', e.target.value)}
              placeholder="Elements to avoid in the generation"
            />
          </Grid>

          {/* Extend Option */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.options.extend}
                  onChange={(e) => handleOptionChange('options.extend', e.target.checked)}
                />
              }
              label="Extend Video"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VideoGenerationSettings;