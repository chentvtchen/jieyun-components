<template>
    <div class="lechatMessageList flex flex-direction-column">
        <x-header :left-options="{showBack: true, backText: '', preventGoBack: true}" 
        class="header vux-1px-b" @on-click-back="backLastPage">
            {{title}}
        </x-header>
        <!-- 上拉加载更多 -->
        <loadmore class="container flex-1 overflowYScroll"
            :top-method="initAllData"
            @top-status-change="handleTopChange"
            ref="overflowScroll">
            <!-- 顶部展示 -->
            <div slot="top" class="mint-loadmore-top" >
                <div class="word" v-show="topStatus === 'drop'">
                    <inline-loading></inline-loading>
                </div>
            </div>
            <!-- 暂无数据 -->
            <no-data-tip msg="暂无数据" :showFlag="showFlag"></no-data-tip>
            <!-- 加载中 -->
            <loading :show="showLoading && messageList.length == 0" text="加载中"></loading>
            <!-- 数据列表 -->
            <div class="item" 
                v-for="( item , index ) in messageList" 
                :key="index"
                @click="handleClick(index)">
                <div class="time">
                    {{item.createTime | dateTime_format}}
                </div>
                <div class="content">
                    {{item.title}}
                </div>
            </div>
        </loadmore>
    </div>
</template>

