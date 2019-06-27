####  配置
###### 1. 文件配置
* 文件在[消息通知](https://github.com/chentvtchen/jieyun-components/tree/master/components/消息)
* 把jpushEvent.js放到assets/js/文件夹下面
* 把message文件夹放到apps下, outer的默认列表为message.html#/messageList
* 在app打开的入口处（这个页面一定运行）index.art加上下面一段话,用作初始化initJpushEvent服务
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
HostMessage: mainHost + '/message/app/',  
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
###### 6. 获取未读的数量，需要进行以下操作
在config.js里面增加以下代码
```js
var jpushStore = new Vuex.Store({
    state: {
        noReadNum: 0
    },
    mutations: {
        // 获取到未读消息的数量
        getNoReadNum (state, res) {
            state.noReadNum = res.num
        }
    },
    actions: {
        // 获取到未读消息的数量
        getNoReadNum (context, res) {
            context.commit('getNoReadNum', res)
        }
    }
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



##### app端使用方法
1. 打包的config里面的id要和打包的包名一致
![ff25284980ce5eeb24318b3f120aa5d2.png](en-resource://database/1642:1)
2. 在通知和消息的详情页里面分别加上返回的页面
##### cordova端打包方法
首先安装1.1.12版本的cordova-plugin-jcore和3.3.2版本的jpush-phonegap-plugin
###### 如果原来安装了需要改变APP_KEY的话，必须要把以下两个插件remove后再安装（不然会因为缓存问题无法接收到）
cordova plugin add cordova-plugin-jcore
cordova plugin add jpush-phonegap-plugin
```js
cordova plugin add cordova-plugin-jcore@1.1.12
cordova plugin add jpush-phonegap-plugin@3.3.2 --variable APP_KEY=your_jpush_appkey
```
安装成功后会发现在package.json和config.xml里面都有相对应的插件
config.xml
```js
    <plugin name="jpush-phonegap-plugin" spec="3.3.2">
        <variable name="APP_KEY" value="6002165890495d4bad3ad8d1" />
    </plugin>
```
package.json
```js
"jpush-phonegap-plugin": {
       "APP_KEY": "6002165890495d4bad3ad8d1"
}
```
注意包名和相对应的key要吻合