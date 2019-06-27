
import lechatMessage from '../pages/index.vue'
import lechatMessageSec from '../pages/messageList.vue'
import lechatMessageDetail from '../pages/detail.vue'

var routes = [
    // 主页（列表）页面
    {
        path: '/messageList',
        name: 'messageList',
        component: lechatMessage,
        meta: {
            requireAuth: false,
            keepAlive: true,
            title: '消息通知'
        }
    },
    // 主页（列表）页面
    {
        path: '/messageSecList',
        name: 'messageSecList',
        component: lechatMessageSec,
        meta: {
            requireAuth: false,
            keepAlive: true,
            title: '消息详情列表'
        }
    },
    // 主页（列表）页面
    {
        path: '/messageDetail',
        name: 'messageDetail',
        component: lechatMessageDetail,
        children: [],
        meta: {
            requireAuth: false,
            title: '消息详情'
        }
    }
]

export default routes