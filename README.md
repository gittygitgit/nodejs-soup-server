# nodejs-soup-server
A Nodejs implementation of a SoupTCP 2.0 client and server. 

The SoupTCP 2.0 specification can be found [here](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/souptcp.pdf).

## Overview
SoupTCP is a client / server messaging protocol used in the financial industry. 

The protocol allows information to be made available from a server application via TCP connection to clients.

Information delivered over the protocol is in either ascii or binary format.

In order for a client to parse information, a parser must be used.



## Functionality
#### Message schema
Brewery
Pos   Field              Type      Len         Val
0     MsgType            byte      1           B
1     Id                 byte      1 
2     Name               byte[]    30
32    Country            byte[]    20

Beer Style
Pos   Field              Type      Len         Val
0     MsgType            byte      1           S
1     Id                 byte      1
2     Name               byte[]    30

Beer
Pos   Field              Type      Len         Val
0     MsgType            byte      1           A
1     Id                 byte      1
2     StyleId            byte      1    
3     BreweryId          byte      1
4     Name               byte[]    30


#### Encode message struct to binary format
  

#### Generate parser

TODO: Create sample message stream.

Brewery
Id        short
Name      byte[30]

Beer Style
Id        short
Name      byte[30]

Beer
Id        short
BreweryId short
Name      byte[30]
Abv       long






#### Process binary (squirrel) file 


#### Process database store

## Goals
```npm test```
