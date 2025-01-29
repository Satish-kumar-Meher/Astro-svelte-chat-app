<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";

  let socket;
  let message = "";
  let messages = [];
  let username = ""; // User's chosen username
  let room = "";
  let roomJoined = false;
  let users = [];
  let toastMessage = "";
  let showToast = false;

  function joinRoom() {
  if (room.trim() !== "" && username.trim() !== "") {
    socket.emit("joinRoom", { room, username });
    roomJoined = true;
    // Clear the username after joining but not the room
  }
}
  function sendMessage() {
    if (message.trim() !== "") {
      socket.emit("sendMessage", { room, message, username });
      message = "";
    }
  }

  function showToastMessage(msg) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 3000); // Hide after 3 seconds
  }

  onMount(() => {
    socket = io("https://astro-svelte-chat-app.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Connected with ID:", socket.id));

    socket.on("receiveMessage", (data) => {
      messages = [...messages, data];
    });

    socket.on("userJoined", (data) => {
      showToastMessage(`${data.username} joined the chat`);
    });

    socket.on("userLeft", (data) => {
      showToastMessage(`${data.username} left the chat`);
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

  /* Toast Notification Styles */
  .toast {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }
  .toast.show {
    opacity: 1;
  }

  /* Styling for the labels */
  label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
  }
  .input-container {
    margin-bottom: 20px;
  }
  .input-area {
    margin-top: 10px;
  }
</style>

<div class="chat-container">
  <h2>Multi-Room Chat</h2>

  {#if !roomJoined}
    <div>
      <div class="input-container">
        <label for="username">Username:</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          placeholder="Enter your username..."
        />
      </div>
      <div class="input-container">
        <label for="room">Room Name:</label>
        <input
          id="room"
          type="text"
          bind:value={room}
          placeholder="Enter room name..."
        />
      </div>
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
      <input
        type="text"
        bind:value={message}
        placeholder="Type a message..."
      />
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

  <!-- Toast Notification -->
  {#if showToast}
    <div class="toast show">{toastMessage}</div>
  {/if}
</div>
