export const logStatus = (peerConnection: RTCPeerConnection | null) => {
  if (!peerConnection) {
    console.log("NO Peer Connection")
    return
  }

  console.log({
    connection: peerConnection.connectionState,
    iceConnection: peerConnection.iceConnectionState,
  })
}
