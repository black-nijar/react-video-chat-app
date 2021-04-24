import React, { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();

const socket = io("http://localhost:5000");

const ContextProvider = ({ children }) => {
  const [state, setState] = useState({
    stream: null,
    me: "",
    call: {},
    callAccepted: false,
    callEnded: false,
  });

  const { stream, call, callAccepted, callEnded, me } = state;
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((res) => {
        setState({ stream: res });

        myVideo.current.srcObject = res;
      });

    socket.emit("me", (id) => {
      setState({ me: id });
    });

    socket.emit("answercall", ({ from, name: callerName, signal }) => {
      setState({
        call: { isReceivedCall: true, name: callerName, signal },
      });
    });
  }, []);

  const answerCall = () => {
    setState({ callAccepted: true });
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answercall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = () => {};

  const leaveCall = () => {};
};
