from flask import Flask,render_template,redirect,session,request,jsonify
from flask_socketio import SocketIO, emit
from collections import deque

import os
import time

app=Flask(__name__)
app.config['SECRET_KEY']='aqswdefrzxcv1234#'
socketio=SocketIO(app)

online_user={}
messages={"general": deque([], maxlen=100)}

@app.route('/')
def sessions():
    return render_template('session.html')

@socketio.on('connect')
def connect_done():
    print("New user is connected")

@socketio.on('userdet')
def record_user(data):
    print(data)
    if 'username' in data:
        print('hai bhai')
        online_user[data['username']]=request.sid

@socketio.on('new channel')
def new_channel(data):
    print(data)
    if data['channel_name'] in messages:
        return False
    else:
        messages[data['channel_name']] = deque(maxlen=100)
        emit('new channel', {"name": data['channel_name']}, broadcast=True)

@socketio.on('extract msg')
def channel_msg(data):
    if 'name' in data:
        emit('msgs', list(messages[data['name']]))


@socketio.on('get channels')
def get_channels():
    emit('channels', list(messages.keys()))

@socketio.on('new msg')
def new_msg(data):
    if 'channel' in data:
        data['created_at'] = int(time.time())
        messages[data['channel']].append(data)
        emit('msg',data, broadcast=True)
        print(messages)


if __name__ == '__main__':
    socketio.run(app, debug=True)