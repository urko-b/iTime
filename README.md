
## iTime

**Version 0.0.1**
**This app use MEAN Stack:**
- A front-end application that is responsible for managing the work hours of employees of a company: https://github.com/elefantelimpio/iTimeApp.git

- NodeJS with MongoDB back-end: https://github.com/elefantelimpio/iTime.git



## .env File
**You must create or have a .env file with this configuration:**
```sh

NODE_ENV=development
PORT=3000
SOCKET_PORT=4444
MONGO_PORT=27017
WEBAPINAME=webapi
VERSION=1.0
LISTEN_TO_CHANGES=true
SECRET_KEY=cDv%y5PsLzj?Et7+9j3URTk6L
CLUSTER_DB_NS=iTime
CLUSTER_DB=mongodb+srv://USER:PASSWORD@clusterURL/iTime?retryWrites=true
MONGO_URL=mongodb://mongodb:27017/iTime
AUDIT_LOG=audit_log
```



## Installation
To develop in local environment:
```shell
git clone https://github.com/elefantelimpio/iTime.git
cd iTime
npm i
npm run start-watch
```

---

## Database Requirements

**You must have a collection called "users"**:

1. **cards(array of string)** This is an optional field because this project has another part with a RaspberryPI with a NFC Card associated.
2. **name (string)** The name of the user
3. **surname (string)** The surname of the user
4. **password(string)** Hashed password (jwt npm package)
5. **email(string)** Email of the user. This field is used for login
6. **roles(array of string)** An array with names of roles to be used in the front end to show/hide functionality

*Example:* 
```sh
{
	"_id": {
		"$oid": "5cd9b35ef570403880dd56b0"
	},
	"cards": ["8122982131"],
	"name": "Jefe",
	"surname": "Pruebas",
	"password": "$2a$10$L02M2RJ7hTrq1JSkUMTDEuefCCK9MOm43q.14MG3AY7qMnyNSCEBu",
	"email": "jefede@pruebas.com",
	"roles": ["show_time_tracking_bag", "show_history", "show_history_everyone"]
}
```
