"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
};

type Props = {
  currentUser: User | null;
  selectedUser: User | null;
  darkMode: boolean;
  isArabic: boolean;
};

type IncomingCall = {
  id: number;
  callerId: number;
  receiverId: number;
  callType: "audio" | "video";
  status: string;
  callerUsername: string;
};

type CallData = {
  id: number;
  caller_id: number;
  receiver_id: number;
  call_type: "audio" | "video";
  status: string;
  offer: string | null;
  answer: string | null;
};

type Signal = {
  id: number;
  type: "offer" | "answer" | "candidate";
  payload: string | RTCIceCandidateInit | RTCSessionDescriptionInit;
  senderId: number;
};

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function getMediaErrorMessage(error: unknown, isArabic: boolean): string {
  const name =
    error instanceof DOMException
      ? error.name
      : error instanceof Error
        ? error.name
        : "";

  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError"
  ) {
    return isArabic
      ? "لم يتم العثور على كاميرا أو ميكروفون. وصّلي الكاميرا وتأكدي أن الجهاز يعمل، ثم حاولي مرة أخرى."
      : "No camera or microphone was found. Connect your device and try again.";
  }

  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    name === "SecurityError"
  ) {
    return isArabic
      ? "تم رفض إذن الكاميرا أو الميكروفون. اسمحي للمتصفح باستخدامهما من إعدادات الموقع، ثم أعيدي المحاولة."
      : "Camera or microphone permission was denied. Allow access in your browser's site settings and try again.";
  }

  if (
    name === "NotReadableError" ||
    name === "TrackStartError"
  ) {
    return isArabic
      ? "الكاميرا مستخدمة بواسطة برنامج آخر. أغلقي البرامج التي تستخدمها ثم حاولي مرة أخرى."
      : "The camera is being used by another application. Close that application and try again.";
  }

  if (name === "OverconstrainedError") {
    return isArabic
      ? "تعذر تشغيل الكاميرا بالإعدادات المطلوبة. جرّبي إغلاق المكالمة وإعادة الاتصال."
      : "The camera does not support the requested settings. Try starting the call again.";
  }

  if (name === "AbortError") {
    return isArabic
      ? "تم إيقاف تشغيل الكاميرا قبل بدء المكالمة. حاولي مرة أخرى."
      : "Camera startup was interrupted. Please try again.";
  }

  return error instanceof Error
    ? error.message
    : isArabic
      ? "تعذر تشغيل الكاميرا أو الميكروفون."
      : "Could not start the camera or microphone.";
}

