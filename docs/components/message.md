####  配置
###### 1. 文件配置
* 把jpushEvent.js放到assets/js/文件夹下面
* 把message文件夹放到apps下, outer的默认列表为message.html#/messageList
* 每一个文件夹下面的index.art都加上下面一段话,用作初始化initJpushEvent服务
```js
<body onload="onLoad()">
    <div id="app"></div>
</body>
<script>
    function onLoad() {
        document.addEventListener("deviceready", lvJpush.initJpushEvent, false);
    }
</script>
###### 2. 参数配置
constGlobal.js
```js
// HostMessage: mainHost + '/message/app/',  暂时不用这个
HostMessage: 'http://192.168.100.201:9823/message/app/', 
```
devConstGlobal.js
```js
HostMessage: 'http://192.168.100.200:8888/message/app/', 
```
在config文件里面
```js
/** 极光推送封装JS**/
import lvJpush from 'assets/js/jpushEvent.js'
window.lvJpush = lvJpush
/** 下滑加载更多JS**/
import { InfiniteScroll } from 'mint-ui'
Vue.use(InfiniteScroll)
```
###### 3. 依赖插件
```js  
"mint-ui": "2.2.9",
```
###### 4. 改颜色
在public.scss里面配置变量

| 变量   |      意义      | 默认值 |
|----------|:-------------:|------:|
| $message_theme_color |  标题头部主题色 | #f8f8f8 |
| $message_header_title_color |   消息通知选中的颜色  |  #181818 |
| $message_header_default_color| 消息通知未选中的颜色 |   #454545 |
| $message_header_info_color| 返回左箭头的颜色 |   #838383 |


###### 5. 集成底部菜单栏
把底部菜单栏组件化后，放到message/pages/index.vue的103行，通过一个props参数:noReadNum="infoTotal + messageTotal"传参到底部组件获取到未读的数量
![image.png](https://upload-images.jianshu.io/upload_images/2216204-58ea4c3a56961d14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
###### 如果要在底部菜单栏显示及时更新的未读数量，在底部菜单栏中按照下面的操作方法
在computed里面声明一个total，然后显示未读数量就用这个total变量
```js
    computed: {
        total() {
            let path = this.$route.path;
            return (path === '/messageList')  ? this.noReadNum : this.getTotal
        }
    },
```
mounted里面调用函数
```js
        this.getNum()
        // 监听消息推送
        document.addEventListener('jpush.receiveNotification', this.getNewInfo, false)
```
methods里面增加以下函数
```js
        // 获取到新消息处理
        getNewInfo() {
            let path = this.$route.path;
            // 不是消息列表页面，获取新消息
            if(path !== '/messageList') this.getNum()
        },
        // 获取所有数据
        getNum() {
            Promise.all([this.getInfoNum(), this.getMessNum()]).then(res => {
                let total = 0
                res.forEach((item, index) => {
                    total += item
                })
                this.getTotal = total
                this.initFlag = true
            })
        },
        // 获取通知未读消息的数量
        getInfoNum() {
            return new Promise((resolve, reject) => {
                http.apiPost(constGlobal.HostMessage + 'unClick/search', {
                    type: '1'
                }).then( res=>{
                    if( res.status == 0){
                        resolve(res.data)
                    }else{
                        reject()
                        common.toastMsg( res.message )
                    }
                });
            })
        },
        // 获取通知未读消息的数量
        getMessNum() {
            return new Promise((resolve, reject) => {
                http.apiGet(constGlobal.HostMessage + 'unRead/count?type=2').then( res=>{
                    if( res.status == 0){
                        let count = 0;
                        res.data.forEach((item, index) => {
                            count += item.count
                        })
                        resolve(count)
                    }else{
                        reject()
                        common.toastMsg( res.message )
                    }
                });
            })
        }
```
####  API相关
1. 登陆登出调用后台接口
```js
//APP登录登出记录
constGlobal.HostMessage + '/registerStatus/update'
method: POST
param:
{
	"appName":"你的包名",
	"deviceId": (device.uuid ? device.uuid : ''),
	"deviceName"(device.manufacturer ? device.manufacturer : ''), 
	"status":0 // 0登出 1 登录
}
```
2. 阅读全部的业务处理
message/page/index里面的`handleReadAll`方法
3. 如果要停止推送功能
window.JPush.stopPush()
4. 如果要恢复推送功能
lvJPush.initiateUI()








