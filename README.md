Goals / Scope
-------------
The goal of this project was to evaluate node as a server-side language in the context of implementing a transport protocol.  


Overview
--------
SoupTCP is a client / server messaging protocol used in the financial industry. 

The protocol allows information to be made available from a server application via TCP connection to clients.

Information delivered over the protocol is in either ascii or binary format.

In order for a client to parse information, a parser must be used.

The implementation implements all aspects of the protocol, including:
 * login negotiation and authentication
 * session request parameters
 * connection management
 * heartbeating 
 * publishing of a sequenced stream of messages from configured session store  


Message Parsing
---------------
It is outside the scope of the SoupTCP protocol how messages delivered are to be parsed and understood.  A separate message parsing framework is typically used.  Messages to be distributed by the server are appended to a "store" in binary / ascii format.  When received by the client, the client uses the same encoding / parsing library to decode the messages.

Absent a fancy encoding, messages can simply be stored in human readable ascii and considered a notification stream.


Installation
------------

Install Node / NPM
https://nodejs.org/en/download/

Use a version later than 9.0 of node to ensure ES6/7 features are supported.

Install npm dependencies:
```npm install```

Start server:
from root directory

```node example/testServer.js```




```

By default, the server listens on port 9000 and mounts a single session called "testing".  For a client to successfully request a specific session, the server must "mount" it.  The implementation will eventually support a current session and any number of archived sessions, each associated w/ a name that a client can reference in a login request.


Create documentation
--------------------
jsdoc [filename]
