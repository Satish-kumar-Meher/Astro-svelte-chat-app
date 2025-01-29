<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";

  let socket;
  let message = "";
  let messages = [];
  let username = "User" + Math.floor(Math.random() * 100);
  let room = "";
  let roomJoined = false;
  let users = [];

  function joinRoom() {
    if (room.trim() !== "") {
      socket.emit("joinRoom", { room, username });
      roomJoined = true;
    }
  }

  function sendMessage() {
    if (message.trim() !== "") {
      socket.emit("sendMessage", { room, message, username });
      message = "";
    }
  }

  onMount(() => {
    socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Connected with ID:", socket.id));

    socket.on("receiveMessage", (data) => {
      messages = [...messages, data];
    });

    socket.on("roomUsers", (roomUsers) => {
      users = roomUsers;
    });

    socket.on("disconnect", () => console.log("❌ Disconnected"));
  });
</script>

<style>
  * { box-sizing: border-box; font-family: Arial, sans-serif; }
  .chat-container {
    max-width: 500px; margin: auto; padding: 20px; background: #f5f5f5;
    border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }
  h2 { text-align: center; color: #333; }
  .messages {
    height: 300px; overflow-y: auto; padding: 10px; background: white;
    border-radius: 10px; box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.1);
    display: flex; flex-direction: column; gap: 10px;
  }
  .message {
    max-width: 70%; padding: 10px 15px; border-radius: 15px; word-wrap: break-word;
  }
  .received { background: #e0e0e0; align-self: flex-start; }
  .sent { background: #4a90e2; color: white; align-self: flex-end; }
  .input-area { display: flex; margin-top: 10px; gap: 10px; }
  input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem; }
  button {
    background: #4a90e2; color: white; border: none; padding: 10px 15px;
    border-radius: 5px; cursor: pointer; transition: 0.3s;
  }
  button:hover { background: #357ae8; }
  .user-list { background: #fff; padding: 10px; border-radius: 10px; margin-top: 10px; }
  .user-list h3 { margin: 0; }
  .user-list ul { list-style: none; padding: 0; }
  .user-list li { padding: 5px; font-weight: bold; }
</style>

<div class="chat-container">
  <h2>Multi-Room Chat</h2>

  {#if !roomJoined}
    <div>
      <input type="text" bind:value={room} placeholder="Enter room name..." />
      <button on:click={joinRoom}>Join Room</button>
    </div>
  {/if}

  {#if roomJoined}
    <h3>Room: {room}</h3>

    <div class="messages">
      {#each messages as msg}
        <div class="message {msg.username === username ? 'sent' : 'received'}">
          <strong>{msg.username}:</strong> {msg.message}
        </div>
      {/each}
    </div>

    <div class="input-area">
      <input type="text" bind:value={message} placeholder="Type a message..." />
      <button on:click={sendMessage}>Send</button>
    </div>

    <div class="user-list">
      <h3>Users in Room:</h3>
      <ul>
        {#each users as user}
          <li>{user.username}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>