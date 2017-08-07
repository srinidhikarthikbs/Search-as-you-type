# Search-as-you-type
This is an attempt at replicating Google's instant results while typing the search query.
The project was developed as a part of the course CSCI 572 - Information retrieval and Search Engines at USC.

Features aimed at:
1. Instant search and asynchronous calls to server
2. Auto complete feature while typing
3. Spell checker for the query before displaying results


##How to get it running?
Start a solr instance and index the data. This project was specifically meant to run on newspaprt articles. 
Replace the solr instance credentials, and start the node server. 
Visit localhost, and it should be working.
