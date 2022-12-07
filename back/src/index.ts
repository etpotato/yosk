import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import util from 'util';

const PORT = 3012;

const io = new Server({
  cors: {
    origin: 'http://localhost:5173',
  },
});

console.log(`server is listening on port ${PORT} \n`);

io.on('connection', (socket) => {
  console.log(util.inspect(socket.client.request.headers, { depth: 5 }));

  socket.on('roomid-req', () => {
    const roomid = uuidv4();
    console.log('roomid:', roomid);
    socket.emit('roomid', roomid);
  });

  socket.on('room-join-req', (id) => {
    console.log('user', socket.id, 'requested to join the room', id, '\n');
    socket.join(id);
  });
});

/**
 * connect from the root route
 * add button to request roomid
 * get room id and redirect to this room
 * add client route /room/:id
 * use param (:id) to request to join the room
 * add client to socket room
 * setup peer connection
 */

io.listen(PORT);