<script>
import {XHeader, InlineLoading, Loading, Badge , Divider } from 'vux'
import { Loadmore } from 'mint-ui'
import noDataTip from "message/components/NoDataTip/NoDataTip.vue"
import api from 'message/assets/js/api.js'
import { setTimeout, clearTimeout, setInterval, clearInterval } from 'timers';
import commonFn from 'message/assets/js/commonFn.js'
export default {
    data() {
        return {
            title: '',          //头部展示
            showFlag:false, //暂无数据
            showLoading:true,  //加载中
            loading:true,   //加载更多 true时不触发，false触发
            showLoadingMore:false,  //加载更多
            messageList : [],
            // 查询列表的参数
            params: {
                limitMsgId: '',
                newOrOld: '1',      //查询旧消息
                appIdList: [],
                type: '2',          //查询通知
                maxLimit: 10
            },
            initFlag: true,             //第一次加载
            topStatus: '',               //下拉状态
            isFinishLoad: false
        }       
    },
    components: {
        Badge,
        InlineLoading,
        Loading,
        XHeader,
        Divider,
        Loadmore,
        // 自定义组件
        noDataTip
    },
    mounted(){
        let messageSecListNum = sessionStorage.getItem('messageSecListNum')
        this.initBaiscInfo()
        if(messageSecListNum) {
            let params = common.cloneJson(this.params)
            params.maxLimit = parseInt(messageSecListNum)
            this.getNewsList('return', params);
        }else {
            this.getNewsList();
        }
        // 监听滚动
        this.$nextTick(() => {
            let scrollDiv = document.querySelector('.overflowYScroll')
            scrollDiv.addEventListener('scroll', () => {
                // 滚动到顶部加载更多
                if(!this.isFinishLoad && !this.showLoading) {
                    if(scrollDiv.scrollTop < 10) this.initAllData()
                }
            })
        })
        // 监听通知消息
        document.addEventListener('jpush.receiveNotification', this.getNewInfo, false)
        document.addEventListener('jpush.openNotification', this.getNewInfo, false)
    },
    activated: function () {
        // 不是第一次加载并且是从消息列表页面进来的
        if(!this.initFlag) {
            this.messageList = []
            this.initBaiscInfo()
            let messageSecListNum = sessionStorage.getItem('messageSecListNum')
            if(messageSecListNum) {
                let params = common.cloneJson(this.params)
                params.maxLimit = parseInt(messageSecListNum)
                this.getNewsList('return', params);
            }else {
                this.getNewsList('init');
            }
        }
    },
    methods: {
        // 返回消息页面
        backLastPage() {
            this.$router.push({
                path: '/messageList'
            })
        },
        // 移除缓存
        removeSessionStorage() {
            sessionStorage.removeItem('messageSecListNum')
            sessionStorage.removeItem('messageSecListScrollY')
        },
        initBaiscInfo(){
            let query = this.$route.query
            this.title = query.title
            this.params.appIdList = [query.id]
        },
        // 初始化
        initAllData() {
            this.$refs.overflowScroll.onTopLoaded();
            this.loading = true;
            this.getNewsList('pull')
        },
        // 滚动到底部
        scrollBottom(msg) {
            this.$nextTick(() => {
                let contentDiv = document.querySelector('.mint-loadmore-content')
                let height = contentDiv.offsetHeight 
                if(msg) {
                    document.querySelector('.overflowYScroll').scrollTo({ 
                        top: height, 
                        behavior: "smooth" 
                    });
                }else {
                    document.querySelector('.overflowYScroll').scrollTop = height
                }
            })
        },
        // 获取到一条新的消息的时候
        getNewInfo(event) {
            let params = common.cloneJson(this.params);
            params.limitMsgId = this.messageList[this.messageList.length - 1].id
            // 查找新消息
            params.newOrOld = '0'
            this.getNewsList('revice', params)
            this.updateReadTime()
        },
        // 更新消息的阅读时间
        updateReadTime() {
            let query = this.$route.query
            let params = '?type=' + query.type + '&appId=' + query.appId
            api.readNewsType(params).then( res=>{
                if(res.status === 0) {
                }else {
                    common.toastMsg( res.message )
                }
            })
        },
        // 处理下拉
        handleTopChange(status) {
            this.topStatus = status;
        },
        // 获取通知列表
        // msg为init需要滚动到底部，为pull是下拉加载更多
        getNewsList(msg, paramsObj) {
            let params = common.cloneJson(this.params);
            let beforeHeight = 0
            if(msg === 'pull') {
                // 如果是向上获取旧消息
                if(this.messageList.length > 0) {
                    params.limitMsgId = this.messageList[0].id
                }
            }else if(msg === 'revice' || msg === 'return') {
                params = paramsObj
            }
            // 如果不是第一次加载
            if(!this.initFlag) {
                let contentDiv = document.querySelector('.mint-loadmore-content')
                beforeHeight = common.cloneJson(contentDiv.offsetHeight)
            }
            this.showLoading = true;
            api.getInfoList(params).then( res=>{
                this.showLoading = false;
                if( res.status == 0){
                    // 如果是收到消息，插入尾部
                    if(msg === 'revice') {
                        for(let i in res.data) {
                            this.messageList.push(res.data[i])
                        }
                        if(res.data.length > 0) {
                            common.toastMsg('收到一条新消息', 'normal');
                        }
                        return
                    }else if(msg === 'pull' && res.data.length === 0) {
                        common.toastMsg('已加载全部数据', 'normal');
                    }
                    // 如果有数据
                    if( res.data){
                        let haveTotalFlag = ( res.data.length === 0 )
                        for(let i in res.data) {
                            this.messageList.unshift(res.data[i])
                        }
                        // 显示的数据大于或等于数据总数，则停止加载
                        this.loading = haveTotalFlag;
                        this.isFinishLoad = haveTotalFlag; 
                        this.showLoadingMore = !haveTotalFlag;
                    }
                    this.$nextTick(() => {
                        let scrollDiv = document.querySelector('.overflowYScroll')
                        // 如果是第一次加载
                        if(this.initFlag) {
                            let contentDiv = document.querySelector('.mint-loadmore-content')
                            scrollDiv.scrollTop = contentDiv.offsetHeight;
                        }else {
                            if( res.data && res.data.length > 0){
                                scrollDiv.scrollTop = document.querySelector('.mint-loadmore-content').offsetHeight - beforeHeight;
                            }
                        }
                        if(msg === 'return') {
                            let position = sessionStorage.getItem('messageSecListScrollY') 
                            document.querySelector('.overflowYScroll').scrollTop = position
                            this.removeSessionStorage()
                        }
                    });
                    // 如果是init，滚动到底部
                    if(msg === 'init') {
                        this.scrollBottom()
                    }
                    this.showFlag = ( this.messageList.length == 0 )
                    this.initFlag = false
                }else{
                    common.toastMsg( res.message )
                }
            })
        },
        handleClick(index) {
            let item = this.messageList[index]
            // 如果有跳转链接的话
            let outMeta = JSON.parse(item.outMeta)
            if(outMeta.jumpUrl) {
                let jumpUrl = outMeta.jumpUrl
                this.storageAllData();
                commonFn.formateDetailPath(item, jumpUrl)
            }
        },
        // 缓存跳转的数据
        storageAllData() {       
            let len = this.messageList.length
            let position = document.querySelector('.overflowYScroll').scrollTop //记录离开页面的位置 
            if(!position) position = 0
            len = len > 10 ? len : 10 
            sessionStorage.setItem('messageSecListNum', len)
            sessionStorage.setItem('messageSecListScrollY', position) 
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
.lechatMessageList {
    height: 100%;
    .header.vux-header {
        background: $message_theme_color;
        padding: 2px 0;
        .vux-header-title {
            font-size: 17px;
            color: $message_header_title_color;
        }
        .left-arrow::before {
            border-color: $message_header_info_color;
        }
    }
    .container {
        .item {
            margin: 19px 0 10px 0;
            text-align: center;
            word-break: break-all;
            &:not(:first-child) {
                margin-top: 30px;
            }
            .time {
                display: inline-block;
                padding: 5px 6px;
                background-color: rgba($color: #000000, $alpha: 0.15);
                font-size: 12px;
                line-height: 10px;
                color: #fff;
                border-radius: 3px;
                margin-bottom: 20px;
            }
            .content {
                margin: 0 15px;
                padding: 18.5px 15px;
                background-color: #fff;
                border-radius: 4px;
                text-align: left;
                font-size: 17px;
                color: #181818;
                word-break: break-word;
            }
        }
    }
}
.breakAll {
    word-break: break-all;
}
</style>
