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
import { useEffect, useState } from 'react';
import axios from 'axios';
const serverUrl = process.env.LIVEKIT_URL;
  
  
  export  function VideoComponent({token, isHost, sessionId}: {token: string, isHost: boolean, sessionId: string}) {
    const [isRecording,setIsRecording] = useState(false);
    const [egressId,setEgressId] = useState<string | null>(null);

    const startRecording = async()=>{
      try{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sessions/session/${sessionId}/start-recording`,{},{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        setEgressId(response.data.egressId);
        setIsRecording(true);
      }catch(error){
        console.error('Failed to start recording:', error);
      }
    }

    const stopRecording = async()=>{
      if(!egressId) return;
      try{
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sessions/session/${sessionId}/stop-recording`,{egressId},{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        setIsRecording(false);
        setEgressId(null);
      }catch(error){
        console.error('Failed to stop recording:', error);
      }
    }

    return (
      <LiveKitRoom
        video={isHost}
        audio={isHost}
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
          {isHost && (
            <div className="flex justify-center pb-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
          )}
        </div>
      </LiveKitRoom>
    );
  }
  
  function MyVideoConference({isHost}: {isHost: boolean}) {
    
      const tracks = useTracks(
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
      { onlySubscribed: true},
    );
    return (
      <GridLayout 
        tracks={tracks} 
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
