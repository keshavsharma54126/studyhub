import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
  } from '@livekit/components-react';
  
  import '@livekit/components-styles';
  
  import { Track } from 'livekit-client';
  
  const serverUrl = 'wss://myacademy-lznxzk2x.livekit.cloud';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzQxMTg1MTcsImlzcyI6IkFQSXhCeEYyYTJvSGJiOCIsIm5iZiI6MTczNDExMTMxNywic3ViIjoicXVpY2tzdGFydCB1c2VyIGFpc296ciIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiJxdWlja3N0YXJ0IHJvb20iLCJyb29tSm9pbiI6dHJ1ZX19.aMGFZGEFExV5hcI3pbtFSSBDCY3jWgcmU2ks9Zs_a1Q';
  
  export function VideoComponent() {
    return (
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ 
          height: '100%',
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <MyVideoConference />
        <RoomAudioRenderer />
        <div className='fixed bottom-0 left-0  p-4 bg-blackbackdrop-blur-sm '>
          <ControlBar 
            className='flex flex-row justify-center items-center gap-2 max-w-3xl mx-auto'
            controls={{
              microphone: true,
              camera: true,
              screenShare: true,
              leave: true
            }}
          />
        </div>
      </LiveKitRoom>
    );
  }
  
  function MyVideoConference() {
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { onlySubscribed: false },
    );
    return (
      <GridLayout 
        tracks={tracks} 
        style={{ 
          height: 'calc(100vh - 80px)',
          width: '100%',
          padding: '1rem'
        }}
      >
        <ParticipantTile />
      </GridLayout>
    );
  }
