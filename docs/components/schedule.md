###### 使用
压缩包解压放到apps目录下面
![](https://upload-images.jianshu.io/upload_images/2216204-0495df1b7c85b3c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###### 地址
devConstGlobal.js
```
    HostSchedule: 'http://192.168.108.11:9301/schedule/',       // 日程
    HostStaffOrg: 'http://192.168.108.11:9818/staffOrg/',       // 日程下的选人组件
```
constGlobal.js
```
    HostSchedule: mainHost + '/apps/schedule/',
    HostStaffOrg: mainHost + '/apps/staffOrg/',
```
###### 主题色改变
* 配置vux改变主题色的插件
![](https://upload-images.jianshu.io/upload_images/2216204-edff1016e4c2c555.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* src/assets下面增加两个文件
```less
theme.less
    @theme-schedule: #4691ff;
    @theme-schedule-color: @theme-schedule;
    @checklist-icon-active-color:@theme-schedule;
    @popup-header-right-text-color: @theme-schedule;
```
```scss
theme.scss
    $theme-schedule: #4691ff;
```
原来的public加上一行
```scss
public.scss
    @import '~assets/css/theme.scss';
```
* 通过设置theme.less和theme.scss中的theme-schedule变量改变主题色(theme.less会改变vux相应组件的颜色)
###### dependencies
```
        "alloyfinger": "0.1.11",
        "art-template": "4.12.2",
        "axios": "0.15.3",
        "babel-polyfill": "6.23.0",
        "es6-promise": "4.1.0",
        "fastclick": "1.0.6",
        "font-awesome": "4.7.0",
        "iscroll": "5.2.0",
        "js-cookie": "2.1.4",
        "lockr": "0.8.4",
        "lodash": "4.17.2",
        "mint-ui": "2.2.9",
        "moment": "2.20.1",
        "nprogress": "0.2.0",
        "vue": "2.5.13",
        "vue-carousel-3d": "0.1.19",
        "vue-i18n": "5.0.3",
        "vue-resource": "1.3.5",
        "vue-router": "2.5.3",
        "vue-touch": "2.0.0-beta.4",
        "vuex": "2.3.1",
        "vux": "2.7.5",
        "vux-loader": "1.1.29"
```