export default function PrivateCallControls({
  currentUser,
  selectedUser,
  darkMode,
  isArabic,
}: Props) {
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [callId, setCallId] = useState<number | null>(null);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [callStatus, setCallStatus] = useState("");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activePeerName, setActivePeerName] = useState("");
  const [cameraFacing, setCameraFacing] = useState<
    "user" | "environment"
  >("user");
  const [error, setError] = useState("");

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const callIdRef = useRef<number | null>(null);
  const callPeerIdRef = useRef<number | null>(null);
  const endingCallRef = useRef(false);
  const lastSignalIdRef = useRef(0);
  const remoteReadyRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingLocalCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const answerProcessedRef = useRef(false);
  const incomingIdRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const pollBusyRef = useRef(false);

  const request = useCallback(
    async (url: string, init?: RequestInit) => {
      const response = await fetch(url, {
        ...init,
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    },
    []
  );

  const post = useCallback(
    (body: Record<string, unknown>) =>
      request("/api/private-chat/calls", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    [request]
  );

  // الحصول على الصوت والفيديو بشكل منفصل.
  // هذا يسمح بعرض خطأ واضح إذا كانت المشكلة في الكاميرا فقط.
  const getCallMedia = useCallback(
    async (
      type: "audio" | "video",
      facing: "user" | "environment"
    ): Promise<MediaStream> => {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          isArabic
            ? "المتصفح لا يدعم الوصول للكاميرا. افتحي الموقع عبر HTTPS أو localhost واستخدمي متصفحًا حديثًا."
            : "Camera access is unavailable. Use a modern browser and open the site over HTTPS or localhost."
        );
      }

      let audioStream: MediaStream | null = null;
      let videoStream: MediaStream | null = null;

      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (type === "video") {
          let cameras: MediaDeviceInfo[] = [];

          try {
            const devices =
              await navigator.mediaDevices.enumerateDevices();

            cameras = devices.filter(
              (device) => device.kind === "videoinput"
            );
          } catch {
            // سنحاول تشغيل الكاميرا بالإعدادات العامة أدناه.
          }

          let lastVideoError: unknown = null;

          // جرّبي كاميرا متاحة أولًا، دون افتراض وجود كاميرا أمامية
          // وخلفية في كل الأجهزة.
          for (const camera of cameras) {
            try {
              videoStream =
                await navigator.mediaDevices.getUserMedia({
                  audio: false,
                  video: {
                    deviceId: { ideal: camera.deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  },
                });

              if (videoStream.getVideoTracks().length > 0) {
                break;
              }

              videoStream.getTracks().forEach((track) => track.stop());
              videoStream = null;
            } catch (e) {
              lastVideoError = e;
            }
          }

          // احتياط للأجهزة التي لا تعرض قائمة الكاميرات بصورة صحيحة.
          if (!videoStream) {
            try {
              videoStream =
                await navigator.mediaDevices.getUserMedia({
                  audio: false,
                  video: {
                    facingMode: { ideal: facing },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  },
                });
            } catch (e) {
              lastVideoError = e;
            }
          }

          // محاولة أخيرة بإعدادات عامة لا تتطلب كاميرا أمامية
          // أو خلفية محددة.
          if (!videoStream) {
            try {
              videoStream =
                await navigator.mediaDevices.getUserMedia({
                  audio: false,
                  video: true,
                });
            } catch (e) {
              lastVideoError = e;
            }
          }

          if (
            !videoStream ||
            videoStream.getVideoTracks().length === 0
          ) {
            throw lastVideoError || new DOMException(
              "No camera found",
              "NotFoundError"
            );
          }
        }

        const tracks = [
          ...(audioStream?.getAudioTracks() || []),
          ...(videoStream?.getVideoTracks() || []),
        ];

        const combinedStream = new MediaStream(tracks);

        localStreamRef.current = combinedStream;

        return combinedStream;
      } catch (e) {
        audioStream?.getTracks().forEach((track) => track.stop());
        videoStream?.getTracks().forEach((track) => track.stop());

        throw new Error(getMediaErrorMessage(e, isArabic));
      }
    },
    [isArabic]
  );

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());

    localStreamRef.current = null;
    remoteStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    callIdRef.current = null;
    lastSignalIdRef.current = 0;
    remoteReadyRef.current = false;
    pendingCandidatesRef.current = [];
    pendingLocalCandidatesRef.current = [];
    answerProcessedRef.current = false;
    incomingIdRef.current = null;
    busyRef.current = false;

    setCallId(null);
    setCallStatus("");
    setIncoming(null);
    setMuted(false);
    setCameraOff(false);
    setSpeakerMuted(false);
    setConnectedAt(null);
    setElapsedSeconds(0);
    setActivePeerName("");
    setCameraFacing("user");
  }, []);

  const sendCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      const id = callIdRef.current;

      if (!id) {
        pendingLocalCandidatesRef.current.push(candidate);
        return;
      }

      try {
        const data = await request(
          `/api/private-chat/calls?callId=${id}&afterId=0`
        );

        if (data.call?.status !== "accepted") {
          pendingLocalCandidatesRef.current.push(candidate);
          return;
        }

        await post({
          action: "signal",
          callId: id,
          signalType: "candidate",
          payload: candidate,
        });
      } catch {
        pendingLocalCandidatesRef.current.push(candidate);
      }
    },
    [post, request]
  );

  const flushCandidates = useCallback(async () => {
    const id = callIdRef.current;

    if (!id) return;

    const queue = [...pendingLocalCandidatesRef.current];
    pendingLocalCandidatesRef.current = [];

    for (const candidate of queue) {
      try {
        await post({
          action: "signal",
          callId: id,
          signalType: "candidate",
          payload: candidate,
        });
      } catch {
        pendingLocalCandidatesRef.current.push(candidate);
      }
    }
  }, [post]);

  const preparePeer = useCallback(
    async (
      type: "audio" | "video",
      facing: "user" | "environment"
    ) => {
      const stream = await getCallMedia(type, facing);

      const peer = new RTCPeerConnection(RTC_CONFIG);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        let remote = remoteStreamRef.current;

        if (!remote) {
          remote = new MediaStream();
          remoteStreamRef.current = remote;
        }

        const incomingTrack = event.track;

        if (
          !remote
            .getTracks()
            .some((track) => track.id === incomingTrack.id)
        ) {
          remote.addTrack(incomingTrack);
        }

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remote;
          remoteVideoRef.current.muted = speakerMuted;

          void remoteVideoRef.current.play().catch(() => {
            setError(
              isArabic
                ? "تعذر تشغيل الصوت أو الفيديو تلقائيًا. اضغطي على شاشة الفيديو."
                : "Media playback was blocked. Tap the video to start playback."
            );
          });
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          void sendCandidate(event.candidate.toJSON());
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") {
          setCallStatus(isArabic ? "متصل" : "Connected");
          setConnectedAt((previous) => previous ?? Date.now());
          setError("");
        } else if (peer.connectionState === "failed") {
          setCallStatus(
            isArabic ? "فشل الاتصال" : "Connection failed"
          );
          setError(
            isArabic
              ? "تعذر الاتصال بين الجهازين. قد تحتاج الشبكة إلى خادم TURN."
              : "The devices could not establish a connection. This network may require a TURN server."
          );
        } else if (peer.connectionState === "disconnected") {
          setCallStatus(
            isArabic ? "الاتصال غير مستقر" : "Connection interrupted"
          );
        }
      };

      return peer;
    },
    [getCallMedia, isArabic, sendCandidate, speakerMuted]
  );

 
