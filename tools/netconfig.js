/* =====================================================================
   MULTIPLAYER NETWORK CONFIG  —  edit here (optional)
   TURN = fallback relay for players who can't connect directly
   (strict school/company networks, some mobile carriers).
   Fill in ONE of the two options, save, upload index.html again.

   Option A (Metered / Open Relay): your "credentials API URL", e.g.
     apiUrl: 'https://YOURAPP.metered.live/api/v1/turn/credentials?apiKey=YOUR_KEY',

   Option B: static TURN servers from your provider's dashboard, e.g.
     servers: [{ urls: ['turn:HOST:80', 'turn:HOST:443?transport=tcp', 'turns:HOST:443?transport=tcp'],
                 username: 'USERNAME', credential: 'PASSWORD' }],
   ===================================================================== */
const TURN_CONFIG = {
  apiUrl: '',
  servers: [{
    urls: [
      'stun:stun.relay.metered.ca:80',
      'turn:standard.relay.metered.ca:80',
      'turn:standard.relay.metered.ca:80?transport=tcp',
      'turn:standard.relay.metered.ca:443',
      'turns:standard.relay.metered.ca:443?transport=tcp'
    ],
    username: 'e084faa1be6656e0573d15ac',
    credential: 'U/NOr2hgyY3z41Tf'
  }]
};
