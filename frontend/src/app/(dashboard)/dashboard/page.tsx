"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";

type MeetingItem = {
  _id: string;
  title: string;
  startedAt: string;
  status: "live" | "working" | "ended";
  workspaceId?: { _id: string; name: string };
  channelId?: { _id: string; name: string; slug: string };
};

type FileItem = {
  _id: string;
  originalName: string;
  mimeType: string;
  uploadedBy?: { name: string };
  createdAt: string;
  channelId?: { _id: string; name: string; slug: string };
  workspaceName?: string;
};

type WorkspaceItem = {
  _id: string;
  name: string;
};

type ChannelItem = {
  _id: string;
  name: string;
  slug: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "bạn";

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [channelsByWorkspaceId, setChannelsByWorkspaceId] = useState<Record<string, ChannelItem[]>>({});
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  const channels = useMemo(() => channelsByWorkspaceId[workspaceId] || [], [channelsByWorkspaceId, workspaceId]);

  const getRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [wsRes, meetingsRes] = await Promise.all([
          api.get("/workspaces/me?page=1&limit=100"),
          api.get("/meetings/my/today"),
        ]);
        const wsItems: WorkspaceItem[] = wsRes.data?.data || [];
        const meetingsToday: MeetingItem[] = meetingsRes.data?.data || [];
        setWorkspaces(wsItems);
        setMeetings(meetingsToday);

        if (!wsItems.length) {
          setWorkspaceId("");
          setChannelId("");
          setRecentFiles([]);
          setMeetings([]);
          return;
        }

        const contextResults = await Promise.all(
          wsItems.map(async (ws) => {
            const [filesRes, workspaceRes] = await Promise.all([
              api.get(`/workspaces/${ws._id}/files`),
              api.get(`/workspaces/${ws._id}`),
            ]);

            const files: FileItem[] = (filesRes.data?.data?.files || []).map((f: FileItem) => ({
              ...f,
              workspaceName: ws.name,
            }));
            const channels: ChannelItem[] = workspaceRes.data?.data?.channels || [];
            return { workspaceId: ws._id, files, channels };
          })
        );

        const chMap: Record<string, ChannelItem[]> = {};
        const allFiles: FileItem[] = [];
        contextResults.forEach((r) => {
          chMap[r.workspaceId] = r.channels;
          allFiles.push(...r.files);
        });

        setChannelsByWorkspaceId(chMap);
        setRecentFiles(
          allFiles
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8)
        );

        const firstWorkspaceId = wsItems?.[0]?._id || "";
        if (!firstWorkspaceId) {
          setWorkspaceId("");
          setChannelId("");
          return;
        }

        setWorkspaceId(firstWorkspaceId);
        setChannelId(chMap[firstWorkspaceId]?.[0]?._id || "");
      } catch (err) {
        console.error("Không tải được dữ liệu dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const todayStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const getFileIcon = (mime: string) => {
    if (mime.includes("image")) return "image";
    if (mime.includes("video")) return "movie";
    if (mime.includes("audio")) return "audio_file";
    if (mime.includes("pdf")) return "picture_as_pdf";
    if (mime.includes("zip") || mime.includes("rar")) return "archive";
    return "description";
  };

  const handleWorkspaceChange = (nextWorkspaceId: string) => {
    setWorkspaceId(nextWorkspaceId);
    setChannelId((channelsByWorkspaceId[nextWorkspaceId] || [])[0]?._id || "");
  };

  const handleCreateMeeting = async () => {
    if (!workspaceId || !channelId) {
      alert("Bạn cần có ít nhất một workspace và một kênh để tạo cuộc họp.");
      return;
    }

    try {
      setIsCreatingMeeting(true);
      const res = await api.post(`/workspaces/${workspaceId}/channels/${channelId}/meetings`, {
        title: `Cuộc họp nhanh - ${new Date().toLocaleString("vi-VN")}`,
      });

      const meetingId = res.data?.data?._id;
      if (!meetingId) {
        alert("Tạo cuộc họp thành công nhưng không lấy được mã cuộc họp.");
        return;
      }

      router.push(`/meetings?meetingId=${meetingId}&workspaceId=${workspaceId}&channelId=${channelId}`);
    } catch (err) {
      console.error("Không thể tạo cuộc họp:", err);
      alert("Không thể tạo cuộc họp. Vui lòng thử lại.");
    } finally {
      setIsCreatingMeeting(false);
    }
  };


  return (
    <div className="space-y-lg">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-xs font-label-md text-label-md capitalize text-on-surface-variant">{todayStr}</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Chào buổi sáng, {firstName}.</h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">Đây là tổng quan cuộc họp, tệp và hoạt động gần đây của bạn.</p>
        </div>

        <div className="flex items-center gap-md">
          <button className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high">
            <MaterialSymbol icon="notifications" />
          </button>
          {user?.avatar ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-outline-variant shadow-sm">
              <Image src={user.avatar} alt={user.name || "Người dùng"} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary font-bold">{firstName.charAt(0).toUpperCase()}</div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <div className="grid grid-cols-2 gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Workspace</label>
                <select value={workspaceId} onChange={(e) => handleWorkspaceChange(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface py-sm px-sm font-body-sm text-body-sm text-on-surface">
                  {workspaces.length === 0 ? <option value="">Không có workspace</option> : workspaces.map((ws) => <option key={ws._id} value={ws._id}>{ws.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Channel</label>
                <select value={channelId} onChange={(e) => setChannelId(e.target.value)} disabled={!workspaceId || channels.length === 0} className="w-full rounded-lg border border-outline-variant bg-surface py-sm px-sm font-body-sm text-body-sm text-on-surface disabled:opacity-60">
                  {channels.length === 0 ? <option value="">Không có channel</option> : channels.map((ch) => <option key={ch._id} value={ch._id}>#{ch.slug || ch.name}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant">Chọn đúng Workspace/Channel trước khi tạo cuộc họp.</p>
          </div>

          <button onClick={handleCreateMeeting} disabled={isCreatingMeeting || isLoading || !workspaceId || !channelId} className="group relative flex h-32 cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-primary p-lg text-left shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
            <div className="z-10 flex items-start justify-between">
              <MaterialSymbol icon="video_call" className="!text-3xl text-on-primary" />
              <MaterialSymbol icon="arrow_forward" className="text-on-primary opacity-50 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="z-10">
              <h3 className="font-headline-sm text-headline-sm text-on-primary">{isCreatingMeeting ? "Đang tạo..." : "Cuộc họp mới"}</h3>
              <p className="font-body-sm text-body-sm text-primary-fixed-dim">Bắt đầu ngay bằng LiveKit</p>
            </div>
          </button>

          <div className="group flex h-32 cursor-pointer flex-col justify-between rounded-xl border border-transparent bg-secondary-container p-lg shadow-sm transition-colors hover:border-primary/20 hover:bg-primary-fixed">
            <div className="flex items-start justify-between">
              <MaterialSymbol icon="event" className="!text-3xl text-primary" />
              <MaterialSymbol icon="arrow_forward" className="text-primary opacity-50 transition-opacity group-hover:opacity-100" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Lên lịch</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Lập kế hoạch trước</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright p-lg">
              <h2 className="flex items-center gap-sm font-headline-sm text-headline-sm text-on-surface"><MaterialSymbol icon="schedule" className="text-primary" />Lịch họp hôm nay</h2>
              <button className="cursor-pointer font-label-md text-label-md text-primary hover:underline">Xem lịch</button>
            </div>
            <div className="flex min-h-[220px] flex-1 flex-col gap-md p-md">
              {meetings.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center py-10 text-on-surface-variant"><MaterialSymbol icon="event_busy" className="mb-2 !text-4xl opacity-20" /><p className="font-body-sm">Hôm nay chưa có cuộc họp nào.</p><p className="mt-1 text-xs">Bấm “Cuộc họp mới” để bắt đầu ngay.</p></div> : meetings.map((meeting) => (
                <div key={meeting._id} className="group relative flex items-center gap-md overflow-hidden rounded-lg border border-outline-variant p-md shadow-sm transition-colors hover:bg-surface-bright">
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
                  <div className="w-20 border-r border-outline-variant pr-md text-center"><p className="font-label-md text-label-md text-on-surface">{new Date(meeting.startedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p><p className={`font-body-sm text-body-sm ${meeting.status === 'working' ? 'font-bold text-success animate-pulse' : 'text-on-surface-variant'}`}>{meeting.status === "working" ? "ĐANG HỌP" : meeting.status === "live" ? "SẮP DIỄN RA" : "ĐÃ KẾT THÚC"}</p></div>
                  <div className="flex-1 pl-sm">
                    <h3 className="mb-xs truncate font-headline-sm text-headline-sm text-on-surface">
                      {meeting.title}
                      {meeting.status === 'working' && (
                        <span className="ml-sm inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success ring-1 ring-inset ring-success/20">LIVE</span>
                      )}
                      {meeting.status === 'ended' && (
                        <span className="ml-sm inline-flex items-center rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-medium text-on-surface-variant ring-1 ring-inset ring-outline-variant">ĐÃ KẾT THÚC</span>
                      )}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      #{meeting.channelId?.slug || meeting.channelId?.name || "kênh"} - {meeting.workspaceId?.name || "Workspace"}
                    </p>
                  </div>
                  
                  {meeting.status !== 'ended' ? (
                    <button 
                      onClick={() => {
                        const wId = meeting.workspaceId?._id || workspaceId;
                        const cId = meeting.channelId?._id || channelId;
                        router.push(wId && cId ? `/meetings?meetingId=${meeting._id}&workspaceId=${wId}&channelId=${cId}` : `/meetings?meetingId=${meeting._id}`);
                      }} 
                      className="cursor-pointer rounded-lg bg-primary px-md py-sm font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary/90"
                    >
                      Vào ngay
                    </button>
                  ) : (
                    <div className="rounded-lg bg-surface-container px-md py-sm font-label-md text-label-md text-on-surface-variant opacity-60">
                      Hết hạn
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-6 md:col-span-4">
          <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
            <div className="absolute -right-8 -top-8 text-primary opacity-5"><MaterialSymbol icon="auto_awesome" className="!text-[120px]" /></div>
            <div className="relative z-10 mb-md flex items-center gap-sm"><MaterialSymbol icon="auto_awesome" className="text-primary" /><h2 className="font-headline-sm text-headline-sm text-on-surface">Tóm tắt gần đây</h2></div>
            <p className="relative z-10 mb-md font-body-sm text-body-sm text-on-surface-variant">AI sẽ tổng hợp nội dung quan trọng từ các buổi họp và phiên cộng tác của bạn.</p>
            <button className="cursor-pointer relative z-10 flex items-center gap-xs font-label-md text-label-md text-primary hover:underline">Xem tóm tắt <MaterialSymbol icon="arrow_forward" className="!text-[16px]" /></button>
          </div>

          <div className="flex flex-1 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="rounded-t-xl border-b border-outline-variant bg-surface-bright p-md"><h2 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Tệp gần đây</h2></div>
            <div className="flex min-h-[160px] flex-col gap-xs p-sm">
              {recentFiles.length === 0 ? <div className="flex flex-1 items-center justify-center py-10 text-xs italic text-on-surface-variant">Không có tệp gần đây</div> : recentFiles.map((file) => (
                <div key={file._id} className="group flex cursor-pointer items-center gap-md rounded-lg p-sm transition-colors hover:bg-surface-bright">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary-container text-on-secondary-container transition-colors group-hover:bg-primary group-hover:text-on-primary"><MaterialSymbol icon={getFileIcon(file.mimeType)} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-label-md text-label-md text-on-surface" title={file.originalName}>{file.originalName}</p>
                    <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{file.uploadedBy?.name || "Không rõ"} đã upload {file.originalName} vào {getRelativeTime(file.createdAt)} · #{file.channelId?.slug || file.channelId?.name || "kênh"} - {file.workspaceName || "Workspace"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
