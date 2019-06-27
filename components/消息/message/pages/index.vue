<template>
    <div class="lechatMessage ">
        <div class="lechtMessageWrap flex flex-direction-column">
            <!-- 头部 -->
            <x-header :left-options="{showBack: false}" 
            class="header vux-1px-b">
                <span class="tabItem" :class="{ 'active' : activeNum == 0 }" @click="handleActive(0)">
                    通知
                    <badge class="badge info-badge" v-if="infoTotal && infoTotal > 0" :text="' '"></badge>
                </span>
                <span class="tabItem" :class="{ 'active' : activeNum == 1 }" @click="handleActive(1)">
                    消息
                    <badge class="badge" v-if="messageTotal & messageTotal > 0 && messageTotal < 100" :text="messageTotal"></badge>
                    <badge class="badge" v-if="messageTotal && messageTotal > 99" text="99+"></badge>
                </span>
                <div class="readAll">
                    <img src="~message/assets/img/readAll.png" @click="showMenus = true" alt="一键阅读"/>
                </div>
            </x-header>
            <!-- 下拉刷新，上拉加载 -->
            <div class="container flex-1 overflowYScroll"
                v-infinite-scroll="handleLoadMore"
                infinite-scroll-disabled="loading"
                infinite-scroll-distance="50"
                ref="overflowScroll">
                <!-- 加载中 -->
                <loading :show="showLoading && infoList.length == 0" text="加载中"></loading>
                <loadmore
                    :top-method="initNowData"
                    @top-status-change="handleTopChange"
                    ref="pullMore">
                    <!-- 下拉刷新的提示语 -->
                    <div slot="top" class="mint-loadmore-top" >
                        <div class="word" v-show="topStatus === 'loading' || topStatus === 'drop'">
                            <span v-show="topStatus === 'loading'"><inline-loading></inline-loading>加载中</span>
                            <span v-show="topStatus === 'drop'">松开即可刷新 ↓</span>
                        </div>
                    </div>
                    <!-- 暂无数据 -->
                    <no-data-tip msg="暂无数据" :showFlag="activeNum === 0 && showFlag"></no-data-tip>
                    <!-- 暂无数据 -->
                    <no-data-tip msg="暂无数据" :showFlag="activeNum === 1 && messageShowFlag"></no-data-tip>
                    
                    <swiper v-model="activeNum" @on-index-change="setSwiperHeight"
                    :show-dots="false"
                    :min-moving-distance="120"
                    :threshold="30">
                        <swiper-item>
                            <div ref="infoList">
                                <!-- 通知部分 -->
                                <div class="item flex flex-justify-content-between" v-show="activeNum === 0"
                                    v-for="( item , index ) in infoList" 
                                    :key="'infoList' + index"
                                    @click="handleClick(index)">
                                    <div class="left">
                                        <img v-if="appIdMap[item.appId]" :src="appIdMap[item.appId].iconUrl" :alt="appIdMap[item.appId].name"/>
                                    </div>
                                    <div class="right vux-1px-b">
                                        <div class="title">
                                            <div class="text textLineClamb1 breakAll">{{item.title}}</div>
                                        </div>
                                        <badge class="badge info-badge" v-if="item.unRemind === null || item.unRemind === 0"  text=" "></badge>
                                        <div class="word textLineClamb2 breakAll">
                                            {{item.content}}
                                        </div>
                                        <div class="info">
                                            <img src="~message/assets/img/type.png" alt="类型"/>
                                            <span v-if="appIdMap[item.appId]">{{appIdMap[item.appId].name}}</span>
                                            <span class="time">{{item.createTime | dateTime_format}}</span>
                                        </div>
                                    </div>
                                </div>       
                            </div>       
    
                        </swiper-item>
                        <swiper-item>
                            <div ref="messageList">
                                <!-- 消息部分 -->
                                <div class="item flex flex-justify-content-between"
                                    v-show="activeNum === 1"
                                    v-for="( item , index ) in messageList" 
                                    :key="'messageList' + index"
                                    @click="handleClick(index)">
                                    
                                    <div class="left">
                                        <img v-if="appIdMap[item.appId]" :src="appIdMap[item.appId].iconUrl" :alt="item.name"/>
                                    </div>
                                    <div class="right vux-1px-b">
                                        <div class="title">
                                            <span class="time">{{item.createTime | dateTime_format}}</span>
                                            <div class="text textLineClamb1 breakAll">
                                                {{item.name}}
                                            </div>
                                        </div>
                                        <badge class="badge" v-if="item.count && item.count < 100" :text="item.count"></badge>
                                        <badge class="badge" v-if="item.count && item.count > 99" text="99+"></badge>
                                        <div class="word textLineClamb2 breakAll">
                                            {{item.title}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </swiper-item>
                    </swiper>
                    <!-- 正在加载 -->
                    <div class="loading_tip" style="margin-top:10px;height:20px;margin-bottom:20px;" v-show="activeNum === 0 && showLoadingMore || activeNum === 1 && showLoadingMoreMessage">
                        <p style="text-align:center;">
                            <inline-loading></inline-loading>
                            <span style="vertical-align:middle;display:inline-block;font-size:14px;">正在加载</span>
                        </p>
                    </div>
                </loadmore>
            </div>
        </div>
        <!-- 底部 -->
        <portal-tabbar ref="portalTabbar"></portal-tabbar>
        <!-- <my-tab class="myTab"  :nowPage="nowPage"></my-tab> -->
        <actionsheet :menus="menus" v-model="showMenus" show-cancel @on-click-menu="handleReadAll"></actionsheet>
    </div>
</template>

<script>
import {XHeader, Actionsheet, InlineLoading, Loading, Badge , Divider, Swiper, SwiperItem } from 'vux'
import { Loadmore } from 'mint-ui'
// import MyTab from 'protal/components/footer/index.vue'
import noDataTip from "message/components/NoDataTip/NoDataTip.vue"
import api from 'message/assets/js/api.js'
import { setTimeout } from 'timers';
import commonFn from 'message/assets/js/commonFn.js'

import portalTabbar from 'components/Portal/PortalMenu'
 
export default {
    prop: {
    },
    data() {
        return {
            activeNum: 1,               //激活的是通知还是消息
            showFlag:false, //暂无数据
            messageShowFlag: false,         //暂无数据
            showLoading:true,  //加载中
            loading:true,   //加载更多 true时不触发，false触发
            showLoadingMore:false,  //加载更多
            showLoadingMoreMessage:false,  //加载更多
            menus: {
                readAll: '一键阅读'
            },
            showMenus: false,
            // 通知列表
            infoList: [],
            // 消息列表
            messageList : [],
            messageListMap: {},
            messageIdList: [],
            topStatus: '',
            infoTotal: 0,
            messageTotal: 0,
            messageImg: {},
            maxLimit: 10,
            // 查询列表的参数
            params: {
                limitMsgId: '',
                newOrOld: '1',      //查询旧消息
                type: '1',          //查询通知
                maxLimit: 10
            },
            // 用来缓存应用的信息，通过id查找
            appIdMap: {},
            nowPage: 3,
        }
    },
    components: {
        Badge,
        Actionsheet,
        InlineLoading,
        Loading,
        XHeader,
        Divider,
        Loadmore,
        Swiper,
        SwiperItem,
        // 自定义组件
        noDataTip,
        portalTabbar
        // MyTab
    },
    watch: { 
        '$route' (to, from) { 
            //跳转的的页面的名称是这个列表页面
            if (to.name === 'messageList') {
                this.getStoragePostion()
                this.activeNum = parseInt(sessionStorage.getItem('messageListActiveName'));
            } 
        },
    },
    mounted(){
        this.$nextTick(() => {
            let activeNum = sessionStorage.getItem('messageListActiveName')
            if(activeNum) {
                this.activeNum = parseInt(activeNum);
                this.loading = true;
                this.getInfoList('return', parseInt(sessionStorage.getItem('infoListNum')));
                this.removeSessionStorage()
            }else {
                let activeNum = this.$route.query.activeNum
                if(activeNum) this.activeNum = parseInt(activeNum);
                this.getInfoList('init')
            }
        })
        document.addEventListener('jpush.receiveNotification', this.getNewInfo, false)
        document.addEventListener('jpush.openNotification', this.getNewInfo, false)
        this.$refs.portalTabbar.initPortalMenu('message.html?index=4/#/messageList');

    },
    beforeRouteLeave(to, from, next) { 
        this.storageAllData()
        next()
    },
    activated: function () {
        let initAllData = localStorage.getItem('messageInitAllData')
        // 点击消息并且返回到这个页面
        if(initAllData === 'true') {
            this.infoTotal = 0
            this.infoList = []
            this.getInfoListApi(this.params)
            this.messageTotal = 0
            this.messageList = []
            this.getMessageTotal('pull')
            localStorage.setItem('messageInitAllData', 'false')
        }
    },
    methods: {
        // 移除缓存的数据
        removeSessionStorage() {
            sessionStorage.removeItem('messageListActiveName');
            sessionStorage.removeItem('infoListNum');
        },
        // 重新设置高度
        setSwiperHeight(index) {
            this.$nextTick(() => {
                let name = (index === 0) ? 'infoList' : 'messageList'
                let height = this.$refs[name].clientHeight
                let allHeight = document.getElementsByClassName('overflowYScroll')[0].clientHeight
                // 最小高度为容器的高度
                if(height < allHeight) height = allHeight
                document.getElementsByClassName("vux-swiper")[0].style.height = height + 'px';
            })
        },
        // 接收到新的消息
        getNewInfo() {
            let params = common.cloneJson(this.params)
            this.infoTotal = 0
            if(this.infoList.length > 0) {
                params.limitMsgId = this.infoList[0].id
            }
            params.newOrOld = '0'       //查询新消息
            this.getInfoListApi(params, 'pull')
            this.messageTotal = 0
            this.getMessageTotal('pull')
        },
        // 下拉刷新
        initNowData() {
            this.$refs.pullMore.onTopLoaded();
            this.getInfoList('pull');
        },
        storageAllData() {
            sessionStorage.setItem('messageListActiveName', this.activeNum)
            sessionStorage.setItem('infoListNum', this.infoList.length)
            this.storagePosition()
        },
        // 缓存位置
        storagePosition() {
            let position = this.$refs.overflowScroll.scrollTop //记录离开页面的位置 
            let storeName = this.activeNum === 0 ? 'infoListScrollY' : 'messageListScrollY'
            position = position ? position : 0 
            sessionStorage.setItem(storeName, position) //离开路由时把位置存起来 
        },
        // 回显位置
        getStoragePostion() {
            this.$nextTick(() => {
                let storeName = this.activeNum === 0 ? 'infoListScrollY' : 'messageListScrollY'
                this.$refs.overflowScroll.scrollTop = parseFloat(sessionStorage.getItem(storeName));
                sessionStorage.removeItem(storeName);
            })
        },
        // 获取拉动的状态
        handleTopChange(status) {
            this.topStatus = status;
        },
        // 获取通知列表
        getInfoList(msg, num) {
            let params = common.cloneJson(this.params)
            // 如果是回显
            // 下拉刷新
            if(msg === 'pull') {
                if(this.activeNum === 0) {
                    this.infoTotal = 0
                    if(this.infoList.length > 0) {
                        params.limitMsgId = this.infoList[0].id
                    }
                    params.newOrOld = '0'       //查询新消息
                    this.getInfoListApi(params, msg)
                }else {
                    this.messageTotal = 0
                    this.getMessageTotal(msg)
                }
            }else {
                this.showLoading = true;
                if(msg === 'return') {
                    params.maxLimit = num
                }
                this.getInfoListApi(params, msg)
                this.getMessageTotal(msg)
            }
        },
        // 获取消息通知列表
        getInfoListApi(params, msg) {
            api.getInfoList(  params ).then( res=>{
                this.showLoading = false;
                if( res.status == 0){
                    if(msg === 'pull') {
                        res.data.forEach((item, index) =>{
                            this.infoList.unshift(item)
                        })
                        this.loading = false
                        return
                    }
                    if(res.data){
                        // 加载完全部数据
                        let haveTotalFlag = null
                        res.data.forEach((item, index) => {
                            this.infoList.push(item)
                        })
                        // 获取到空数组
                        haveTotalFlag = ( res.data.length === 0 ) || (  res.data.length  < this.params.maxLimit)
                        this.showLoadingMore = !haveTotalFlag;
                        this.$nextTick(() => {
                            this.loading = haveTotalFlag;
                            // 如果是返回
                            if(msg === 'return' && this.activeNum === 0) {
                                this.getStoragePostion()
                            }
                        })
                        this.setSwiperHeight(0);
                    }
                    this.showFlag = ( this.infoList.length == 0 )
                }else{
                    common.toastMsg( res.message )
                }
            })
            if(msg !== 'more') {
                this.getInfoNum(msg)
            }
        },
        // 获取通知中的未读消息
        getInfoNum(msg) {
            api.getInfoNum({
                type: '1'
            }).then( res=>{
                if( res.status == 0){
                    this.infoTotal = res.data
                    this.getNoReadNum(this.messageTotal + this.infoTotal)
                }else{
                    common.toastMsg( res.message )
                }
            })
        },
        getObjLen(obj) {
            let len = 0;
            for(let i in obj) {
                len++
            }
            return len
        },
        // 获取消息的所有信息
        getMessageTotal(msg) {
            // 初始化的时候需要加载
            if(!msg || msg === 'init' || msg === 'return') {
                // 获取消息类型
                api.getNewsType().then( res=>{
                    if(res.status === 0) {
                        let data = res.data;
                        if(data) {
                            data.forEach((item, index) => {
                                let ele = this.messageListMap[item.id]
                                if(!ele) ele = {}
                                this.messageListMap[item.id] = Object.assign(ele, item)
                                this.appIdMap[item.id] = item
                            })
                        }
                    }else {
                        common.toastMsg( res.message )
                    }
                })
            }
            // 获取最新一条消息
            api.getNewsLastMsg().then( res=>{
                if(res.status === 0) {
                    let data = res.data;
                    let arr = [];
                    if(data) {
                        data.forEach((item, index) => {
                            let ele = this.messageListMap[item.appId]
                            if(!ele) ele = {}
                            this.messageListMap[item.appId] = Object.assign(ele, item)
                            arr.push(item.appId)
                        })
                    }
                    this.messageShowFlag = (data.length === 0)
                    this.messageIdList = arr
                    this.getNewsInfoNum()
                }else {
                    common.toastMsg( res.message )
                }
            })
        },
        // 获取消息未读的数量
        getNewsInfoNum(msg) {
            // 获取消息未读的数量
            api.getNewsInfoNum().then( res=>{
                if(res.status === 0) {
                    let total = 0
                    let data = res.data;
                    if(data) {
                        let arr = []
                        data.forEach((item, index) => {
                            let ele = this.messageListMap[item.appId]
                            if(!ele) ele = {}
                            this.messageListMap[item.appId] = Object.assign(ele, item)
                            total += item.count
                        })
                        this.messageIdList.forEach((item, index) => {
                            arr.push(this.messageListMap[item])
                        })
                        this.messageTotal = total
                        this.messageList = arr
                        this.setSwiperHeight(1)
                        // 如果是返回
                        if(msg === 'return' && this.activeNum === 1) {
                            this.getStoragePostion()
                        }
                    }
                    this.getNoReadNum(this.messageTotal + this.infoTotal)
                    this.showLoadingMoreMessage = false;
                }else {
                    common.toastMsg( res.message )
                }
            })
        },
        // 切换tab标签
        handleActive(index) {
            if(index === this.activeNum) return
            this.storagePosition()
            this.activeNum = index;
            this.setSwiperHeight(index)
            this.getStoragePostion()
        },
        // 加载更多
        handleLoadMore(){
            // 只有在通知页面才拉动
            if(this.activeNum === 0) {
                this.params.limitMsgId = this.infoList[this.infoList.length - 1].id
                this.loading = true;
                this.getInfoListApi(this.params, 'more')
            }
        },
        // 点击查看详情页
        handleClick(index) {
            (this.activeNum === 0) ? this.clickToDetail(index) : this.updateReadTime(index)
        },
        // 跳转到详情页
        clickToDetail(index) {
            let item = this.infoList[index]
            let url = this.appIdMap[item.appId].jumpUrl
            // 如果被阅读过，直接跳转
            if(item.unRemind) {
                this.storageAllData()
                commonFn.formateDetailPath(item, url) 
                return
            }
            let params = '?msgId=' + item.id
            api.readOne(params).then( res=>{
                if(res.status === 0) {
                    this.infoList[index].unRemind = 1
                    if(this.infoTotal > 0) {
                        this.infoTotal --
                        this.getNoReadNum(this.infoTotal + this.messageTotal)
                    }
                    this.storageAllData()
                    commonFn.formateDetailPath(item, url)
                }else {
                    common.toastMsg( res.message )
                }
            })
        },
        // 更新消息的阅读时间
        updateReadTime(index) {
            let item = this.messageList[index];
            let params = '?type=' + item.type + '&appId=' + item.appId
            api.readNewsType(params).then( res=>{
                if(res.status === 0) {
                    this.messageTotal -= item.count
                    this.getNoReadNum(this.infoTotal + this.messageTotal)
                    item.count = 0
                    this.$router.push({
                        path: '/messageSecList',
                        query: {
                            title: item.name,
                            id: item.appId,
                            jumpUrl: item.jumpUrl,
                            type: item.type
                        }
                    })
                }else {
                    common.toastMsg( res.message )
                }
            })
        },
        // 阅读全部
        handleReadAll(key, item) {
            let total = this.infoTotal + this.messageTotal
            // 如果为一键阅读
            if(key === 'readAll' && total > 0) {
                api.readAll().then( res=>{
                    if(res.status === 0) {
                        this.infoTotal = 0;
                        this.messageTotal = 0;
                        this.infoList.forEach((ele, index) => {
                            ele.unRemind = 1  
                        })
                        this.messageList.forEach((ele, index) => {
                            ele.count = 0  
                        })
                        this.getNoReadNum(0)
                        common.toastMsg('全部已读', 'success');
                    }else {
                        common.toastMsg( res.message )
                    }
                })
            }
        },
        // 改变store里面的未读数量
        getNoReadNum(total) {
            $jpushStore.dispatch('getNoReadNum', {
                num: total
            })
        }
    }
}
</script>

<style lang="scss">
@import '~apps/message/assets/css/common.scss';
$message_info_color: #808080;
.mint-loadmore-top {
    .word {
        padding: 10px 0;
        color: #666;
        text-align: center;
    }
}
.lechatMessage {
    height: 100%;
    background-color: #fff;
    position:relative;
    .lechtMessageWrap{
        position: absolute;
        top: 0px;
        bottom: 50px;
        left: 0px;
        right: 0px;
    }
    .weui-mask_transparent{
        bottom:50px;
    }
    .header.vux-header {
        background: $message_theme_color;
        padding: 0;
        position: relative;
        .readAll {
            position: absolute;
            top: 0;
            right: 14px;
            height: 38px;
            padding: 0 10px;
            img {
                width: 23px;
            }
        }
        .vux-header-title {
            color: $message_header_info_color;
            padding: 2px 0;
            .tabItem {
                position: relative;
                font-size: 17px;
                padding: 0 20px;
                &.active {
                    font-weight: 600;
                    color: $message_header_title_color;
                    &:after{
                        content:'';
                        position: absolute;
                        bottom: 2px;
                        width:30px;
                        height:3px;
                        left: 21px;
                        border-radius: 10px;
                        background:#f25300;
                    }
                }
                .badge {
                    position: absolute;
                    right: 5px;
                    top: 2px;
                    line-height: 1;
                    box-sizing: border-box;
                    height: 19px;
                    width: auto;
                    min-width: 19px;
                    padding: 3px 5.3px;
                    padding-bottom: 0;
                    border-radius: 19px;
                    border: 1px solid #fff;
                    font-weight: 400;
                    &.info-badge {    
                        height: 8px;
                        width: 8px;
                        right: 15px;
                        top: 8px;
                        padding: 0;
                        min-width: auto;
                    }
                }
            }
        }
        .left-arrow::before {
            border-color: $message_header_info_color;
        }
        .vux-header-more {
            color: $message_header_default_color;
        }
    }
    .container {
        .item {
            background-color: #fff;
            position: relative;
            word-wrap: break-word;
            .left {
                padding: 10px 15px;
                box-sizing: border-box;
                img {
                    width: 50px;
                    border-radius: 50%;
                }
            }
            .right {
                width: 100%;
                padding: 15px 10px 0 0;
                margin-bottom: 1px;
                .title {
                    font-size: 17px;
                    line-height: 22px;
                    color: #181818;
                    margin-bottom: 4px;
                    .time {
                        float: right;
                        font-size: 13px;
                        margin-top: 1px;
                        color: #909090;
                    }
                }
                .word {
                    font-size: 14px;
                    line-height: 20px;
                    margin-bottom: 15px;
                    margin-right: 30px;
                    color: $message_info_color;
                    position: relative;
                }
                .badge {
                    position: absolute;
                    top: 45px;
                    right: 10px;
                    line-height: 1;
                    box-sizing: border-box;
                    height: 19px;
                    width: auto;
                    min-width: 19px;
                    padding: 3px 5.3px;
                    padding-bottom: 0;
                    border-radius: 19px;
                    border: 1px solid #fff;
                    &.info-badge {
                        height: 8px;
                        width: 8px;
                        min-width: auto;
                        top: 42px;
                        right: 11px;
                        padding: 0;
                    }
                    & + .text {
                        width: calc(100% - 50px)
                    }
                }
                .info {
                    color: #909090;
                    font-size: 12px;
                    line-height: 12px;
                    margin-bottom: 9px;
                    >* {
                        vertical-align: middle;
                    }
                    >img {
                        width: 12px;
                    }
                    .time {
                        font-size: 13px;
                        float: right;
                    }
                }
            }
        }
    }
}
.breakAll {
    word-break: break-all;
}
</style>
