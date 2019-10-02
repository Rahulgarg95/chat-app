import os
import json
from collections import deque

from flask import Flask,render_template,request,session,redirect
from flask_session import Session
from flask_socketio import SocketIO, emit, disconnect, join_room, leave_room

app = Flask(__name__)
app.config["SESSION_TYPE"] = "filesystem"
socketio = SocketIO(app)
Session(app)
channel_name=[]
user_details=[]
channel_msg = {}

#Homepage entry if login already done
@app.route("/")
def index():
    return render_template('index.html')

#Adding login functionality
@app.route("/login", methods=['GET','POST'])
def login():
    session.clear()
    if request.method == 'POST':
        if(not request.form.get('user-name')):
            msg="Username not entered"
            return render_template('error.html',msg=msg)
        user_name=request.form.get('user-name')
        if(user_name not in user_details):
            user_details.append(user_name)
        #Creating a new session with username
        session['username']=user_name
        session.permanent = True
        print("User Details List",user_details)
        return redirect("/")
    else:
        return render_template('login.html')

#logout functionality helps clear the seesion
@app.route("/logout", methods=['GET'])
def logout():
    try:
        user_details.remove(session['username'])
    except ValueError:
        pass

    # Remove all session details
    session.clear()

    # Redirect user to login form
    return redirect("/")

#Function taking channel name from user and redirecting the user to respective page 
@app.route("/create", methods=['GET','POST'])
def create():
    #Storing channel_name from user input to 'channel' variable
    channel=request.form.get('channel-name')

    if(request.method == 'POST'):
        if(channel not in channel_name):
            channel_name.append(channel)
        #Entry to dict with channel_name and assign its value as queue
        channel_msg[channel]=deque()
        return redirect("/channel/" + channel)
    else:
        return render_template("index.html", channel_list=channel_name)

@app.route("/channel/<channel>", methods=['GET','POST'])
def enter_channel(channel):
    session['current_channel'] = channel
    if(request.method == 'POST'):
        return redirect("/")
    else:
        return render_template('channel.html', channels=channel_name, messages=channel_msg[channel])

@socketio.on("join", namespace='/')
def join_channel():
    room=session.get('current_channel')
    #Join channel
    join_room(room)

    emit('status',{
        'userJoined': session.get('username'),
        'channel': room,
        'msg': session.get('username') + 'has entered the channel'},
        room=room)

@socketio.on('leave', namespace='/')
def leave_channel():
    room=session.get('current_channel')
    #Leave channel
    leave_room(room)

    emit('status',{
        'msg': session.get('username') + 'has left the channel'},
        room=room)
