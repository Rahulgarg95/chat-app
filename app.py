import os
import json
from collections import deque

from flask import Flask,render_template,request,session,redirect
from flask_session import Session
from flask_socketio import SocketIO, emit, disconnect, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
Session(app)
channel_name=[]
user_details=[]
channel_msg = {}

@app.route("/")
def index():
    return render_template('index.html')

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
        session['username']=user_name
        session.permanent = True
        return redirect("/")
    else:
        return render_template('login.html')

@app.route("/create", methods=['GET','POST'])
def create():
    channel=request.form.get('channel-name')

    if(request.method == 'POST'):
        if(channel not in channel_name):
            channel_name.append(channel)

        channel_msg[channel]=deque()
        return redirect("/channel/" + channel)
    else:
        return render_template("create_channel.html", channel_list=channel_name)