const sendCallChatMessage = useCallback(
  async (receiverId: number, message: string) => {
    const formData = new FormData();
    formData.append("receiverId", String(receiverId));
    formData.append("message", message);

    const response = await fetch("/api/private-chat/messages", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const details =
        `Message API failed (${response.status}): ` +
        (data.message || response.statusText);

      console.error(details);
      throw new Error(details);
    }

    return data;
  },
  []
);


  const startCall = useCallback(
    async (type: "audio" | "video") => {
      if (!currentUser || !selectedUser || busyRef.current) return;
      if (callIdRef.current) return;

      busyRef.current = true;
      setError("");

      try {
        setCallType(type);
        setActivePeerName(selectedUser.username);
        setConnectedAt(null);
        setElapsedSeconds(0);
        setCallStatus(
          isArabic ? "جارٍ تشغيل الكاميرا..." : "Starting camera..."
        );

        const peer = await preparePeer(type, cameraFacing);

        // إظهار صورة الكاميرا المحلية فورًا.
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          await localVideoRef.current.play().catch(() => {});
        }

        setCallStatus(isArabic ? "جارٍ الاتصال..." : "Calling...");

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        const result = await post({
          action: "start",
          receiverId: selectedUser.id,
          callType: type,
          offer: peer.localDescription,
        });

        callIdRef.current = result.callId;
        setCallId(result.callId);
        callPeerIdRef.current = selectedUser.id;

void sendCallChatMessage(
  selectedUser.id,
  type === "video"
    ? "📹 Started a video call"
    : "📞 Started an audio call"
);

        await flushCandidates();
      } catch (e) {
        cleanup();
        setError(
          e instanceof Error
            ? e.message
            : isArabic
              ? "تعذر بدء المكالمة."
              : "Could not start the call."
        );
      } finally {
        busyRef.current = false;
      }
    },
    [
      cameraFacing,
      cleanup,
      currentUser,
      flushCandidates,
      isArabic,
      post,
      preparePeer,
      selectedUser,
    ]
  );

  const acceptCall = useCallback(async () => {
    if (!incoming || busyRef.current) return;

    busyRef.current = true;
    setError("");

    try {
      const nextCall = incoming;

      const result = await request(
        `/api/private-chat/calls?callId=${nextCall.id}&afterId=0`
      );

      const call = result.call as CallData;

      if (!call.offer) {
        throw new Error(
          isArabic ? "بيانات المكالمة غير مكتملة." : "Call offer is missing."
        );
      }

      setCallType(call.call_type);
      setActivePeerName(nextCall.callerUsername);
      setConnectedAt(null);
      setElapsedSeconds(0);
      setCallStatus(
        isArabic ? "جارٍ تشغيل الكاميرا..." : "Starting camera..."
      );

      const peer = await preparePeer(
        call.call_type,
        cameraFacing
      );

      callIdRef.current = nextCall.id;
      setCallId(nextCall.id);
      callPeerIdRef.current = nextCall.callerId;

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        await localVideoRef.current.play().catch(() => {});
      }

      await peer.setRemoteDescription(
        JSON.parse(call.offer) as RTCSessionDescriptionInit
      );

      remoteReadyRef.current = true;

      for (const candidate of pendingCandidatesRef.current) {
        await peer.addIceCandidate(candidate).catch(() => {});
      }

      pendingCandidatesRef.current = [];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      await post({
        action: "accept",
        callId: nextCall.id,
        answer: peer.localDescription,
      });

      setIncoming(null);
      incomingIdRef.current = null;
      setCallStatus(
        isArabic ? "جارٍ توصيل المكالمة..." : "Connecting..."
      );

      await flushCandidates();
    } catch (e) {
      cleanup();
      setError(
        e instanceof Error
          ? e.message
          : isArabic
            ? "تعذر قبول المكالمة."
            : "Could not accept the call."
      );
    } finally {
      busyRef.current = false;
    }
  }, [
    cameraFacing,
    cleanup,
    flushCandidates,
    incoming,
    isArabic,
    post,
    preparePeer,
    request,
  ]);

  const rejectCall = useCallback(async () => {
    if (!incoming) return;

    const id = incoming.id;

    try {
      await post({ action: "reject", callId: id });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : isArabic
            ? "تعذر رفض المكالمة."
            : "Could not reject the call."
      );
    } finally {
      setIncoming(null);
      incomingIdRef.current = null;
    }
  }, [incoming, isArabic, post]);

 

