var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var MongoClient = require('mongodb').MongoClient;


server.listen(3000);

app.get('/', function (request, respons) {
    respons.sendFile(__dirname + '/index.html');
});

users = [];
connections = [];

var user;

io.sockets.on('connection', function (socket) {
    console.log("Success connection");
    connections.push(socket);

    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnect");
    });

    socket.on('send mess', function (data) {
        io.sockets.emit('add mess', { mess: data.mess, name: data.name, className: data.className });
        user = { mess: data.mess, name: data.name, className: data.className };

        MongoClient.connect("mongodb+srv://masha:disclosssure@chat-rgaai.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
            if (err) throw err;
            var db = client.db("userCollectionDB");

            db.collection("users").insertOne(user, function (findErr, result) {
                if (findErr) {
                    console.log(err);
                    return;
                }
                console.log(result.ops);
                client.close();
            });
        });
    });

    socket.on('get hist', function () {
        MongoClient.connect("mongodb+srv://dariaaabram:echelonforever@chat-aqhpn.gcp.mongodb.net/test?retryWrites=true&w=majority, function (err, client) {
            if (err) throw err;

            var db = client.db("userCollectionDB");
            var collection = db.collection("users");

            var cursor = collection.find();

            cursor.toArray(function (err, res) {

                res.forEach(element => {
                    //console.log("dfdfdfssfsdfsfsd");
                    io.sockets.emit('add hist', { mess: element.mess, name: element.name, className: element.className });
                   // $AAAAh.append("<div class='alert alert-" + element.className + "''><b>" + element.name + "</b>: " + element.mess + "</div>");
                });

                client.close();
            })
        });
    });
});