"use client";

import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import { createLocalVideoTrack, LocalVideoTrack, LocalAudioTrack, createLocalAudioTrack, Track } from "livekit-client";

function CustomMeetingRoom({ meetingTitle, meetingId, onLeave }: { meetingTitle: string; meetingId: string; onLeave: () => void }) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  // Lấy track camera và màn hình
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { onlySubscribed: false });

  const participantCount = (room.remoteParticipants?.size || 0) + 1;

  const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleCamera = () => localParticipant.setCameraEnabled(!isCameraEnabled);
  const toggleScreenShare = () => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);

  const [activeTab, setActiveTab] = useState<"chat" | "notes">("notes");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string; ts: number }[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteMessages, setNoteMessages] = useState<{ from: string; text: string; ts: number }[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: { name?: string; identity?: string }) => {
      try {
        const raw = new TextDecoder().decode(payload);
        const msg = JSON.parse(raw);
        if (msg?.type === "chat") {
          setChatMessages((prev) => [
            ...prev,
            {
              from: participant?.name || participant?.identity || "Người lạ",
              text: String(msg.text || ""),
              ts: Date.now(),
            },
          ]);
        }

        if (msg?.type === "note") {
          setNoteMessages((prev) => [
            ...prev,
            {
              from: participant?.name || participant?.identity || "Người lạ",
              text: String(msg.text || ""),
              ts: Date.now(),
            },
          ]);
        }
      } catch { }
    };

    room.on("dataReceived", onData);
    return () => {
      room.off("dataReceived", onData);
    };
  }, [room]);

  useEffect(() => {
    const loadMeetingContext = async () => {
      try {
        const res = await api.get(`/meetings/${meetingId}`);
        const meeting = res.data?.data;
        const notes = Array.isArray(meeting?.notes) ? meeting.notes : [];
        const chats = Array.isArray(meeting?.chatLog) ? meeting.chatLog : [];

        setNoteMessages(notes.map((n: { userId?: { name?: string; email?: string } | null; content?: string; timestamp?: string | Date }) => ({
          from: n?.userId?.name || n?.userId?.email || "Người dùng",
          text: String(n?.content || ""),
          ts: n?.timestamp ? new Date(n.timestamp).getTime() : Date.now(),
        })));

        setChatMessages(chats.map((c: { userId?: { name?: string; email?: string } | null; content?: string; timestamp?: string | Date }) => ({
          from: c?.userId?.name || c?.userId?.email || "Người dùng",
          text: String(c?.content || ""),
          ts: c?.timestamp ? new Date(c.timestamp).getTime() : Date.now(),
        })));

        setAiSummary(String(meeting?.summary || ""));
      } catch (error) {
        console.error("Lỗi tải notes/chat/summary:", error);
      }
    };

    void loadMeetingContext();
  }, [meetingId]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;

    // 1. Gửi realtime qua LiveKit
    const payload = new TextEncoder().encode(JSON.stringify({ type: "chat", text }));
    try {
      room.localParticipant.publishData(payload, { reliable: true });
    } catch (e) {
      console.error("Lỗi gửi tin nhắn LiveKit:", e);
    }

    // 2. Lưu vào DB qua API backend
    try {
      await api.post(`/meetings/${meetingId}/chat-log`, {
        content: text,
        timestamp: new Date().toISOString()
      });
      setChatMessages((prev) => [
        ...prev,
        { from: "Bạn", text, ts: Date.now() },
      ]);
      setChatInput("");
    } catch (e) {
      console.error("Lỗi lưu chat log:", e);
      // Vẫn show UI dù lưu thất bại (best effort)
      setChatMessages((prev) => [
        ...prev,
        { from: "Bạn", text, ts: Date.now() },
      ]);
      setChatInput("");
    }
  };

  const sendNote = async () => {
    const text = noteInput.trim();
    if (!text) return;

    const payload = new TextEncoder().encode(JSON.stringify({ type: "note", text }));
    try {
      room.localParticipant.publishData(payload, { reliable: true });
    } catch (e) {
      console.error("Lỗi gửi note LiveKit:", e);
    }

    try {
      await api.post(`/meetings/${meetingId}/notes`, {
        content: text,
        timestamp: new Date().toISOString(),
      });
      setNoteMessages((prev) => [...prev, { from: "Bạn", text, ts: Date.now() }]);
      setNoteInput("");
    } catch (e) {
      console.error("Lỗi lưu note:", e);
      setNoteMessages((prev) => [...prev, { from: "Bạn", text, ts: Date.now() }]);
      setNoteInput("");
    }
  };

  const generateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const res = await api.post(`/meetings/${meetingId}/summary`);
      const summary = String(res.data?.data?.summary || "");
      setAiSummary(summary);
    } catch (e) {
      console.error("Lỗi tạo tóm tắt AI:", e);
      alert("Không thể tạo tóm tắt AI. Kiểm tra cấu hình LLM_API_URL / LLM_API_KEY.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const screenShareTracks = tracks.filter((t) => t.source === Track.Source.ScreenShare);
  const hasActiveScreenShare = screenShareTracks.length > 0;
  const primaryScreenShareTrack = screenShareTracks[0];
  const secondaryTracks = hasActiveScreenShare
    ? tracks.filter((t) => {
      const isPrimaryScreenShare =
        t.participant.identity === primaryScreenShareTrack.participant.identity &&
        t.source === Track.Source.ScreenShare;
      const hasRenderableTrack = Boolean((t as { publication?: unknown; track?: unknown }).publication || (t as { publication?: unknown; track?: unknown }).track);

      return !isPrimaryScreenShare && hasRenderableTrack;
    })
    : tracks;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface-container-low text-on-surface">
      <header className="z-10 flex h-[64px] shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-lg py-sm text-primary shadow-sm">
        <div className="flex min-w-0 items-center gap-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-on-primary">
            <MaterialSymbol icon="videocam" className="filled !text-[22px]" />
          </div>
          <h1 className="flex min-w-0 items-center gap-2 truncate text-headline-md font-extrabold text-primary">
            <span className="truncate">{meetingTitle}</span>
          </h1>
        </div>
        <nav className="hidden items-center gap-md md:flex">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            ID: {meetingId}
          </div>
          <button aria-label="Người tham gia" className="relative flex cursor-pointer items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high">
            <MaterialSymbol icon="group" className="!text-[24px]" />
            <span className="absolute right-0 top-0 flex h-4 w-4 translate-x-1 -translate-y-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">{participantCount}</span>
          </button>
        </nav>
      </header>

      <div className="relative flex flex-1 overflow-hidden pb-[72px] md:pb-[88px]">
        <main className="relative z-0 flex flex-1 items-start justify-start bg-[#121212] p-md transition-all duration-300 md:p-lg md:pr-[280px]">
          {/* Ô hiển thị Participant Grid */}
          <div className="flex h-full w-full items-start justify-start">
            {!hasActiveScreenShare ? (
              <div className="grid w-full max-w-6xl grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tracks.map((trackRef, index) => {
                  const isLocal = trackRef.participant.identity === localParticipant.identity;

                  return (
                    <div
                      key={`${trackRef.participant.identity}-${trackRef.source}-${index}`}
                      className={`relative aspect-video max-h-[240px] overflow-hidden rounded-2xl bg-[#1e1e1e] shadow-xl border-2 ${isLocal ? 'border-primary/50' : 'border-white/5'}`}
                    >
                      <ParticipantTile trackRef={trackRef} className="h-full w-full object-cover" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-white border border-white/10">
                          <MaterialSymbol
                            icon={trackRef.participant.isMicrophoneEnabled ? "mic" : "mic_off"}
                            className={`!text-[14px] ${trackRef.participant.isMicrophoneEnabled ? 'text-success' : 'text-error'}`}
                          />
                          <span className="text-[12px] font-medium truncate max-w-[100px]">
                            {isLocal ? "Bạn" : trackRef.participant.name || trackRef.participant.identity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full w-full gap-4">
                <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-primary/40 bg-[#1e1e1e] shadow-2xl">
                  <ParticipantTile trackRef={primaryScreenShareTrack} className="h-full w-full object-contain bg-black" />
                  <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                    Đang chia sẻ màn hình
                  </div>
                </div>

                <div className="w-[220px] shrink-0 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-2">
                  <div className="flex flex-col gap-2">
                    {secondaryTracks.map((trackRef, index) => {
                      const isLocal = trackRef.participant.identity === localParticipant.identity;
                      return (
                        <div
                          key={`${trackRef.participant.identity}-${trackRef.source}-mini-${index}`}
                          className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e]"
                        >
                          <ParticipantTile trackRef={trackRef} className="h-full w-full object-cover" />
                          <div className="absolute bottom-1 left-1 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white truncate max-w-[90%]">
                            {isLocal ? 'Bạn' : trackRef.participant.name || trackRef.participant.identity}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="fixed right-0 top-[64px] z-20 hidden h-[calc(100%-136px)] w-[280px] flex-col overflow-hidden border-l border-outline-variant bg-surface-container-low shadow-md md:flex">
          <div className="flex shrink-0 border-b border-outline-variant">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 cursor-pointer py-sm text-label-md font-label-md transition-colors hover:bg-surface-container-high ${activeTab === 'chat' ? 'text-primary border-b-2 border-primary bg-secondary-container/20' : 'text-on-surface-variant'}`}
            >
              Trò chuyện
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1 py-sm text-label-md font-label-md transition-colors hover:bg-surface-container-high ${activeTab === 'notes' ? 'text-primary border-b-2 border-primary bg-secondary-container/20' : 'text-on-surface-variant'}`}
            >
              <MaterialSymbol icon="auto_awesome" className="!text-[18px]" /> Ghi chú AI
            </button>
          </div>

          {activeTab === 'chat' ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-md">
                {chatMessages.length === 0 ? (
                  <div className="text-sm text-on-surface-variant text-center mt-10">Chưa có tin nhắn.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={`flex flex-col ${m.from === 'Bạn' ? 'items-end' : 'items-start'}`}>
                        <div className="text-[10px] text-on-surface-variant px-1 mb-1">{m.from}</div>
                        <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.from === 'Bạn' ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-highest text-on-surface rounded-tl-none'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t border-outline-variant bg-surface-container-lowest p-sm">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    className="flex-1 rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button onClick={sendChat} className="cursor-pointer flex items-center justify-center h-9 w-9 rounded-full bg-primary text-on-primary hover:bg-primary/90">
                    <MaterialSymbol icon="send" className="!text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-outline-variant p-sm">
                <h2 className="text-label-md font-bold text-on-surface">Ghi chú chung</h2>
                <button
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                  className="cursor-pointer rounded-full bg-primary-container px-3 py-1.5 text-label-sm font-label-sm text-on-primary-container disabled:opacity-60"
                >
                  {isGeneratingSummary ? 'Đang tóm tắt...' : 'Tóm tắt AI'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-md space-y-3">
                {noteMessages.length === 0 ? (
                  <div className="text-sm text-on-surface-variant text-center mt-8">Chưa có ghi chú nào.</div>
                ) : noteMessages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.from === 'Bạn' ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-on-surface-variant px-1 mb-1">{m.from}</div>
                    <div className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.from === 'Bạn' ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-highest text-on-surface rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {aiSummary && (
                  <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-sm">
                    <div className="mb-1 text-xs font-semibold text-primary">Tóm tắt AI</div>
                    <div className="text-xs text-on-surface whitespace-pre-wrap">{aiSummary}</div>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-outline-variant bg-surface-container-lowest p-sm">
                <div className="flex gap-2">
                  <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendNote()}
                    className="flex-1 rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                    placeholder="Nhập ghi chú cho cả phòng..."
                  />
                  <button onClick={sendNote} className="cursor-pointer flex items-center justify-center h-9 w-9 rounded-full bg-primary text-on-primary hover:bg-primary/90">
                    <MaterialSymbol icon="send" className="!text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <footer className="fixed bottom-0 left-0 z-50 flex h-[64px] w-full items-center justify-center gap-4 bg-[#1a1a1a]/95 backdrop-blur-md px-lg shadow-2xl md:h-[72px]">
        <button aria-label="Mic" onClick={toggleMic} className={`group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-all active:scale-90 ${isMicrophoneEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-error text-on-error'}`}>
          <MaterialSymbol icon={isMicrophoneEnabled ? "mic" : "mic_off"} className="!text-[22px]" />
        </button>
        <button aria-label="Video" onClick={toggleCamera} className={`group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-all active:scale-90 ${isCameraEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-error text-on-error'}`}>
          <MaterialSymbol icon={isCameraEnabled ? "videocam" : "videocam_off"} className="!text-[22px]" />
        </button>
        <button aria-label="Share" onClick={toggleScreenShare} className={`group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90 ${localParticipant.isScreenShareEnabled ? 'text-primary bg-primary/10' : ''}`}>
          <MaterialSymbol icon="present_to_all" className="!text-[22px]" />
        </button>
        <button aria-label="Reactions" className="group hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90 md:flex">
          <MaterialSymbol icon="mood" className="!text-[22px]" />
        </button>
        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
        <button aria-label="Leave" onClick={onLeave} className="group flex h-11 px-5 cursor-pointer items-center justify-center rounded-xl bg-error text-white font-bold text-[14px] transition-all hover:bg-error/90 active:scale-95 shadow-lg shadow-error/20">
          <MaterialSymbol icon="call_end" className="!text-[22px] md:mr-2" />
          <span className="hidden md:block">Rời phòng</span>
        </button>
      </footer>
      <RoomAudioRenderer />
    </div>
  );
}

export default function MeetingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId") || "";
  const user = useAuthStore((state) => state.user);

  const [token, setToken] = useState("");
  const [livekitUrl, setLivekitUrl] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("Đang tải...");

  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(meetingId));
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState("");

  // Lobby States
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);

  // Device lists
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);

  const stopPreviewTracks = useCallback(() => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.detach();
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current = null;
    }

    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.detach();
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current = null;
    }

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  }, []);

  const leaveMeetingAndExit = useCallback(async () => {
    if (!meetingId || isLeaving) {
      router.push("/dashboard");
      return;
    }

    try {
      setIsLeaving(true);
      await api.patch(`/meetings/${meetingId}/leave`);
    } catch (err) {
      console.error("leaveMeeting error:", err);
    } finally {
      setIsLeaving(false);
      router.push("/dashboard");
    }
  }, [meetingId, isLeaving, router]);

  const handleCancelLobby = () => {
    stopPreviewTracks();
    setVideoEnabled(false);
    setAudioEnabled(false);
    router.push("/dashboard");
  };

  // 1. Fetch Token & Info
  useEffect(() => {
    const fetchToken = async () => {
      if (!meetingId) return;
      try {
        setIsLoading(true);
        // Lấy workspaceId và channelId từ searchParams nếu có
        const workspaceId = searchParams.get("workspaceId");
        const channelId = searchParams.get("channelId");
        
        let url = `/meetings/${meetingId}/join`;
        if (workspaceId && channelId) {
          url += `?workspaceId=${workspaceId}&channelId=${channelId}`;
        }
        
        const res = await api.get(url);
        const data = res.data?.data;
        setToken(data?.token || "");
        setLivekitUrl(data?.livekitUrl || "");
        setMeetingTitle(data?.meeting?.title || "Cuộc họp");
      } catch (err) {
        const message =
          typeof (err as { response?: { data?: { message?: string } } })?.response?.data?.message === 'string'
            ? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            : undefined;
        setError(message || "Không thể tham gia cuộc họp.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, [meetingId, searchParams]);

  // 2. Camera/Mic Preview for Lobby & Device Enumeration
  useEffect(() => {
    let cancelled = false;

    const startPreview = async () => {
      if (isJoined) {
        stopPreviewTracks();
        return;
      }

      try {
        const permissionStream = await navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .catch(() => null);

        const devices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
        setAudioInputDevices(devices.filter(d => d.kind === 'audioinput'));
        setAudioOutputDevices(devices.filter(d => d.kind === 'audiooutput'));

        permissionStream?.getTracks().forEach((track) => track.stop());

        if (videoEnabled) {
          try {
            if (localVideoTrackRef.current) {
              localVideoTrackRef.current.detach();
              localVideoTrackRef.current.stop();
              localVideoTrackRef.current = null;
            }

            const videoTrack = await createLocalVideoTrack();
            if (cancelled) {
              videoTrack.stop();
              return;
            }

            localVideoTrackRef.current = videoTrack;
            if (videoPreviewRef.current) {
              videoTrack.attach(videoPreviewRef.current);
            }
          } catch (vErr) {
            console.warn("Không thể bật camera preview:", vErr);
            setVideoEnabled(false);
          }
        } else if (localVideoTrackRef.current) {
          localVideoTrackRef.current.detach();
          localVideoTrackRef.current.stop();
          localVideoTrackRef.current = null;
          if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
        }

        if (audioEnabled) {
          if (localAudioTrackRef.current) {
            localAudioTrackRef.current.detach();
            localAudioTrackRef.current.stop();
            localAudioTrackRef.current = null;
          }

          const audioTrack = await createLocalAudioTrack();
          if (cancelled) {
            audioTrack.stop();
            return;
          }

          localAudioTrackRef.current = audioTrack;
        } else if (localAudioTrackRef.current) {
          localAudioTrackRef.current.detach();
          localAudioTrackRef.current.stop();
          localAudioTrackRef.current = null;
        }
      } catch (e) {
        console.error("Lỗi preview:", e);
      }
    };

    startPreview();

    return () => {
      cancelled = true;
      stopPreviewTracks();
    };
  }, [isJoined, videoEnabled, audioEnabled, stopPreviewTracks]);

  if (!meetingId) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <MaterialSymbol icon="error" className="mb-4 !text-6xl text-error" />
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Không tìm thấy mã cuộc họp</h1>
        <p className="mt-2 text-on-surface-variant">Vui lòng kiểm tra lại liên kết hoặc tạo cuộc họp mới.</p>
        <button onClick={handleCancelLobby} className="mt-6 font-label-md text-primary hover:underline">Quay lại Dashboard</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 font-body-md text-on-surface-variant">Đang kết nối tới máy chủ cuộc họp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <MaterialSymbol icon="report" className="mb-4 !text-6xl text-error" />
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Lỗi tham gia</h1>
        <p className="mt-2 text-on-surface-variant">{error}</p>
        <button onClick={handleCancelLobby} className="mt-6 rounded-lg bg-primary px-6 py-2 font-label-md text-on-primary shadow-sm hover:bg-primary/90">
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  // --- UI GIAO DIỆN PHÒNG CHỜ (LOBBY) ---
  if (!isJoined) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-md pb-lg pt-[20px] lg:px-lg">
        <div className="mb-lg">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">Bạn đã sẵn sàng tham gia?</h1>
          <p className="mt-xs font-body-md text-body-md text-on-surface-variant">Kiểm tra âm thanh và hình ảnh của bạn trước khi vào cuộc họp.</p>
        </div>

        <div className="grid grid-cols-1 gap-gutter items-start lg:grid-cols-12">
          {/* Left: Video Preview */}
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-inverse-surface shadow-sm lg:col-span-8">
            {videoEnabled ? (
              <video ref={videoPreviewRef} autoPlay muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-highest">
                  <MaterialSymbol icon="videocam_off" className="!text-5xl text-on-surface-variant" />
                </div>
                <p className="text-surface-container-lowest opacity-60">Camera đang tắt</p>
              </div>
            )}

            {/* Bottom Left Overlay */}
            <div className="absolute bottom-md left-md flex items-center gap-sm rounded-lg border border-outline/20 bg-inverse-surface/80 px-sm py-xs backdrop-blur-sm">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${audioEnabled ? 'bg-primary' : 'bg-error-container text-on-error-container'}`}>
                <MaterialSymbol icon={audioEnabled ? "mic" : "mic_off"} className="!text-[16px]" />
              </div>
              <span className="font-label-md text-label-md text-surface-container-lowest">{user?.name} (Bạn)</span>
            </div>

            {/* Network indicator */}
            <div className="absolute right-md top-md flex items-center gap-xs rounded-lg border border-outline/20 bg-inverse-surface/80 px-sm py-xs text-surface-container-lowest backdrop-blur-sm">
              <MaterialSymbol icon="signal_cellular_alt" className="!text-[18px] text-green-400" />
              <span className="hidden font-label-sm text-label-sm sm:inline">Kết nối tốt</span>
            </div>
          </div>

          {/* Right: Controls Panel */}
          <div className="flex w-full flex-col gap-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm lg:col-span-4">
            {/* Meeting Info */}
            <div className="flex flex-col border-b border-outline-variant pb-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{meetingTitle}</h2>
              <div className="mt-xs flex items-center gap-sm text-on-surface-variant">
                <MaterialSymbol icon="schedule" className="!text-[18px]" />
                <span className="font-body-sm text-body-sm">Đang diễn ra</span>
              </div>
              <div className="mt-xs flex items-center gap-sm text-on-surface-variant">
                <MaterialSymbol icon="group" className="!text-[18px]" />
                <span className="font-body-sm text-body-sm">ID: {meetingId}</span>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="flex w-full gap-md">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`group relative flex flex-1 flex-col items-center justify-center rounded-lg border py-md transition-all active:scale-95 ${!audioEnabled ? 'border-error bg-error-container text-on-error-container hover:bg-error-container/80' : 'border-outline-variant bg-surface hover:bg-surface-container'}`}
              >
                <div className={`mb-sm flex h-12 w-12 items-center justify-center rounded-full ${!audioEnabled ? 'bg-surface-container-lowest/20' : 'bg-surface-container-high text-primary'}`}>
                  <MaterialSymbol icon={audioEnabled ? "mic" : "mic_off"} className="!text-[28px]" />
                </div>
                <span className="font-label-md text-label-md">{audioEnabled ? "Tắt Mic" : "Bật Mic"}</span>
                {!audioEnabled && <span className="absolute right-sm top-sm h-2 w-2 rounded-full bg-error"></span>}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className="flex flex-1 flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface py-md text-on-surface transition-all hover:bg-surface-container active:scale-95"
              >
                <div className={`mb-sm flex h-12 w-12 items-center justify-center rounded-full ${videoEnabled ? 'bg-surface-container-high text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  <MaterialSymbol icon={videoEnabled ? "videocam" : "videocam_off"} className="!text-[28px]" />
                </div>
                <span className="font-label-md text-label-md">{videoEnabled ? "Tắt Camera" : "Bật Camera"}</span>
              </button>
            </div>

            {/* Device Selection Settings */}
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Đầu vào âm thanh</label>
                <div className="relative">
                  <select className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface py-sm pl-md pr-xl font-body-sm text-body-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    {audioInputDevices.length > 0 ? audioInputDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 5)}`}</option>
                    )) : <option>Mặc định - Hệ thống</option>}
                  </select>
                  <MaterialSymbol icon="arrow_drop_down" className="pointer-events-none absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Nguồn Video</label>
                <div className="relative">
                  <select className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface py-sm pl-md pr-xl font-body-sm text-body-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    {videoDevices.length > 0 ? videoDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                    )) : <option>FaceTime HD Camera</option>}
                  </select>
                  <MaterialSymbol icon="arrow_drop_down" className="pointer-events-none absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Đầu ra âm thanh</label>
                <div className="relative flex items-center gap-sm">
                  <select className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface py-sm pl-md pr-xl font-body-sm text-body-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    {audioOutputDevices.length > 0 ? audioOutputDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Loa ${d.deviceId.slice(0, 5)}`}</option>
                    )) : <option>Mặc định - Loa máy tính</option>}
                  </select>
                  <MaterialSymbol icon="arrow_drop_down" className="pointer-events-none absolute right-[52px] top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <button className="flex-shrink-0 rounded-lg border border-outline-variant px-sm py-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary" title="Kiểm tra loa">
                    <MaterialSymbol icon="volume_up" className="!text-[20px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Primary Action */}
            <div className="mt-md flex flex-col gap-sm border-t border-outline-variant pt-md lg:mt-0">
              <button
                onClick={() => {
                  stopPreviewTracks();
                  setIsJoined(true);
                }}
                className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary py-md font-label-md text-label-md text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]"
              >
                Tham gia cuộc họp
              </button>
              <button
                onClick={handleCancelLobby}
                className="w-full rounded-lg bg-transparent py-sm font-label-md text-label-md text-secondary transition-colors duration-200 hover:bg-surface-container"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- UI KHI ĐÃ NHẤN THAM GIA (MEETING ROOM) ---
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden rounded-xl border border-outline-variant bg-black">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        video={videoEnabled}
        audio={audioEnabled}
        onDisconnected={() => router.push("/dashboard")}
        className="flex h-full flex-col"
      >
        <CustomMeetingRoom
          meetingTitle={meetingTitle}
          meetingId={meetingId}
          onLeave={leaveMeetingAndExit}
        />
      </LiveKitRoom>
    </div>
  );
}