const endCall = useCallback(async () => {
  if (endingCallRef.current) return;

  const id = callIdRef.current;
  const receiverId = callPeerIdRef.current;

  if (!id) {
    cleanup();
    return;
  }

  endingCallRef.current = true;

  try {
    // إرسال رسالة انتهاء المكالمة أولًا
    if (receiverId) {
      await sendCallChatMessage(
        receiverId,
        isArabic
          ? "📵 انتهت المكالمة"
          : "📵 Call ended"
      );
    }

    // إنهاء الاتصال بصورة مستقلة
    try {
      await post({
        action: "end",
        callId: id,
      });
    } catch (error) {
      console.error(
        "Failed to end call:",
        error
      );
    }
  } finally {
    cleanup();
    endingCallRef.current = false;
  }
}, [
  cleanup,
  post,
  sendCallChatMessage,
  isArabic,
]);



  useEffect(() => {
    if (!currentUser) return;

    let stopped = false;

    const poll = async () => {
      if (stopped || pollBusyRef.current) return;

      pollBusyRef.current = true;

      try {
        const data = await request("/api/private-chat/calls");

        if (stopped) return;

        if (!callIdRef.current && !busyRef.current && data.incoming?.length) {
          const next = data.incoming[0] as IncomingCall;

          if (incomingIdRef.current !== next.id) {
            incomingIdRef.current = next.id;
            setIncoming(next);
          }
        }

        const id = callIdRef.current;

        if (!id) return;

        const active = data.active?.find(
          (item: { id: number }) => item.id === id
        );

        if (!active) {
          cleanup();
          return;
        }

        const details = await request(
          `/api/private-chat/calls?callId=${id}&afterId=${lastSignalIdRef.current}`
        );

        if (stopped) return;

        const call = details.call as CallData;

        if (
          ["ended", "rejected", "missed"].includes(call.status)
        ) {
          cleanup();
          return;
        }

        const signals = (details.signals || []) as Signal[];

        for (const signal of signals) {
          lastSignalIdRef.current = Math.max(
            lastSignalIdRef.current,
            signal.id
          );

          const payload =
            typeof signal.payload === "string"
              ? JSON.parse(signal.payload)
              : signal.payload;

          if (
            signal.type === "answer" &&
            call.caller_id === currentUser.id &&
            !answerProcessedRef.current &&
            peerRef.current
          ) {
            await peerRef.current.setRemoteDescription(
              payload as RTCSessionDescriptionInit
            );

            answerProcessedRef.current = true;
            remoteReadyRef.current = true;

            for (const candidate of pendingCandidatesRef.current) {
              await peerRef.current
                .addIceCandidate(candidate)
                .catch(() => {});
            }

            pendingCandidatesRef.current = [];
          } else if (
            signal.type === "candidate" &&
            peerRef.current
          ) {
            if (remoteReadyRef.current) {
              await peerRef.current
                .addIceCandidate(payload as RTCIceCandidateInit)
                .catch(() => {});
            } else {
              pendingCandidatesRef.current.push(
                payload as RTCIceCandidateInit
              );
            }
          }
        }

        if (call.status === "accepted") {
          await flushCandidates();

          // لا نعتبر المكالمة متصلة فعليًا إلا عند نجاح WebRTC.
          if (peerRef.current?.connectionState !== "connected") {
            setCallStatus(
              isArabic ? "جارٍ توصيل المكالمة..." : "Connecting..."
            );
          }
        }
      } catch {
        // إعادة المحاولة في الدورة التالية.
      } finally {
        pollBusyRef.current = false;
      }
    };

    void poll();

    const timer = window.setInterval(() => {
      void poll();
    }, 1200);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [cleanup, currentUser, flushCandidates, isArabic, request]);

  useEffect(() => {
    return () => {
      peerRef.current?.close();

      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      remoteStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  useEffect(() => {
    if (connectedAt === null) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - connectedAt) / 1000)
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [connectedAt]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      void localVideoRef.current.play().catch(() => {});
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = speakerMuted;

      if (remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        void remoteVideoRef.current.play().catch(() => {});
      }
    }
  }, [callId, callType, speakerMuted]);

  const toggleMute = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    const next = !muted;

    tracks.forEach((track) => {
      track.enabled = !next;
    });

    setMuted(next);
  };

  const toggleCamera = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];

    if (!tracks.length) {
      setError(
        isArabic
          ? "لا توجد كاميرا تعمل في هذه المكالمة."
          : "No active camera is available in this call."
      );
      return;
    }

    const next = !cameraOff;

    tracks.forEach((track) => {
      track.enabled = !next;
    });

    setCameraOff(next);
  };

  const switchCamera = async () => {
    if (!peerRef.current || callType !== "video") return;

    let newStream: MediaStream | null = null;

    try {
      const nextFacing =
        cameraFacing === "user" ? "environment" : "user";

      const devices =
        await navigator.mediaDevices.enumerateDevices();

      const cameras = devices.filter(
        (device) => device.kind === "videoinput"
      );

      const currentTrack =
        localStreamRef.current?.getVideoTracks()[0];

      const alternatives = cameras.filter(
        (device) => device.deviceId !== currentTrack?.getSettings().deviceId
      );

      if (alternatives.length > 0) {
        newStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: { exact: alternatives[0].deviceId },
          },
        });
      } else {
        newStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: nextFacing },
          },
        });
      }

      const newTrack = newStream.getVideoTracks()[0];

      if (!newTrack) {
        throw new Error(
          isArabic ? "لم يتم العثور على كاميرا." : "No camera found."
        );
      }

      const sender = peerRef.current
        .getSenders()
        .find((item) => item.track?.kind === "video");

      if (!sender) {
        throw new Error(
          isArabic
            ? "تعذر تبديل الكاميرا في هذه المكالمة."
            : "Could not switch the camera in this call."
        );
      }

      await sender.replaceTrack(newTrack);

      const localStream = localStreamRef.current;

      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          localStream.removeTrack(track);
          if (track !== newTrack) track.stop();
        });

        localStream.addTrack(newTrack);
      }

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
        await localVideoRef.current.play().catch(() => {});
      }

      setCameraFacing(nextFacing);
      setCameraOff(false);
      setError("");
    } catch (e) {
      newStream?.getTracks().forEach((track) => track.stop());

      setError(
        e instanceof Error
          ? e.message
          : isArabic
            ? "تعذر تبديل الكاميرا."
            : "Could not switch the camera."
      );
    }
  };

  const panel =
    "rounded-xl border p-3 " +
    (darkMode
      ? "border-slate-700 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-900");

  return (
    <>
      {selectedUser && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            title={isArabic ? "مكالمة صوتية" : "Audio call"}
            onClick={() => void startCall("audio")}
            disabled={busyRef.current || callId !== null}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            ☎
          </button>

          <button
            type="button"
            title={isArabic ? "مكالمة فيديو" : "Video call"}
            onClick={() => void startCall("video")}
            disabled={busyRef.current || callId !== null}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            ▣
          </button>
        </div>
      )}

      {incoming && !callId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className={panel + " w-full max-w-sm space-y-4 shadow-2xl"}>
            <h3 className="text-lg font-bold">
              {isArabic ? "مكالمة واردة" : "Incoming call"}
            </h3>

            <p>
              {incoming.callerUsername} ·{" "}
              {incoming.callType === "video"
                ? isArabic
                  ? "فيديو"
                  : "Video"
                : isArabic
                  ? "صوت"
                  : "Audio"}
            </p>

            {error && (
              <p role="alert" className="rounded-lg bg-red-100 p-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void acceptCall()}
                disabled={busyRef.current}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {isArabic ? "قبول" : "Accept"}
              </button>

              <button
                type="button"
                onClick={() => void rejectCall()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
              >
                {isArabic ? "رفض" : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {callId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 text-white sm:p-6">
          <div className="flex max-h-[95dvh] min-h-[480px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#15161c] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs text-slate-400">
                  {callStatus ||
                    (isArabic ? "جارٍ الاتصال..." : "Calling...")}
                </p>

                <h3 className="truncate text-lg font-bold">
                  {activePeerName ||
                    selectedUser?.username ||
                    (isArabic ? "مكالمة خاصة" : "Private call")}
                </h3>
              </div>

              <div className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 font-mono text-sm tabular-nums">
                {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
                {String(elapsedSeconds % 60).padStart(2, "0")}
              </div>
            </div>

            {callType === "video" ? (
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  onClick={(event) => {
                    void event.currentTarget.play().catch(() => {});
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs">
                  {activePeerName ||
                    (isArabic ? "الطرف الآخر" : "Other participant")}
                </div>

                <div className="absolute right-3 top-3 h-28 w-24 overflow-hidden rounded-2xl border border-white/30 bg-slate-800 shadow-lg sm:right-5 sm:top-5 sm:h-40 sm:w-32">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />

                  {cameraOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-xs">
                      {isArabic ? "الكاميرا متوقفة" : "Camera off"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative flex flex-1 flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#22232c] to-[#111217]">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="hidden"
                />

                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="hidden"
                />

                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-600 text-5xl font-bold shadow-[0_0_60px_rgba(99,102,241,0.25)]">
                  {(activePeerName ||
                    selectedUser?.username ||
                    "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <p className="text-xl font-semibold">
                  {activePeerName ||
                    selectedUser?.username ||
                    (isArabic ? "مكالمة صوتية" : "Audio call")}
                </p>

                <p className="text-sm text-slate-400">
                  {callStatus ||
                    (isArabic ? "جارٍ الاتصال..." : "Calling...")}
                </p>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mx-4 mt-3 rounded-xl bg-red-950/70 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-[#191a21] px-3 py-5 sm:gap-5 sm:px-6">
              <button
                type="button"
                onClick={toggleMute}
                title={
                  muted
                    ? isArabic
                      ? "تشغيل الميكروفون"
                      : "Unmute microphone"
                    : isArabic
                      ? "كتم الميكروفون"
                      : "Mute microphone"
                }
                aria-label="Toggle microphone"
                className={`flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 ${
                  muted
                    ? "bg-white text-slate-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {muted ? "🔇" : "🎙"}
              </button>

              <button
                type="button"
                onClick={() => setSpeakerMuted((value) => !value)}
                title={
                  speakerMuted
                    ? isArabic
                      ? "تشغيل صوت الطرف الآخر"
                      : "Turn speaker on"
                    : isArabic
                      ? "كتم صوت الطرف الآخر"
                      : "Mute speaker"
                }
                aria-label="Toggle speaker"
                className={`flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 ${
                  speakerMuted
                    ? "bg-white text-slate-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {speakerMuted ? "🔈" : "🔊"}
              </button>

              {callType === "video" && (
                <>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    title={
                      cameraOff
                        ? isArabic
                          ? "تشغيل الكاميرا"
                          : "Turn camera on"
                        : isArabic
                          ? "إيقاف الكاميرا"
                          : "Turn camera off"
                    }
                    aria-label="Toggle camera"
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 ${
                      cameraOff
                        ? "bg-white text-slate-900"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {cameraOff ? "📷" : "🎥"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void switchCamera()}
                    title={isArabic ? "تبديل الكاميرا" : "Switch camera"}
                    aria-label="Switch camera"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition hover:scale-105 hover:bg-white/20"
                  >
                    🔄
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => void endCall()}
                title={isArabic ? "إنهاء المكالمة" : "End call"}
                aria-label="End call"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl transition hover:scale-105 hover:bg-red-700"
              >
                ☎
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !callId && !incoming && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 z-[110] mx-auto max-w-lg rounded-lg bg-red-700 p-3 text-sm text-white shadow-lg"
        >
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
