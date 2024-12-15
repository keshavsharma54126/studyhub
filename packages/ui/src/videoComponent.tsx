"use client"
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
  
  
  export  function VideoComponent({token}:{token:string}) {

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
        <div className='fixed top-0 left-0 right-0 p-4 bg-black/50'>
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
