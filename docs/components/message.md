####  配置
###### 1. 文件配置
* 把jpushEvent.js放到assets/js/文件夹下面
* 把message文件夹放到apps下, outer的默认列表为message.html#/messageList
* 每一个文件夹下面的index.art都加上下面一段话,用作初始化initJpushEvent服务
* 在jpushEvent.js文件里面的第二行appName写上自己的包名
```js
<body onload="onLoad()">
    <div id="app"></div>
</body>
<script>
    function onLoad() {
        document.addEventListener("deviceready", lvJpush.initJpushEvent, false);
    }
</script>
```
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
把底部菜单栏组件化后，放到message/pages/index.vue的底部注释下面
###### 获取未读的数量，需要进行以下操作
在config.js里面增加以下代码
```js
var jpushStore = new Vuex.Store({
    state: {
        noReadNum: 0
    },
})
window.$jpushStore = jpushStore
```
total变量
```js
    computed: {
        total() {
            return $jpushStore.state.noReadNum
        }
    },
```
mounted里面调用函数
```js
    mounted: {
        lvJpush.getNum()
    },
```
####  API相关
1. 登陆登出调用后台接口
```js
//在登录成功的接口调用
lvJPush.loginLog()
//在登出成功的接口调用
lvJPush.logoutLog()
```
2. 阅读全部的业务处理
message/page/index里面的`handleReadAll`方法
3. 如果要停止推送功能
window.JPush.stopPush()
4. 如果要恢复推送功能
lvJPush.initiateUI()








