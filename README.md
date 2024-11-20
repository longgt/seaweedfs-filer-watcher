seaweedfs-filer-watcher
==============

Demo for SeaweedFS [Filer-Change-Data-Capture](https://github.com/seaweedfs/seaweedfs/wiki/Filer-Change-Data-Capture) on Node.JS

## Configure SeaweedFS

References: [SeaweedFS](https://github.com/seaweedfs/seaweedfs/wiki/Production-Setup#for-single-node-setup)

The default port for Filer gRPC will be **18888**

**Tips:** if the SeaweedFS server takes time to start on single-node setup, add the following options to startup command line
```bash
  <Your startup command>
  ...
  -master.electionTimeout 1s \
  -master.heartbeatInterval 100ms \
  -master.raftHashicorp
```

## Filer watcher

Copy `.env.example` to `.env` then modify the environment variables in there.

The latest `filer.proto` can be downloaded from [here](https://github.com/seaweedfs/seaweedfs/tree/master/other/java/client/src/main/proto)

## Start filer watcher

```bash
npm start
```

## Example

The below steps is demo for watching file event at S3 buckets directories.

### Create S3 bucket

Make a new bucket

```bash
aws --endpoint-url http://localhost:8333 s3 mb s3://newbucket3
```

References: [AWS-CLI-with-SeaweedFS](https://github.com/seaweedfs/seaweedfs/wiki/AWS-CLI-with-SeaweedFS)

### Modify .env

Example:
```
FILER_GRPC_ADDRESS=localhost:18888
FILER_WATCHER_CLIENT_NAME=seaweedfs-filer-watcher
FILER_WATCHER_PATH_PREFIX=/buckets
```

### Start watcher

```bash
npm start
```

### Simulate filer change event

Open http://localhost::8888 at any browser.

Then, navigate to `/buckets/newbucket3` folder.

Click button [Upload] on the right side to upload any file.
