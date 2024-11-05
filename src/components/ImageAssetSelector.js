import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Upload, Refresh } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ImageAssetSelector = ({ onSelect, selectedAssetId, label }) => {
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_URL}/api/runway/assets`;
      console.log('Fetching assets from:', url);
      
      const response = await axios.get(url, {
        params: {
          mediaType: 'image',
          offset: 0,
          limit: 50
        }
      });
      
      console.log('Assets response:', response.data);
      
      if (response.data.status === 'success') {
        setAssets(response.data.assets);
        if (selectedAssetId) {
          const asset = response.data.assets.find(a => a.assetId === selectedAssetId);
          setSelectedAsset(asset);
        }
      } else {
        setError(response.data.message || 'Failed to fetch assets');
      }
    } catch (error) {
      console.error('Error fetching assets:', error.response || error);
      setError(error.response?.data?.message || 'Error fetching assets');
    }
    setLoading(false);
  }, [selectedAssetId]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    setUploading(true);
    setError('');
    
    try {
      const url = `${API_URL}/api/runway/assets/upload`;
      console.log('Uploading file to:', url);
      
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);

      if (response.data.status === 'success') {
        await fetchAssets();
        if (response.data.asset_id) {
          onSelect(response.data.asset_id);
          setSelectedAsset(response.data.details);
        }
      } else {
        setError(response.data.message || 'Failed to upload asset');
      }
    } catch (error) {
      console.error('Error uploading asset:', error.response || error);
      setError(error.response?.data?.message || 'Error uploading asset');
    }
    setUploading(false);
  };

  useEffect(() => {
    let mounted = true;

    if (open && mounted) {
      fetchAssets();
    }

    return () => {
      mounted = false;
    };
  }, [open, fetchAssets]);

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={() => setOpen(true)}
        startIcon={selectedAsset ? 
          <img 
            src={selectedAsset.previewUrls?.[0]} 
            style={{ width: 20, height: 20, objectFit: 'cover' }} 
            alt="Selected"
          /> : null
        }
      >
        {selectedAsset ? `Change ${label} (${selectedAsset.assetId})` : `Select ${label}`}
      </Button>

      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          setError('');
        }}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Select Image Asset</Typography>
            <Box>
              <IconButton 
                onClick={fetchAssets} 
                disabled={loading || uploading}
                title="Refresh assets"
              >
                <Refresh />
              </IconButton>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id={`upload-image-${label}`}
                type="file"
                onChange={handleUpload}
              />
              <label htmlFor={`upload-image-${label}`}>
                <IconButton 
                  component="span" 
                  disabled={uploading}
                  title="Upload new image"
                >
                  <Upload />
                </IconButton>
              </label>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          
          {(loading || uploading) && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                {uploading ? 'Uploading...' : 'Loading assets...'}
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2}>
            {assets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.assetId}>
                <Card 
                  sx={{ 
                    border: asset.assetId === selectedAssetId ? 
                      '2px solid primary.main' : undefined
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      onSelect(asset.assetId);
                      setSelectedAsset(asset);
                      setOpen(false);
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={asset.previewUrls[0]}
                      alt={asset.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        ID: {asset.assetId}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {asset.name}
                      </Typography>
                      {asset.metadata?.dimensions && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {asset.metadata.dimensions[0]}x{asset.metadata.dimensions[1]}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {assets.length === 0 && !loading && !error && (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                No assets found. Upload an image to get started.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageAssetSelector;