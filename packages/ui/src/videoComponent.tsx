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
import { Button } from './button.js';
  
  const serverUrl = 'wss://myacademy-lznxzk2x.livekit.cloud';
  
  
  export  function VideoComponent({token,isHost}:{token:string,isHost:boolean}) {

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
        <MyVideoConference isHost={isHost} />
        <RoomAudioRenderer />
        <div className='flex flex-col fixed left-0 top-0 right-0   border-t border-gray-200 rounded-xl '>
          <ControlBar 
            className='flex flex-row justify-center items-center gap-2 max-w-3xl mx-auto'
            controls={{
              microphone: isHost,
              camera: isHost,
              screenShare: isHost,
              leave: isHost
            }}
          />
          
        </div>
      </LiveKitRoom>
    );
  }
  
  function MyVideoConference({isHost}:{isHost:boolean}) {
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true,publication:(pub:any)=>{
          return isHost || pub.participant.identity==="host"
        }},
        { source: Track.Source.ScreenShare, withPlaceholder: false,publication:(pub:any)=>{
          return isHost || pub.participant.identity==="host"
        }},
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
