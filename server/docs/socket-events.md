# Socket.io Events Documentation

The Socket.io server is configured with room-based isolation for each project.
The namespace for project rooms is `/project/:id`.

## Client -> Server Events

### `join-project`
Fired when a user joins a project board.
- **Payload:** `{ userId: string }`
- **Effect:** Subscribes the user to real-time updates for the specific project. Emits `user-joined` to other clients in the room.

### `leave-project`
Fired when a user leaves a project board.
- **Payload:** `{ userId: string }`
- **Effect:** Unsubscribes the user from real-time updates for the specific project.

*(Phase 2 Events - Coming Soon)*
### `task:move`
Fired when a task is moved to a new column or reordered.
- **Payload:** `{ taskId: string, sourceIndex: number, destinationIndex: number, destinationStatus: string, timestamp: string }`

### `task:update`
Fired when a task details are updated.
- **Payload:** `{ taskId: string, updates: Record<string, any>, timestamp: string }`

## Server -> Client Events

### `user-joined`
Broadcasted when a new user joins the project room.
- **Payload:** `{ userId: string }`

### `user-left`
Broadcasted when a user disconnects or leaves the room.
- **Payload:** `{ userId: string }`

*(Phase 2 Events - Coming Soon)*
### `task:moved`
Broadcasted when another user moves a task.

### `task:updated`
Broadcasted when another user updates a task.
