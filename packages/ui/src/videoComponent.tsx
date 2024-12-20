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
  
  import { Track, TrackPublication } from 'livekit-client';
import { useRef, useEffect } from 'react';

  
  const serverUrl = 'wss://myacademy-lznxzk2x.livekit.cloud';
  
  
  export  function VideoComponent({token, isHost}: {token: string, isHost: boolean}) {



    return (
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100%', width: '100%' }}
      >
        <MyVideoConference isHost={isHost} />
        <RoomAudioRenderer />
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent'>
          <ControlBar 
            className='flex justify-center items-center gap-2 p-2'
            controls={{
              microphone: isHost,
              camera: isHost,
              screenShare: isHost,
              leave: isHost
            }}
            variation="minimal"
          />
        </div>
      </LiveKitRoom>
    );
  }
  
  function MyVideoConference({isHost}: {isHost: boolean}) {
    const tracsRef = useRef<any[]>([]);

    useEffect(()=>{
       return ()=>{
        if(tracsRef.current && tracsRef.current.length > 0){
          tracsRef.current.forEach((track)=>{
            if(track && track.track){
              track.stop();
            }
          })
          tracsRef.current = [];
        }
       }

    },[])
      tracsRef.current = useTracks(
      [
        { 
          source: Track.Source.Camera, 
          withPlaceholder: false,
          publication: (pub: any) => {
            return (isHost && pub.participant.isLocal) || 
                   (!isHost && pub.participant.identity === "host")
          }
        },
        { 
          source: Track.Source.ScreenShare, 
          withPlaceholder: false,
          publication: (pub: any) => {
            return (isHost && pub.participant.isLocal) || 
                   (!isHost && pub.participant.identity === "host")
          }
        },
      ],
      { onlySubscribed: true },
    );
    return (
      <GridLayout 
        tracks={tracsRef.current} 
        style={{ 
          height: 'calc(100% - 48px)',
          width: '100%',
          padding: '0.5rem',
          gap: '0.5rem',
        }}
      >
        <ParticipantTile
          style={{
            borderRadius: '0.5rem',
            overflow: 'hidden',
            background: 'rgba(0, 0, 0, 0.2)',
            aspectRatio: '16/9',
          }} 
        />
      </GridLayout>
    );
  }
