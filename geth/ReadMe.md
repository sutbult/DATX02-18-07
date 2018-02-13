Guide for geth

Five steps to connect to others' private net:
* Step 1: Create new folder and paste genesis file from network you wish to connect to.
* Step 2: initalize the network with the following geth command:
  geth --networkid xxx --datadir [path to newly created folder] init [path]\genesis.json
* Step 3: Connect to the network:
  geth --networkid xxx --datadir [path to newly created folder]
* Step 4: (Optional) open new console, type: geth attach
* Step 5: Both parties type admin.nodeInfo.enode
  Replace [::] with IP
  send to the other user
  now type admin.addPeer("all the enode")
  
  And you are good to go. If it does not work and you have given it a good 5-10 min, try having one party restarting the network
  BUT OBSERVE if you disconnect you need to addPeer again.
