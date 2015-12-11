#!/usr/bin/env python
import discord
import bottle
import threading
from os import path
from werkzeug.contrib.atom import AtomFeed

client = discord.Client()

with open('./credentials') as f:
    creds = f.readlines()

client.login(creds[0].strip(), creds[1].strip())

channels_to_monitor = ['announcements', 'general-sc-chat', 'sc-alpha-2-0']

messages = {}
announcement = False
last_id = 0

def process_message(message):
    global announcement, last_id

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
        'pretty_time': message.timestamp.replace(microsecond=0),
        'avatar': avatar,
        'channel': message.channel.name
    }

    messages[message.id]['markdown'] = (
            "*{sender}* - {pretty_time} UTC\n`{msg}`\nhttps://lurkdis.maxpowa.us/#{id}"
            .format(**messages[message.id])
        )

    last_id = message.id

    if message.channel.name == "announcements" and (not announcement or messages[announcement]['time'] < message.timestamp):
        announcement = message.id

    print('[' + '+'.join([role.name for role in message.author.roles]) + '] #' + message.channel.name + ' ' + message.author.name + ': ' + message.content)

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
            continue

        for channel in server.channels:
            print(channel.name)

        for channel in server.channels:
            if not channel.name in channels_to_monitor:
                continue
            print('Fetching #' + channel.name)
            for message in client.logs_from(channel, 10000):
                on_message(message)

@bottle.route('/')
@bottle.view('template/main')
def main_page():
    tmp = None
    if announcement:
        tmp = messages[announcement]
    return dict(messages=sorted(messages.values(), key=lambda x: x['time'], reverse=True), announcement=tmp, last_id=last_id)

@bottle.route('/feed.atom')
def atom_feed():
    bottle.response.content_type = 'text/xml'
    feed = AtomFeed("LurkDis Atom Feed", feed_url=bottle.request.url,
                    url="https://lurkdis.maxpowa.us/",
                    subtitle='Don\'t worry about missing out on CIG updates in Discord!')
    for message in sorted(messages.values(), key=lambda x: x['time'], reverse=True):
        feed.add(message['sender'] + ' in #' + message['channel'], message['msg'], content_type='html',
                 author=message['sender'], url="https://lurkdis.maxpowa.us/#" + message['id'],
                 updated=message['pretty_time'])
    return feed.generate()

@bottle.route('/last')
def get_last_id():
    bottle.response.content_type = 'text/plain'
    return last_id

@bottle.route('/static/<filepath:path>')
def server_static(filepath):
    return bottle.static_file(filepath, root=path.dirname(path.realpath('__file__')) + '/static')

def main():
    threading.Thread(target=bottle.run, kwargs=dict(host='localhost', port=8080)).start()
    client.run()

if __name__ == '__main__':
    main()
