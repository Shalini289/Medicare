"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getDoctors } from "@/services/doctorService";
import "@/styles/video-call.css";

const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (apiUrl) return apiUrl;

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return null;
};

const getUserName = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "Patient";
    return JSON.parse(atob(token.split(".")[1])).name || "Patient";
  } catch {
    return "Patient";
  }
};

export default function VideoCallPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [status, setStatus] = useState("Choose a doctor and start the call.");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const targetPeerRef = useRef(null);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    targetPeerRef.current = null;
    remoteStreamRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const cleanupCall = useCallback(() => {
    socketRef.current?.emit("leaveVideoRoom");
    socketRef.current?.disconnect();
    socketRef.current = null;

    closePeer();

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setJoined(false);
    setConnecting(false);
    setMicOn(true);
    setCameraOn(true);
    setStatus("Call ended.");
  }, [closePeer]);

  const createPeer = useCallback((target) => {
    closePeer();

    const peer = new RTCPeerConnection(peerConfig);
    peerRef.current = peer;
    targetPeerRef.current = target;

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }

      setStatus("Connected with the other participant.");
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current || !targetPeerRef.current) return;

      socketRef.current.emit("iceCandidate", {
        target: targetPeerRef.current,
        candidate: event.candidate,
      });
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setStatus("Video call connected.");
      }

      if (["failed", "disconnected", "closed"].includes(peer.connectionState)) {
        setStatus("The other participant disconnected.");
      }
    };

    return peer;
  }, [closePeer]);

  useEffect(() => {
    queueMicrotask(() => {
      getDoctors()
        .then((items) => {
          const list = Array.isArray(items) ? items : [];
          const doctorFromUrl = new URLSearchParams(window.location.search).get("doctor");
          const initialDoctor = list.some((doctor) => doctor._id === doctorFromUrl)
            ? doctorFromUrl
            : list[0]?._id || "";

          setDoctors(list);
          setSelectedDoctorId(initialDoctor);
        })
        .catch(() => {
          setDoctors([]);
          setError("Doctors could not be loaded right now.");
        });
    });
  }, []);

  useEffect(() => cleanupCall, [cleanupCall]);

  const setupSocket = useCallback(() => {
    const socketUrl = getSocketUrl();

    if (!socketUrl) {
      throw new Error("Backend API URL is not configured. Set NEXT_PUBLIC_API_URL in Vercel.");
    }

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("Waiting for the other participant to join...");
      socket.emit("joinVideoRoom", {
        roomId: `doctor:${selectedDoctorId}`,
        user: {
          name: getUserName(),
          role: "patient",
        },
      });
    });

    socket.on("videoRoomUsers", async ({ users = [] }) => {
      const peerId = users[0];
      if (!peerId) return;

      targetPeerRef.current = peerId;
      const peer = createPeer(peerId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("videoOffer", {
        target: peerId,
        description: offer,
      });
    });

    socket.on("videoOffer", async ({ from, description }) => {
      targetPeerRef.current = from;
      const peer = createPeer(from);

      await peer.setRemoteDescription(new RTCSessionDescription(description));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("videoAnswer", {
        target: from,
        description: answer,
      });
    });

    socket.on("videoAnswer", async ({ from, description }) => {
      targetPeerRef.current = from;

      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(description));
    });

    socket.on("iceCandidate", async ({ from, candidate }) => {
      targetPeerRef.current = from;

      if (!peerRef.current || !candidate) return;
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("videoUserJoined", () => {
      setStatus("Participant joined. Connecting video...");
    });

    socket.on("videoUserLeft", () => {
      closePeer();
      setStatus("The other participant left the call.");
    });

    socket.on("connect_error", () => {
      setError("Could not connect to the video server.");
    });
  }, [closePeer, createPeer, selectedDoctorId]);

  const startCall = async () => {
    if (!selectedDoctorId) {
      setError("Select a doctor before starting a video call.");
      return;
    }

    try {
      setConnecting(true);
      setError("");
      setStatus("Requesting camera and microphone access...");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Video calls are not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setJoined(true);
      setMicOn(true);
      setCameraOn(true);
      setupSocket();
    } catch (err) {
      setError(err.message || "Could not start the video call.");
      cleanupCall();
    } finally {
      setConnecting(false);
    }
  };

  const toggleMic = () => {
    const audioTracks = localStreamRef.current?.getAudioTracks() || [];
    const nextValue = !micOn;

    audioTracks.forEach((track) => {
      track.enabled = nextValue;
    });

    setMicOn(nextValue);
  };

  const toggleCamera = () => {
    const videoTracks = localStreamRef.current?.getVideoTracks() || [];
    const nextValue = !cameraOn;

    videoTracks.forEach((track) => {
      track.enabled = nextValue;
    });

    setCameraOn(nextValue);
  };

  const copyInviteLink = async () => {
    if (!selectedDoctorId || typeof window === "undefined") return;

    const url = `${window.location.origin}/video-call?doctor=${selectedDoctorId}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("Video call link copied.");
    } catch {
      setError("Could not copy the call link.");
    }
  };

  return (
    <div className="video-call-page">
      <section className="video-call-header">
        <div>
          <h1>Video Call</h1>
          <p>{selectedDoctor ? `Connect with ${selectedDoctor.name}` : "Select a doctor to start a secure call"}</p>
        </div>

        <select
          value={selectedDoctorId}
          onChange={(event) => setSelectedDoctorId(event.target.value)}
          disabled={joined}
          aria-label="Select doctor for video call"
        >
          <option value="">Choose doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
      </section>

      {error && <div className="video-call-alert">{error}</div>}

      <section className="video-grid">
        <div className="video-tile">
          <video ref={remoteVideoRef} autoPlay playsInline />
          {!remoteStreamRef.current && (
            <div className="video-placeholder">
              <strong>{selectedDoctor?.name || "Doctor"}</strong>
              <span>{joined ? "Waiting to join..." : "Remote video"}</span>
            </div>
          )}
        </div>

        <div className="video-tile local">
          <video ref={localVideoRef} autoPlay muted playsInline />
          {!localStreamRef.current && (
            <div className="video-placeholder">
              <strong>You</strong>
              <span>Camera preview</span>
            </div>
          )}
        </div>
      </section>

      <section className="call-controls">
        <p>{status}</p>

        <div>
          <button onClick={copyInviteLink} disabled={!selectedDoctorId}>
            Copy Call Link
          </button>

          {!joined ? (
            <button className="call-start" onClick={startCall} disabled={connecting || !selectedDoctorId}>
              {connecting ? "Starting..." : "Start Video Call"}
            </button>
          ) : (
            <>
              <button onClick={toggleMic}>{micOn ? "Mute" : "Unmute"}</button>
              <button onClick={toggleCamera}>{cameraOn ? "Camera Off" : "Camera On"}</button>
              <button className="call-end" onClick={cleanupCall}>End Call</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
