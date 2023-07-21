todo:
    
* handle card locations in card object, compute stack using card locations, derive order by incrementing after 52 (if card is pushed )
* server saves deck state per sessionid, after each event received
* server removes deck state after 1 hour of inactivity


done

* send events to server
* server publishes event bus, clients subscribe to publisher under sessionid
* client cascades server-sent events into UI changes