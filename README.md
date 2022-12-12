# NoSQL Project : Cassandra db

Chat application were users can define their tag name and have a conversation on a web page. Every messages send in the page are stored in a db. We have limited the storing to 10 messages so when a new client logs into the server, he will receive the latest messages that were send earlier.

# Web page 

!["user-interface"](/public/images/nosql_project.png)

### Technologies used :

* Node js server implementing a web socket (socket-io)  
* docker to run a cassandra instance

### Dependencies

For the node server :

'''
$ npm install express
$ npm install http
$ npm install body-parser
$ npm install ejs
$ npm install socket-io
$ npm install cassandra-driver
'''

For the database setup using docker :
'''
$ docker pull cassandra
$ cqlsh 
'''

### Project group :

* Buchin Nathan
* Kuijpers Nick
* Hermans Jordan
* Antunes Edgar
