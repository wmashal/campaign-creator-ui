import React, { useState, useEffect, useCallback } from 'react';
import VideoGenerationSettings from './VideoGenerationStep';
import AgentSelector from './AgentSelector';
import RunwayGenerationSettings from './RunwayGenerationSettings';
import StatusTimer from './StatusTimer'
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from '@mui/material';
import axios from 'axios';

const steps = ['Create Transcript', 'Generate Video', 'Upload to YouTube'];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const RepromptDialog = ({ open, onClose, onReprompt, currentPrompt, loading }) => {
    const [newPrompt, setNewPrompt] = useState(currentPrompt);
  
    const handleSubmit = () => {
      onReprompt(newPrompt);
      onClose();
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Prompt for Video Regeneration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            label="New Prompt"
            disabled={loading}
            sx={{ mt: 2 }}
            placeholder="Enter your new prompt for the video..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !newPrompt}
            color="primary"
          >
            Regenerate Video
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

const CampaignCreator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campaignData, setCampaignData] = useState({
    prompt: '',
    transcript: '',
    videoUrl: '',
    youtubeUrl: '',
  });
  const [videoGeneration, setVideoGeneration] = useState({
    jobId: null,
    status: null,
    progress: 0,
    videoUrl: null
  });

  // Video generation options
  const [videoOptions, setVideoOptions] = useState({
    promptText: '',
    model: '1.5',
    pikaffect: 'Inflate',
    options: {
      aspectRatio: '5:2',
      frameRate: 24,
      camera: {
        pan: 'right',
        tilt: 'up',
        rotate: 'cw',
        zoom: 'in'
      },
      parameters: {
        guidanceScale: 12,
        motion: 1,
        negativePrompt: '',
        seed: null
      },
      extend: false
    }
  });

  const [repromptDialogOpen, setRepromptDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('pika');
  const [runwayOptions, setRunwayOptions] = useState({
    aspect_ratio: 'landscape',
    seconds: 5,
    text_prompt: '',
    horizontal: 0,
    vertical: 0,
    roll: 0,
    zoom: 0,
    pan: 0,
    tilt: 0,
    seed: null,
    exploreMode: false
  });
  
  const checkVideoStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/video-status/${videoGeneration.jobId}`,
        {
          params: {
            agent: selectedAgent  // 'pika' or 'runway'
          }
        }
      );
      
      const statusData = response.data;
      console.log('Status check response:', statusData);
      
      setVideoGeneration(prev => ({
        ...prev,
        status: statusData.status,
        progress: statusData.progress || 0,
        videoUrl: statusData.video_url,
        metadata: statusData.metadata
      }));
  
      if (statusData.status === 'completed') {
        setVideoGeneration(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          videoUrl: statusData.video_url,
          metadata: statusData.metadata
        }));
      } else if (statusData.status === 'failed') {
        setError(statusData.message || 'Video generation failed');
      }
    } catch (err) {
      console.error('Error checking video status:', err);
      setError('Failed to check video status');
    }
  }, [videoGeneration.jobId, selectedAgent]);

  useEffect(() => {
    let pollInterval;
    
    if (videoGeneration.jobId && 
        videoGeneration.status !== 'completed' && 
        videoGeneration.status !== 'failed') {
      // Initial check immediately
      checkVideoStatus();
      // Then check every 30 seconds
      pollInterval = setInterval(checkVideoStatus, 30000); // 30 seconds
    }
  
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [videoGeneration.jobId, videoGeneration.status, checkVideoStatus]);

  const handlePromptChange = (event) => {
    setCampaignData({ ...campaignData, prompt: event.target.value });
  };

  const handleReprompt = async (newPrompt) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        promptText: newPrompt,
        video: videoGeneration.videoUrl,
        options: videoOptions.options
      };

      const response = await axios.post(
        'http://localhost:5000/api/reprompt-video',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_PIKA_API_KEY}`
          }
        }
      );

      if (response.data.job_id) {
        setVideoGeneration({
          jobId: response.data.job_id,
          status: 'pending',
          progress: 0,
          videoUrl: null
        });
        // Update the video options with new prompt
        setVideoOptions(prev => ({
          ...prev,
          promptText: newPrompt
        }));
      } else {
        setError('Failed to regenerate video');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate video');
    }
    setLoading(false);
};

  const generateTranscript = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/generate-transcript', {
        prompt: campaignData.prompt
      });

      if (response.data.status === 'success') {
        setCampaignData({ ...campaignData, transcript: response.data.transcript });
      } else {
        setError(response.data.message || 'Failed to generate transcript');
      }
    } catch (err) {
      setError('Failed to generate transcript. Please try again.');
    }
    setLoading(false);
  };

  const generateVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = selectedAgent === 'pika' 
        ? '/api/generate-video'
        : '/api/runway/generate-video';
  
      const payload = selectedAgent === 'pika'
        ? {
            ...videoOptions,
            promptText: campaignData.transcript
          }
        : {
            ...runwayOptions,
            text_prompt: campaignData.transcript
          };
  
      console.log('Generating video with payload:', payload);
  
      const response = await axios.post(endpoint, payload);
  
      console.log('Generation response:', response.data);
  
      if (response.data.job_id) {
        setVideoGeneration({
          jobId: response.data.job_id,
          status: 'pending',
          progress: 0
        });
        setActiveStep(1);
      } else {
        setError('Failed to start video generation');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate video');
    }
    setLoading(false);
  };

  const renderVideoGenerationStep = () => (
    <Box sx={{ mt: 2 }}>
      <AgentSelector 
        selectedAgent={selectedAgent} 
        onAgentChange={setSelectedAgent} 
      />
  
      {selectedAgent === 'pika' ? (
        <VideoGenerationSettings
          options={videoOptions}
          setOptions={setVideoOptions}
        />
      ) : (
        <RunwayGenerationSettings
          options={runwayOptions}
          setOptions={setRunwayOptions}
        />
      )}
  
      {videoGeneration.jobId && videoGeneration.status !== 'completed' && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Generating Video
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {videoGeneration.status}
                {videoGeneration.progress > 0 && ` - ${videoGeneration.progress}%`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Status updates every 30 seconds
              </Typography>
            </Box>
            <LinearProgress 
              variant={videoGeneration.progress > 0 ? "determinate" : "indeterminate"}
              value={videoGeneration.progress} 
              sx={{ mb: 2 }}
            />
            <StatusTimer nextCheck={30} />
          </CardContent>
        </Card>
      )}
  
      {videoGeneration.videoUrl && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated Video
            </Typography>
            
            {/* Video Metadata */}
            {videoGeneration.metadata && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Dimensions: {videoGeneration.metadata.dimensions?.[0]}x{videoGeneration.metadata.dimensions?.[1]}
                </Typography>
                {videoGeneration.metadata.frame_rate && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Frame Rate: {videoGeneration.metadata.frame_rate} fps
                  </Typography>
                )}
                {videoGeneration.metadata.duration && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Duration: {videoGeneration.metadata.duration.toFixed(1)}s
                  </Typography>
                )}
              </Box>
            )}
  
            {/* Video Player */}
            <video
              controls
              src={videoGeneration.videoUrl}
              style={{ width: '100%', maxHeight: '400px' }}
            >
              Your browser does not support the video tag.
            </video>
  
            {/* Action Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
                disabled={loading}
              >
                Continue to Upload
              </Button>
              
              {selectedAgent === 'pika' ? (
                // Pika's Edit & Regenerate
                <Button
                  variant="outlined"
                  onClick={() => setRepromptDialogOpen(true)}
                  disabled={loading}
                >
                  Edit & Regenerate
                </Button>
              ) : (
                // Runway's Regenerate
                <Button
                  variant="outlined"
                  onClick={generateVideo}
                  disabled={loading}
                >
                  Regenerate Video
                </Button>
              )}
  
              {/* Back Button */}
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Back to Transcript
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
  
      {!videoGeneration.jobId && !videoGeneration.videoUrl && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={generateVideo}
            disabled={loading}
          >
            Generate Video
          </Button>
          <Button
            variant="outlined"
            onClick={() => setActiveStep(0)}
            disabled={loading}
          >
            Back to Transcript
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderTranscriptStep = () => (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Enter your campaign details"
        value={campaignData.prompt}
        onChange={handlePromptChange}
        disabled={loading}
        placeholder="Describe your campaign goals, target audience, key messages, and any specific requirements..."
      />
      
      <Button
        variant="contained"
        color="primary"
        onClick={generateTranscript}
        disabled={!campaignData.prompt || loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Generating...' : 'Generate Transcript'}
      </Button>

      {campaignData.transcript && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated Transcript
            </Typography>
            <Typography
              variant="body1"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f5f5f5',
                padding: 2,
                borderRadius: 1,
                fontFamily: 'monospace'
              }}
            >
              {campaignData.transcript}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={generateTranscript}
                disabled={loading}
              >
                Regenerate
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={loading}
              >
                Continue to Video
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderTranscriptStep();
      case 1:
        return renderVideoGenerationStep();
      case 2:
        return <Typography>YouTube Upload Step (To be implemented)</Typography>;
      default:
        return null;
    }
  };

 
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Campaign Creator
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <RepromptDialog
        open={repromptDialogOpen}
        onClose={() => setRepromptDialogOpen(false)}
        onReprompt={handleReprompt}
        currentPrompt={videoOptions.promptText}
        loading={loading}
        />
      </Paper>
    </Container>
  );
};

export default CampaignCreator;