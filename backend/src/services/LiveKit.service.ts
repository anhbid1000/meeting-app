import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_SECRET_KEY; // matching your .env

const assertLiveKitEnv = () => {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit URL/API key/secret is missing');
  }
};

export const createLiveKitToken = (roomName: string, participantName: string, participantIdentity: string) => {
  assertLiveKitEnv();

  const at = new AccessToken(LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!, {
    identity: participantIdentity,
    name: participantName,
    ttl: '2h',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
};

export const getRoomParticipantCount = async (roomName: string): Promise<number> => {
  assertLiveKitEnv();

  const roomService = new RoomServiceClient(LIVEKIT_URL!, LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!);
  const participants = await roomService.listParticipants(roomName);
  return participants.length;
};
