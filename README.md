todo:

* implementation: azure function using azure web pubsub


done

* handle card locations in card object, compute stack using card locations, derive order by incrementing after 52 (if card is pushed )
* send events to server
* server publishes event bus, clients subscribe to publisher under sessionid
* client cascades server-sent events into UI changes
* implementation: local flask server using azure web pubsub
* join into ongoing session
* change to other session