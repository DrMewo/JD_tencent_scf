const $ = new Env('特物Z|万物皆可国创');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const randomCount = $.isNode() ? 20 : 5;
const Opencardtw= $.isNode() ? (process.env.Opencardtw?process.env.Opencardtw:false):false
const notify = $.isNode() ? require('./sendNotify') : '';
let merge = {}
let codeList = []
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com/client.action`;

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }
    const signeid = "zFayjeUTzZWJGwv2rVNWY4DNAQw"
    const signactid = 1000021
    const signenpid = "uK2fYitTgioETuevoY88bGEts3U"
    const signdataeid = "47E6skJcyZx7GSUFXyomLgF1FLCA"
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.beans = 0
            message = ''
            $.cando = true
            //   await shareCodesFormat();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            await getid("superBrandSecondFloorMainPage", "secondfloor")
            if(!$.cando){
                console.log('今天没活动,退出')
                return
            }
            if ($.cando && $.enpid) {
                await getCode("secondfloor", $.actid)
                if ($.taskList) {
                    for (task of $.taskList) {
                        if (task.assignmentType == 3) {  //关注店铺 
                        //    console.log(task)
                            await doTask("secondfloor", $.enpid, task.encryptAssignmentId, task.ext.followShop[0].itemId, 3)
                        } else if (task.assignmentType == 0){ // 分享任务 
                            await doTask("secondfloor", $.enpid, task.encryptAssignmentId, null, 0)             
                        }else{ 
                        if(Opencardtw){  //领取开卡奖励
                            await doTask("secondfloor", $.enpid, task.encryptAssignmentId, task.ext.brandMemberList[0].itemId, 7)
                        }else{console.log("默认不执行开卡任务") }
                        }
                    }
                }
                await superBrandTaskLottery()
                await $.wait(500);
                await superBrandTaskLottery()
                await $.wait(1000);
   //             await doTask("sign", signenpid, signdataeid, 1, 5)
           //     await $.wait(1000);
             //   await superBrandTaskLottery("sign", signactid, signenpid, signeid)
            }
        }
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            console.log(`\n******开始【京东账号${$.index}】\n`);
            for (l = 0; l < codeList.length; l++) {
                console.log(`为 ${codeList[l]}助力中`)
                let code = await doTask("secondfloor", $.enpid, $.inviteenaid, codeList[l], 2)
                if (code == 108) {
                    l = 9999;
                    console.log("助力次数已满")
                }else if(code == 103){
                codeList.splice(l--, 1) //任务已完成               
                }
            }
        }
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            console.log(`\n******开始【京东账号${$.index}】抽奖\n`);
            await superBrandTaskLottery()
            //    await superBrandTaskLottery()
            await superBrandTaskLottery()
        }
    }
})()
.catch((e) => $.logErr(e))
    .finally(() => $.done())
//获取活动信息

function getid(functionid, source) {
    return new Promise(async (resolve) => {
        const options = taskPostUrl(functionid, `{"source":"${source}"}`)
        //  console.log(options)
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    data = JSON.parse(data);
                    //      console.log(data)
                    if (data.data && data.code === "0" && data.data.result) {
                        let result = data.data.result
                        if (result.activityBaseInfo) {
                            $.actid = result.activityBaseInfo.activityId
                            $.actname = result.activityBaseInfo.activityName
                            $.enpid = result.activityBaseInfo.encryptProjectId
                            console.log(`当前活动：${$.actname}  ${$.actid}`)
                        }
                    } else {
                        console.log("获取失败")
                        $.cando = false
                        resolve()
                    }

                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}


function getCode(source, actid) {
    return new Promise(async (resolve) => {
        const options = taskPostUrl("superBrandTaskList", `{"source":"${source}","activityId":${actid},"assistInfoFlag":1}`)
        //   console.log(options)
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    data = JSON.parse(data);
                    //  console.log(data.data.result)
                    if (data && data.data && data.code === "0" && source === "secondfloor") {
                        if (data.data.result && data.data.result.taskList) {
                            $.taskList = data.data.result.taskList.filter(x => x.assignmentType == 3 || x.assignmentType == 7 || x.assignmentType == 0)
                       //       console.log(data.data.result.taskList)
                            let result = data.data.result.taskList.filter(x => x.assignmentType == 2)[0]
                            let encryptAssignmentId = result.encryptAssignmentId
                            let itemid = result.ext.assistTaskDetail.itemId
                            //  console.log(result)
                            $.inviteenaid = result.encryptAssignmentId
                            codeList[codeList.length] = itemid
                            console.log(`获取邀请码成功 ${itemid}`);
                        } else {
                            console.log(data)
                        }
                    } else {
                        //  console.log(data.data.result)                       
                    }
                    resolve(data.data.result.taskList)

                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function doTask(source, pid, encryptAssignmentId, id, type) {
    return new Promise(async (resolve) => {
            body =  `{"source":"${source}","activityId":${$.actid},"encryptProjectId":"${pid}","encryptAssignmentId":"${encryptAssignmentId}","assignmentType":${type},"itemId":"${id}","actionType":0}`   
            if(type === 0){    body =        `{"source":"${source}","activityId":${$.actid},"encryptProjectId":"${pid}","encryptAssignmentId":"${encryptAssignmentId}","assignmentType":${type},"completionFlag":1,"itemId":"${id}","actionType":0}` }  
            const options = taskPostUrl(`superBrandDoTask`, body)
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    //      console.log(data)
                    data = JSON.parse(data);
                    if (data && data.code === "0") {
                        if (data.data.bizCode === "0") {
                            console.log("任务成功啦~")
                        } else {
                            console.log(data.data.bizMsg)
                        }
                        resolve(data.data.bizCode)
                    } else {
                        console.log(data)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function superBrandTaskLottery(source = "secondfloor", actid, enpid, signeid) {
    return new Promise(async (resolve) => {
        body = `{"source":"${source}","activityId":${$.actid}}`
        if (source === "sign") {
            console.log("签到抽奖中")
            //    console.log(
            body = `{"source":"sign","activityId":${actid},"encryptProjectId":"${enpid}","encryptAssignmentId":"${signeid}"}`
        }
        //    console.log(body)
        const options = taskPostUrl("superBrandTaskLottery", body)
        //    console.log(options)
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    data = JSON.parse(data);
                    //   console.log(data)
                    if (data && data.code === "0") {
                        if (data.data.bizCode === "TK000") {                            
                            let reward = data.data.result.userAwardInfo
                            if(reward&&reward.beanNum){
                            console.log(`恭喜你 获得 ${reward.beanNum}京🐶`)                            
                            }else{
                            console.log(`获得 你猜获得了啥🐶`)
                            }
                        } else {
                            console.log(data.data.bizMsg)
                        }
                    } else {
                        console.log(data)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}



function taskPostUrl(functionid, body) {
    const time = Date.now();
    return {
        url: `https://api.m.jd.com/api?functionId=${functionid}&appid=ProductZ4Brand&client=wh5&t=${time}&body=${encodeURIComponent(body)}`,
        body: "",
        headers: {
            Accept: "application/json,text/plain, */*",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            Connection: "keep-alive",
            Cookie: cookie,
            Host: "api.m.jd.com",
            Referer: "https://prodev.m.jd.com/mall/active/NrHM6Egy96gxeG4eb7vFX7fYXf3/index.html?activityId=1000007&encryptProjectId=cUNnf3E6aMLQcEQbTVxn8AyhjXb&assistEncryptAssignmentId=2jpJFvC9MBNC7Qsqrt8WzEEcVoiT&assistItemId=S5ijz_8ukVww&tttparams=GgS7lUeyJnTGF0IjoiMzMuMjUyNzYyIiwiZ0xuZyI6IjEwNy4xNjA1MDcifQ6%3D%3D&lng=107.147022&lat=33.255229&sid=e5150a3fdd017952350b4b41294b145w&un_area=27_2442_2444_31912",
            "User-Agent": "jdapp;android;9.4.4;10;3b78ecc3f490c7ba;network/UNKNOWN;model/M2006J10C;addressid/138543439;aid/3b78ecc3f490c7ba;oaid/7d5870c5a1696881;osVer/29;appBuild/85576;psn/3b78ecc3f490c7ba|541;psq/2;uid/3b78ecc3f490c7ba;adk/;ads/;pap/JA2015_311210|9.2.4|ANDROID 10;osv/10;pv/548.2;jdv/0|iosapp|t_335139774|appshare|CopyURL|1606277982178|1606277986;ref/com.jd.lib.personal.view.fragment.JDPersonalFragment;partner/xiaomi001;apprpd/MyJD_Main;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
        }
    }
}
function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
