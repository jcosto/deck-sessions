todo:
    
* send events to server
* server saves deck state per sessionid, after each event received
* server publishes event bus, clients subscribe to publisher under sessionid
* client cascades server-sent events into UI changes
* server removes deck state after 1 hour of inactivity