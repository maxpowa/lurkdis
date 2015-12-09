#!/usr/bin/env python
import discord
import bottle
import threading
from os import path

client = discord.Client()

with open('./credentials') as f:
    creds = f.readlines()

client.login(creds[0].strip(), creds[1].strip())

messages = {}

def process_message(message):
    if message.server.id != '113745426082955273':
        return

    if not hasattr(message.author, 'roles') or len(message.author.roles) <= 1:
        return

    if not 'Admin' in [role.name for role in message.author.roles]:
        return

    for user in message.mentions:
        message.content = message.content.replace('<@' + user.id + '>', '@' + user.name)
    for channel in message.channel_mentions:
        message.content = message.content.replace('<#' + channel.id + '>', '#' + channel.name)

    avatar = message.author.avatar_url()
    if avatar == '':
        avatar = 'https://discordapp.com/assets/0d1a93187d96a05e86444f2fc6210d95.png'
    messages[message.id] = {
        'id': message.id,
        'msg': message.content,
        'sender': message.author.name,
        'time': message.timestamp,
        'avatar': avatar
    }

    print('[' + '+'.join([role.name for role in message.author.roles]) + '] ' + message.author.name + ': ' + message.content)

@client.event
def on_message_edit(message, m2):
    process_message(m2)

@client.event
def on_message_delete(message):
    if message.id in messages:
        del messages[message.id]

@client.event
def on_message(message):
    process_message(message)

@client.event
def on_ready():
    for server in client.servers:
        if server.id != '113745426082955273':
            return

        for channel in server.channels:
            if channel.type == 'voice':
                return
            print(channel.name)
            for message in client.logs_from(channel, 10000):
                on_message(message)

@bottle.route('/')
@bottle.view('template/main')
def main_page():
    return dict(messages=sorted(messages.values(), key=lambda x: x['time'], reverse=True))

@bottle.route('/static/<filepath:path>')
def server_static(filepath):
    return bottle.static_file(filepath, root=path.dirname(path.realpath(__file__)) + '/static')

def main():
    threading.Thread(target=bottle.run, kwargs=dict(host='localhost', port=8080)).start()
    client.run()

if __name__ == '__main__':
    main()
