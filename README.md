#NoSQL Project : Cassandra db

Chat application were users can define their tag name and have a conversation on a web page. Every messages send in the page are stored in a db. We have limited the storing to 10 messages so when a new client logs into the server, he will receive the latest messages that were send earlier.

# Web page 

![ui]()
###Technologies used :

* Node js server implementing a web socket (socket-io)  
* docker to run a cassandra instance

### Dependencies

For the node server :
* socket-io
$ npm install socket-io
* cassandra-driver
$ npm install cassandra-driver

For the database setup using docker :
$ docker pull cassandra
Then run the container
$ cqlsh 
to enter shell of cassandra query language

###Project group :

* Buchin Nathan
* Kuijpers Nick
* Hermans Jordan
* Antunes Edgar
