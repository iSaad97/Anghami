const fs=require("fs"),path=require("path"),tus=require("tus-js-client"),storage=require("electron-json-storage"),logger=require("./logger");let uploader={};function getUserAuth(){return new Promise(function(e,o){storage.get("user",(o,a)=>{e(o?{}:a)})})}function emitMessageToWebPlayer(e,o){global._desktopSource.next({action:e,payload:o})}uploader.token="",uploader.uploadOperation={},uploader.retries=0,uploader.uploadFile=async function(e,o,a,r){const t=await getUserAuth();let l=fs.createReadStream(o),s=fs.statSync(o).size,u=a||"anghami.androidlogs",p=`https://${u}.s3.amazonaws.com/`,n=`https://s3-eu-west-1.amazonaws.com/${u}/`,d=t.user.socketsessionid||"C5E386CD1A2A2F1DD93841AD811F7",i=Date.now()+Math.floor(1e3*Math.random()+1),c=path.extname(o),g=t.user.anid+"-"+i+"-"+e+c,m={endpoint:"https://tusk.anghami.com/files/",retryDelays:[0,1e3,3e3],resume:!0,withCredentials:!0,uploadSize:s,metadata:{filename:g,token:d,bucket:u},onError:function(t){4==uploader.retries?uploader.retries=0:(uploader.uploadFile(e,o,a,r),uploader.retries++,logger.logEvent(`Failed to upload from desktop app with error: ${t} - retries: ${uploader.retries}`))},onProgress:function(e,o){let a=(e/o*100).toFixed(2);emitMessageToWebPlayer("tus-upload-progress",{fileName:g,percentage:a})},onSuccess:function(){uploader.uploadOperation.url;let e=`${p}${g}`,o=`${n}${g}`;uploader.retries=0,emitMessageToWebPlayer("tus-upload-done",{fileName:g,uploadedUrl:e}),r(e,o)}};uploader.uploadOperation=new tus.Upload(l,m),uploader.uploadOperation.start()},uploader.cancelUpload=(()=>{uploader.uploadOperation&&uploader.uploadOperation.abort&&(logger.logEvent(`Upload being canceled ${uploader.uploadOperation}`),uploader.uploadOperation.abort())}),module.exports=uploader;