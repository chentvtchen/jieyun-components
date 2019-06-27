
let id = process.env.id

const lvJPush = {
    appName: id,
    initFlag: false, // 是否初始化
    callbackfn: null,  // 回调方法
    initJpushEvent: function (fn) {
        // 极光推送
        document.addEventListener('jpush.receiveRegistrationId', lvJPush.initJpush, false)
        lvJPush.initJpushListener()
        lvJPush.getUserNotificationSettings()
        lvJPush.initiateUI()
        lvJPush.callbackfn = fn
    },
    initJpushListener: function (fn) { // 极光推送
        document.addEventListener('jpush.openNotification', lvJPush.openNotification, false)
        document.addEventListener('jpush.receiveNotification', lvJPush.receiveNotification, false)
    },
    initJpush: function (event) {

    },
    /**
     * 打开通知的事件处理
     * @param event
     */
    openNotification: function (event) {
        if (lvJPush.devicereadyFlag) {
            let msgId = lvJPush.getJPushExtras(event, 'msgId')
            if (msgId) {
                // 跳转到对应页面
                lvJPush.clickLog(msgId)
                // 获取到详情
                lvJPush.getMessage(msgId).then(data => {
                    localStorage.setItem('messageInitAllData', 'true')
                    lvJPush.jumpTarget(data)
                })
            }
        } else {
            document.addEventListener('deviceready', lvJPush.openNotification(event), false)
        }
    },
    /**
     * @method 跳转到对应页面
     */
    jumpTarget(data) {
        let outMeta = JSON.parse(data.outMeta)
        let jumpUrl = data.jumpUrl
        let outLinkFlag = jumpUrl ? jumpUrl.indexOf('http') > -1 : false
        // 如果有传过来的参数
        if (outMeta.jumpUrl) {
            jumpUrl = outMeta.jumpUrl
            outLinkFlag = jumpUrl.indexOf('http') > -1
        }
        if (outLinkFlag && jumpUrl) {
            common.inAppBrowserOpen(jumpUrl)
        }
        if (!jumpUrl || !outLinkFlag) {
            // 如果是消息列表
            if (parseInt(data.type) === 2) {
                // 更新消息的阅读时间
                lvJPush.readNewsType(data)
                let title = data.appName ? data.appName : '信息列表'
                // 外链要跳到相对应的应用的地方
                location.href = 'message.html#/messageSecList?id=' + data.appId + '&type=' + data.type + '&title=' + title
            } else {
                // 跳转到通知页面
                location.href = 'message.html#/messageList?activeNum=0'
            }
        }
    },
    // 更新阅读时间
    readNewsType(data) {
        let url = constGlobal.HostMessage + 'readTime/update?type=' + data.type + '&appId=' + data.appId
        http.apiGet(url).then(res => {
            // 获取未读消息的数量
            lvJPush.getNum()
        })
    },
    /**
     * @method 点击查看通知消息
     */
    clickLog: function(msgId) {
        let url = constGlobal.HostMessage + 'clickLog/add?msgId=' + msgId
        http.apiGet(url).then(res => {
            // 获取未读消息的数量
            lvJPush.getNum()
        })
    },
    /**
     * @method 获取通知消息的详情
     */
    getMessage: function(msgId) {
        return new Promise((resolve, reject) => {
            let url = constGlobal.HostMessage + 'msgDetail/search?msgId=' + msgId
            http.apiGet(url).then(res => {
                if (res.status === 0) resolve(res.data)
            })
        })
    },
    /**
     * 获取到通知消息
     * @param event
     */
    receiveNotification: function (event) {
        var alertContent
        if (device.platform == 'Android') {
            alertContent = event.alert
        } else {
            alertContent = event.aps.alert
        }
        // 获取未读消息的数量
        lvJPush.getNum()
    },
    /**
     * 获得通知的参数
     * @param key
     */
    getJPushExtras: function (event, key) {
        let obj = event.extras
        return obj[key]
    },
    /**
     * 判断系统设置里面是否打开应用推送
     */
    getUserNotificationSettings: function() {
        window.JPush.getUserNotificationSettings(function (result) {
            if (result == 0) {
                // console.log('系统设置中已关闭应用推送。')
            } else if (result > 0) {
                // console.log('系统设置中打开了应用推送。')
            }
        })
    },
    /**
     * 初始化jpush
     */
    initiateUI: function () {
        // 如果初始化过，不用再继续走
        if (lvJPush.getInitFlag() == 'true') return
        let self = lvJPush
        // 设置debug模式,打印日志
        window.JPush.setDebugMode(true)
        try {
            // 初始化jpush
            window.JPush.init()
            window.JPush.resumePush()
            if (device.platform != 'Android') {
                window.JPush.setApplicationIconBadgeNumber(0)
            }
            if (window.JPush) {
                // 获得注册ID
                self.getRegistrationID()
                window.JPush.cleanTags({
                    sequence: 1
                },
                    (result) => {
                        var sequence = result.sequence
                    }, (error) => {
                        var sequence = error.sequence
                        var errorCode = error.code
                    })
                // 极光推送，清除消息通知（角标）
                window.JPush.resetBadge()
                window.JPush.setApplicationIconBadgeNumber(0)
            }
        } catch (exception) {
            console.log(exception)
        }
    },
    /**
     * 获取注册id
     */
    getRegistrationID: function () {
        var self = lvJPush
        window.JPush.getRegistrationID(function (d) {
            self.onGetRegistrationID(d, self)
        })
    },
    /**
     * 处理注册id
     * @param data
     * @param self
     */
    onGetRegistrationID: function (data, self) {
        try {
            // 没有获取到注册id，重新获取
            if (data.length == 0) {
                window.setTimeout(lvJPush.getRegistrationID, 1000)
            } else {
                self.regDevice(data)
            }
        } catch (exception) {
        }
    },
    /**
     * 获得缓存注册ID
     */
    getRID: function () {
        let rid = localStorage.getItem('jpush_RID')
        return rid
    },
    /**
     * 设置缓存注册ID
     */
    setRID: function (val) {
        // 将注册ID进行缓存
        localStorage.setItem('jpush_RID', val)
        sessionStorage.setItem('jpush_initFlag', 'true')
    },
    /**
     * 获得初始化标志
     */
    getInitFlag: function () {
        return sessionStorage.getItem('jpush_initFlag')
    },
    /**
     * 重置初始化标志
     */
    resetInitFlag: function () {
        sessionStorage.setItem('jpush_initFlag', 'false')
    },
    /**
     * 注册设备
     */
    regDevice: function (regId) {
        // console.log('设备信息', device)
        let self = lvJPush
        let url = constGlobal.HostMessage + '/registration/add?deviceId=' + lvJPush.getDeviceUuid() + '&appName=' + lvJPush.appName + '&registrationId=' + regId
        http.apiGet(url).then(res => {
            // 存入注册ID
            self.setRID(regId)
            self.isFunc()
        })
    },
    /**
     * 停止推送
     */
    stopPush: function () {
        window.JPush.stopPush()
    },
    /**
     * 极光登录登出日志
     * @param status
     * @param appName
     */
    regStatusLog: function (status, appName) {
        let param = {
            'appName': appName,
            'deviceId': lvJPush.getDeviceUuid(),
            'deviceName': lvJPush.getDeviceManufacturer(),
            'status': status // 0登出 1 登录
        }
        http.apiPost(constGlobal.HostMessage + '/registerStatus/update', param).then(res => {
            console.log(res, '极光登录登出日志', status)
        })
    },
    /**
     * 登录日志
     */
    loginLog: function () {
        console.log('bbbbb')
        console.log(lvJPush)
        lvJPush.regStatusLog(1, lvJPush.appName)
    },
    /**
     * 登出日志
     */
    logoutLog: function () {
        lvJPush.regStatusLog(0, lvJPush.appName)
    },
    /**
     * @method 获取所有未读消息
     */
    getNum: function() {
        Promise.all([lvJPush.getInfoNum(), lvJPush.getMessNum()]).then(res => {
            let total = 0
            res.forEach((item, index) => {
                total += item
            })
            $jpushStore.dispatch('getNoReadNum', {
                num: total
            })
        })
    },
    /**
     * @method 获取通知未读消息的数量
     */
    getInfoNum: function() {
        return new Promise((resolve, reject) => {
            http.apiPost(constGlobal.HostMessage + 'unClick/search', {
                type: '1'
            }).then(res => {
                if (res.status == 0) {
                    resolve(res.data)
                } else {
                    reject()
                    common.toastMsg(res.message)
                }
            })
        })
    },
    /**
     * @method 获取消息未读消息的数量
     */
    getMessNum: function() {
        return new Promise((resolve, reject) => {
            http.apiGet(constGlobal.HostMessage + 'unRead/count?type=2').then(res => {
                if (res.status == 0) {
                    let count = 0
                    res.data.forEach((item, index) => {
                        count += item.count
                    })
                    resolve(count)
                } else {
                    reject()
                    common.toastMsg(res.message)
                }
            })
        })
    },
    /**
     * @method 获取设备id
     */
    getDeviceUuid: function () {
        return (device.uuid ? device.uuid : '')
    },
    /**
     * @method 获取手机产商
     */
    getDeviceManufacturer: function () {
        return (device.manufacturer ? device.manufacturer : '')
    },
    /**
     * @method 判断是否是方法
     */
    isFunc: function (data) {
        let fn = lvJPush.callbackfn
        if (fn) {
            if (typeof fn === 'function') {
                fn(data)
            }
        }
    }
}
document.addEventListener('deviceready', onDeviceReady, false)
function onDeviceReady() {
    lvJPush.devicereadyFlag = true
    console.log('lvJPush.devicereadyFlag = true')
}

export default lvJPush
